/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  validateAndRecalculatePricing,
  recalculateTax,
  getTaxSettings,
  validateShippingCost,
} from '../_shared/pricing-validation.ts';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Supabase URL or Service Role Key is not set. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are defined in Edge Function environment variables.'
  );
}
const supabase = createClient(supabaseUrl || '', supabaseServiceRoleKey || '');

// lomi. API Config
const LOMI_SECRET_KEY = Deno.env.get('LOMI_SECRET_KEY');
const LOMI_API_BASE_URL =
  Deno.env.get('LOMI_API_BASE_URL') || 'https://api.lomi.africa';
const APP_BASE_URL = (
  Deno.env.get('APP_BASE_URL') || 'http://localhost:3000'
).replace(/\/$/, ''); // Remove trailing slash

interface CartItem {
  productId: string;
  productTitle: string;
  productSlug?: string;
  variantId?: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  productImageUrl?: string;
}

interface RequestPayload {
  cartItems: CartItem[];
  currencyCode?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userOrganization?: string;
  userWhatsApp?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    phone?: string;
  };
  shippingFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  successUrlPath?: string;
  cancelUrlPath?: string;
  allowCouponCode?: boolean;
  allowQuantity?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        error:
          'Supabase environment variables not configured for the function.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
  if (!LOMI_SECRET_KEY) {
    console.error('LOMI_SECRET_KEY is not set for the function.');
    return new Response(
      JSON.stringify({
        error: 'lomi. API key not configured for the function.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  try {
    const payload: RequestPayload = await req.json();
    console.log('Received cart payload:', JSON.stringify(payload, null, 2));

    // --- Validate Input ---
    const requiredFields: (keyof RequestPayload)[] = [
      'cartItems',
      'userName',
      'userEmail',
      'shippingAddress', // Ensure validation checks for the object existence
    ];
    for (const field of requiredFields) {
      if (
        !(field in payload) ||
        payload[field] === undefined ||
        payload[field] === null ||
        (typeof payload[field] === 'string' && String(payload[field]).trim() === '')
      ) {
        return new Response(
          JSON.stringify({
            error: `Missing or invalid required field: ${field}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
    }

    // Explicitly validate address field inside shippingAddress
    if (!payload.shippingAddress?.address || payload.shippingAddress.address.trim() === '') {
        return new Response(
          JSON.stringify({
            error: `Missing or invalid required field: shippingAddress.address`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
    }

    if (!Array.isArray(payload.cartItems) || payload.cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart items must be a non-empty array.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate each cart item
    for (let i = 0; i < payload.cartItems.length; i++) {
      const item = payload.cartItems[i];
      if (
        !item.productId ||
        !item.productTitle ||
        !item.price ||
        !item.quantity
      ) {
        return new Response(
          JSON.stringify({
            error: `Invalid cart item at index ${i}: missing required fields`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      if (item.quantity <= 0) {
        return new Response(
          JSON.stringify({
            error: `Invalid quantity for item at index ${i}: must be greater than 0`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
    }

    // --- Upsert Customer using RPC ---
    console.log('Creating/updating customer using RPC function');
    const { data: customerId, error: customerError } = await supabase.rpc(
      'upsert_customer',
      {
        p_name: payload.userName,
        p_email: payload.userEmail,
        p_phone: payload.userPhone || null,
        p_whatsapp: payload.userWhatsApp || payload.userPhone || null,
        p_organization: payload.userOrganization || null,
      }
    );

    if (customerError || !customerId) {
      console.error('Error upserting customer:', customerError);
      return new Response(
        JSON.stringify({
          error: `Error creating/updating customer: ${customerError?.message || 'No customer ID returned'}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Customer upserted successfully:', customerId);

    // --- Validate and normalize currency code ---
    let currencyCode = (payload.currencyCode || 'XOF').toUpperCase();
    const validCurrencies = ['XOF', 'EUR', 'USD'];
    if (!validCurrencies.includes(currencyCode)) {
      console.warn(`Invalid currency code "${currencyCode}", defaulting to XOF`);
      currencyCode = 'XOF';
    }

    // --- Validate and recalculate pricing from source of truth (Sanity) ---
    const clientSubtotal = payload.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const clientDiscount = payload.discountAmount || 0;

    console.log('Validating pricing against Sanity...');
    const pricingValidation = await validateAndRecalculatePricing(
      payload.cartItems,
      currencyCode as 'XOF' | 'EUR' | 'USD',
      clientSubtotal,
      clientDiscount
    );

    // Handle critical errors (product not found, etc.)
    if (pricingValidation.hasCriticalErrors) {
      console.error('Pricing validation failed with critical errors:');
      pricingValidation.errors.forEach((error) => console.error(`  - ${error}`));
      return new Response(
        JSON.stringify({
          error: 'Pricing validation failed',
          details: pricingValidation.errors,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Log warnings (price mismatches, etc.)
    if (pricingValidation.warnings.length > 0) {
      console.warn('Pricing validation found discrepancies (non-critical):');
      pricingValidation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
      console.warn('Using server-validated prices instead of client-provided prices');
    }

    // Use validated prices (server is source of truth)
    // Note: pricingValidation.subtotal is the discounted subtotal (current prices)
    // pricingValidation.originalSubtotal is the original subtotal (original prices)
    const discountedSubtotal = pricingValidation.subtotal;
    const originalSubtotal = pricingValidation.originalSubtotal;
    const discountAmount = pricingValidation.discount;

    // Validate shipping cost
    const shippingFee = payload.shippingFee || 0;
    const shippingValidation = validateShippingCost(shippingFee);
    if (!shippingValidation.isValid) {
      console.warn(`Shipping cost validation: ${shippingValidation.error}`);
      // For now, we'll still use the client-provided shipping fee
      // but log the warning for monitoring
    }

    // Recalculate tax using validated subtotal
    const taxSettings = await getTaxSettings();
    // Tax should be calculated on the discounted subtotal
    // Match cart summary logic: tax is calculated on (subtotal - discount)
    // Note: This matches the cart summary calculation: tempSummary.subtotal - tempSummary.discount
    // Even though discountedSubtotal is already discounted, we subtract discount again to match cart summary behavior
    const taxBaseAmount = discountedSubtotal - discountAmount;
    const taxAmount = recalculateTax(
      taxBaseAmount,
      currencyCode as 'XOF' | 'EUR' | 'USD',
      taxSettings
    );

    // Validate tax amount if client provided one
    const clientTaxAmount = payload.taxAmount || 0;
    const taxDifference = Math.abs(taxAmount - clientTaxAmount);
    if (taxDifference > 0.01) {
      console.warn(
        `Tax amount mismatch: client sent ${clientTaxAmount.toFixed(2)} ${currencyCode}, but server calculated ${taxAmount.toFixed(2)} ${currencyCode}. Using server-calculated value.`
      );
    }

    // Calculate total amount
    // Formula: total = discountedSubtotal + shipping + tax
    // Where:
    //   - discountedSubtotal = sum of item prices AFTER discount (validated from Sanity, already discounted)
    //   - discount = discount amount (if originalPrice > currentPrice) - already applied to discountedSubtotal
    //   - shipping = shipping fee
    //   - tax = tax calculated on discounted subtotal
    // Note: discountedSubtotal from pricing validation is already the discounted price, so we don't subtract discount again
    const totalAmount = discountedSubtotal + shippingFee + taxAmount;

    console.log('Final pricing breakdown:', {
      originalSubtotal: `${originalSubtotal.toFixed(2)} ${currencyCode}`,
      discount: `${discountAmount.toFixed(2)} ${currencyCode}`,
      discountedSubtotal: `${discountedSubtotal.toFixed(2)} ${currencyCode}`,
      shipping: `${shippingFee.toFixed(2)} ${currencyCode}`,
      tax: `${taxAmount.toFixed(2)} ${currencyCode}`,
      total: `${totalAmount.toFixed(2)} ${currencyCode}`,
    });

    // --- Create Order using RPC ---
    console.log('Creating order using RPC function');
    const shippingAddressJson = payload.shippingAddress
      ? {
          name: payload.shippingAddress.name,
          address: payload.shippingAddress.address,
          city: payload.shippingAddress.city,
          country: payload.shippingAddress.country,
          postalCode: payload.shippingAddress.postalCode || null,
          phone: payload.shippingAddress.phone || null,
        }
      : null;

    const { data: orderId, error: orderError } = await supabase.rpc(
      'create_order',
      {
        p_customer_id: customerId,
        p_total_amount: totalAmount,
        p_currency_code: currencyCode,
        p_shipping_fee: shippingFee,
        p_tax_amount: taxAmount,
        p_discount_amount: discountAmount,
        p_shipping_address: shippingAddressJson,
      }
    );

    if (orderError || !orderId) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({
          error: `Error creating order: ${orderError?.message || 'No order ID returned'}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Order created successfully:', orderId);

    // --- Create Order Items using validated prices ---
    for (let i = 0; i < payload.cartItems.length; i++) {
      const item = payload.cartItems[i];
      // Use validated price from pricing validation (items are in same order)
      const validatedItem = pricingValidation.recalculatedItems[i];
      // Use validated price if available and valid (> 0), otherwise fall back to client price
      // Note: If hasCriticalErrors is true, we shouldn't reach here, but this is a safety check
      const validatedPricePerItem =
        validatedItem && validatedItem.validatedPrice > 0
          ? validatedItem.validatedPrice / item.quantity
          : item.price;
      const itemTotal = validatedPricePerItem * item.quantity;

      console.log(`Creating order item for ${item.productTitle}`, {
        clientPrice: item.price,
        validatedPrice: validatedPricePerItem,
        quantity: item.quantity,
        total: itemTotal,
      });

      const { error: itemError } = await supabase.rpc('create_order_item', {
        p_order_id: orderId,
        p_product_id: item.productId,
        p_product_title: item.productTitle,
        p_product_slug: item.productSlug || null,
        p_variant_id: item.variantId || null,
        p_variant_title: item.variantTitle || null,
        p_quantity: item.quantity,
        p_price_per_item: validatedPricePerItem, // Use validated price
        p_total_amount: itemTotal,
        p_product_image_url: item.productImageUrl || null,
      });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        return new Response(
          JSON.stringify({
            error: `Error creating order item: ${itemError.message}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    console.log(
      `Created ${payload.cartItems.length} order items for order ${orderId}`
    );

    // --- Prepare lomi. Payload ---
    const successRedirectPath = payload.successUrlPath || '/payment/success';
    const cancelRedirectPath = payload.cancelUrlPath || '/payment/error';

    // Use DIRECT CHARGE (amount-based) instead of line_items
    // This allows dynamic pricing without pre-configured products in lomi
    // lomi. supports XOF, EUR, and USD currencies
    // currency_code must be ISO 4217 currency code (XOF, EUR, USD) - never "F CFA"
    const lomiPayload = {
      success_url: `${APP_BASE_URL}${successRedirectPath}?order_id=${encodeURIComponent(orderId)}&status=success`,
      cancel_url: `${APP_BASE_URL}${cancelRedirectPath}?order_id=${encodeURIComponent(orderId)}&status=cancelled`,
      // Direct charge: specify total amount instead of line_items
      amount: totalAmount,
      // Currency code: XOF, EUR, or USD (ISO 4217 format)
      currency_code: currencyCode,
      customer_email: payload.userEmail,
      customer_name: payload.userName,
      ...(payload.userPhone && { customer_phone: payload.userPhone }),
      customer_city: payload.shippingAddress?.city,
      customer_country: payload.shippingAddress?.country,
      customer_address: payload.shippingAddress?.address,
      customer_postal_code: payload.shippingAddress?.postalCode,
      // Optional: Add title and description for the charge
      title: `Order #${orderId.substring(0, 8)}`,
      description: `${payload.cartItems.length} item(s): ${payload.cartItems.map(item => item.productTitle).join(', ').substring(0, 100)}`,
      allow_coupon_code:
        payload.allowCouponCode !== undefined
          ? payload.allowCouponCode
          : true,
      allow_quantity: false, // Direct charge doesn't support quantity adjustment
      metadata: {
        internal_order_id: orderId,
        customer_id: customerId,
        app_source: 'kysfactory_store',
        item_count: payload.cartItems.length,
        total_shipping_cost: shippingFee,
        total_tax: taxAmount,
        total_discount: discountAmount,
        // Store cart items in metadata for reference
        cart_items: payload.cartItems.map((item, index) => {
          const validatedItem = pricingValidation.recalculatedItems[index];
          const validatedPricePerItem =
            validatedItem && validatedItem.validatedPrice > 0
              ? validatedItem.validatedPrice / item.quantity
              : item.price;
          return {
            product_id: item.productId,
            product_title: item.productTitle,
            variant_id: item.variantId,
            variant_title: item.variantTitle,
            quantity: item.quantity,
            price_per_item: validatedPricePerItem,
            total: validatedPricePerItem * item.quantity,
            image_url: item.productImageUrl
          };
        }),
      },
    };

    console.log(
      'Calling lomi. API with URL:',
      `${LOMI_API_BASE_URL}/checkout-sessions`
    );
    console.log('Final lomi. payload:', JSON.stringify(lomiPayload, null, 2));

    // --- Call lomi. API ---
    const lomiResponse = await fetch(`${LOMI_API_BASE_URL}/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LOMI_SECRET_KEY,
      },
      body: JSON.stringify(lomiPayload),
    });

    console.log('lomi. API response status:', lomiResponse.status);
    console.log(
      'lomi. API response headers:',
      Object.fromEntries(lomiResponse.headers.entries())
    );

    // Get response text first to handle both JSON and HTML responses
    const lomiResponseText = await lomiResponse.text();
    console.log('lomi. API response body:', lomiResponseText);

    let lomiResponseData;
    try {
      lomiResponseData = JSON.parse(lomiResponseText);
    } catch (parseError) {
      console.error('Failed to parse lomi. API response as JSON:', parseError);
      console.error('Response was:', lomiResponseText);

      // Update order status to failed using RPC
      // Use NULL for lomi_session_id to avoid unique constraint violations
      // Failure details are stored in payment_processor_details
      await supabase.rpc('update_order_lomi_session', {
        p_order_id: orderId,
        p_lomi_session_id: null,
        p_lomi_checkout_url: null,
        p_payment_processor_details: {
          error: 'Invalid JSON response from lomi. API',
          response: lomiResponseText,
          failure_reason: 'invalid_json_response',
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Invalid response from payment provider',
          details:
            'The payment provider returned an invalid response. Please try again later.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        }
      );
    }

    if (!lomiResponse.ok || !lomiResponseData.checkout_session_id) {
      console.error('lomi. API error:', lomiResponseData);

      // Update order with failure details using RPC
      // Use NULL for lomi_session_id to avoid unique constraint violations
      // Failure details are stored in payment_processor_details
      await supabase.rpc('update_order_lomi_session', {
        p_order_id: orderId,
        p_lomi_session_id: null,
        p_lomi_checkout_url: null,
        p_payment_processor_details: {
          ...lomiResponseData,
          failure_reason: 'lomi_api_error',
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to create lomi. checkout session',
          details: lomiResponseData.error || lomiResponseData,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: lomiResponseData.error?.status || 500,
        }
      );
    }

    // --- Use checkout URL directly from lomi. API response ---
    const checkoutUrl = lomiResponseData.checkout_url;

    // --- Update Order with lomi. details using RPC ---
    const { error: updateOrderError } = await supabase.rpc(
      'update_order_lomi_session',
      {
        p_order_id: orderId,
        p_lomi_session_id: lomiResponseData.checkout_session_id,
        p_lomi_checkout_url: checkoutUrl,
        p_payment_processor_details: {
          request: lomiPayload,
          response: lomiResponseData,
        },
      }
    );

    if (updateOrderError) {
      // Check if this is the expected "already has session ID" warning
      const isDuplicateSessionError = updateOrderError.message?.includes(
        'already has a lomi session ID'
      );

      if (isDuplicateSessionError) {
        console.log(
          'Order already has lomi session details (likely from retry), proceeding with existing checkout URL'
        );
      } else {
        console.warn(
          'Failed to update order record with lomi. details, but checkout URL obtained:',
          updateOrderError
        );
      }
    }

    console.log(
      'Successfully created checkout session:',
      lomiResponseData.checkout_session_id
    );

    // --- Success Response ---
    return new Response(
      JSON.stringify({
        checkout_url: checkoutUrl,
        order_id: orderId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      '!!!!!!!!!! CAUGHT ERROR in main try/catch !!!!!!!!!:',
      error
    );
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(
      JSON.stringify({ error: message, details: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
