/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';
import { EmailTemplateEngine } from '../_shared/order-email.ts';


// --- Environment Variables ---
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail = Deno.env.get('FROM_EMAIL') || 'notifications@orders.kysfactoryciv.com';
const ownerEmailString = Deno.env.get('OWNER_EMAIL') || 'latelierkysllc@gmail.com';
const ownerEmails = ownerEmailString.split(',').map(email => email.trim()).filter(email => email.length > 0);
const replyEmail = Deno.env.get('REPLY_EMAIL') || 'latelierkysllc@gmail.com';

// --- Environment Validation ---
if (!supabaseUrl || supabaseUrl.trim() === '') {
  console.error('SUPABASE_URL environment variable is missing or empty');
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === '') {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is missing or empty'
  );
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

if (!resendApiKey || resendApiKey.trim() === '') {
  console.error('RESEND_API_KEY environment variable is missing or empty');
  throw new Error('RESEND_API_KEY environment variable is required');
}

// --- Main Serve Function ---
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let orderIdFromRequest: string | null = null;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const resend = new Resend(resendApiKey);

    const body = await req.json();
    const order_id = body.order_id;
    orderIdFromRequest = order_id;

    if (!orderIdFromRequest) {
      console.error('order-confirmation: Missing order_id in request');
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- 1. Fetch Order Details using RPC ---
    console.log(
      `order-confirmation: Fetching order data for ${orderIdFromRequest}`
    );
    const { data: orderDataArray, error: orderError } = await supabase.rpc(
      'get_order_for_email_dispatch',
      {
        p_order_id: orderIdFromRequest,
      }
    );

    if (orderError || !orderDataArray || orderDataArray.length === 0) {
      console.error(
        `order-confirmation: Error fetching order ${orderIdFromRequest}:`,
        orderError
      );
      if (orderIdFromRequest) {
        await supabase
          .rpc('update_email_dispatch_status', {
            p_order_id: orderIdFromRequest,
            p_email_dispatch_status: 'DISPATCH_FAILED',
            p_email_dispatch_error: `Order not found or DB error: ${orderError?.message}`,
          })
          .catch((err: unknown) =>
            console.error('Failed to update error status:', err)
          );
      }
      return new Response(
        JSON.stringify({ error: 'Order not found or database error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    const orderData = orderDataArray[0];

    // Check if email already sent or in progress to prevent duplicates
    if (
      orderData.email_dispatch_status === 'SENT_SUCCESSFULLY' ||
      orderData.email_dispatch_status === 'DISPATCH_IN_PROGRESS'
    ) {
      console.warn(
        `order-confirmation: Order confirmation email for order ${orderIdFromRequest} already processed or in progress (${orderData.email_dispatch_status}). Skipping.`
      );
      return new Response(
        JSON.stringify({
          message: 'Order confirmation email already processed or in progress.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update status to in progress using RPC
    console.log(
      `order-confirmation: Setting order ${orderIdFromRequest} to DISPATCH_IN_PROGRESS`
    );
    const { error: updateError } = await supabase.rpc(
      'update_email_dispatch_status',
      {
        p_order_id: orderIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_IN_PROGRESS',
        p_email_dispatch_attempts: (orderData.email_dispatch_attempts || 0) + 1,
      }
    );

    if (updateError) {
      console.error(
        `order-confirmation: Failed to update dispatch status for ${orderIdFromRequest}:`,
        updateError
      );
      return new Response(
        JSON.stringify({ error: 'Failed to update dispatch status' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // --- 2. Prepare Data for Email ---
    if (!orderData.customer_email || !orderData.customer_name) {
      console.error(
        `order-confirmation: Customer data missing for order ${orderIdFromRequest}`
      );
      await supabase.rpc('update_email_dispatch_status', {
        p_order_id: orderIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_FAILED',
        p_email_dispatch_error: 'Customer data missing for order.',
      });
      return new Response(JSON.stringify({ error: 'Customer data missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const customerName = orderData.customer_name || 'Valued Customer';
    const orderItems = orderData.items || [];
    // Calculate subtotal (before discount) for display in email
    // Formula stored in DB: total_amount = subtotal_before_discount + shipping + tax - discount
    // So to get subtotal_before_discount: subtotal = total_amount - shipping - tax + discount
    // This matches the calculation in checkout/index.ts where:
    //   totalAmount = subtotal + shippingFee + taxAmount - discountAmount
    const subtotal = orderData.total_amount - (orderData.shipping_fee || 0) - (orderData.tax_amount || 0) + (orderData.discount_amount || 0);

    // --- 3. Generate Customer Order Confirmation Email HTML using Email Engine ---
    const emailHtmlBody = EmailTemplateEngine.renderCustomerOrderConfirmation({
      orderNumber: orderData.order_number,
      customerName: customerName,
      customerEmail: orderData.customer_email,
      items: orderItems.map((item: {
        product_title: string;
        variant_title?: string | null;
        quantity: number;
        total_amount: number;
        product_image_url?: string | null;
      }) => ({
        product_title: item.product_title,
        variant_title: item.variant_title,
        quantity: item.quantity,
        total_amount: item.total_amount,
        product_image_url: item.product_image_url,
      })),
      subtotal: subtotal,
      shippingFee: orderData.shipping_fee || 0,
      taxAmount: orderData.tax_amount || 0,
      discountAmount: orderData.discount_amount || 0,
      totalAmount: orderData.total_amount,
      currencyCode: orderData.currency_code,
      shippingAddress: orderData.shipping_address as {
        name?: string;
        address?: string;
        city?: string;
        country?: string;
        postalCode?: string;
        phone?: string;
      } | null,
    });

    // --- 4. Generate Owner Order Notification Email HTML ---
    const ownerEmailHtmlBody = EmailTemplateEngine.renderOwnerOrderNotification({
      orderNumber: orderData.order_number,
      customerName: customerName,
      customerEmail: orderData.customer_email,
      items: orderItems.map((item: {
        product_title: string;
        variant_title?: string | null;
        quantity: number;
        total_amount: number;
        product_image_url?: string | null;
      }) => ({
        product_title: item.product_title,
        variant_title: item.variant_title,
        quantity: item.quantity,
        total_amount: item.total_amount,
        product_image_url: item.product_image_url,
      })),
      subtotal: subtotal,
      shippingFee: orderData.shipping_fee || 0,
      taxAmount: orderData.tax_amount || 0,
      discountAmount: orderData.discount_amount || 0,
      totalAmount: orderData.total_amount,
      currencyCode: orderData.currency_code,
      shippingAddress: orderData.shipping_address as {
        name?: string;
        address?: string;
        city?: string;
        country?: string;
        postalCode?: string;
        phone?: string;
      } | null,
      createdAt: orderData.created_at || new Date(),
    });

    // --- 5. Send Emails with Resend ---
    // Send to customer
    const { data: customerEmailData, error: customerEmailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: orderData.customer_email,
      reply_to: replyEmail,
      subject: `Confirmation de commande - ${orderData.order_number}`,
      html: emailHtmlBody,
    });

    if (customerEmailError) {
      const resendErrorMsg =
        customerEmailError instanceof Error
          ? customerEmailError.message
          : JSON.stringify(customerEmailError);
      console.error(
        `Resend error for customer email (order ${orderIdFromRequest}):`,
        resendErrorMsg
      );
      await supabase.rpc('update_email_dispatch_status', {
        p_order_id: orderIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_FAILED',
        p_email_dispatch_error: `Resend API error (customer): ${resendErrorMsg}`,
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to send customer email',
          details: resendErrorMsg,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send to owner(s)
    const { data: ownerEmailData, error: ownerEmailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: ownerEmails,
      reply_to: orderData.customer_email,
      subject: `Nouvelle commande - ${orderData.order_number}`,
      html: ownerEmailHtmlBody,
    });

    if (ownerEmailError) {
      const resendErrorMsg =
        ownerEmailError instanceof Error
          ? ownerEmailError.message
          : JSON.stringify(ownerEmailError);
      console.error(
        `Resend error for owner email (order ${orderIdFromRequest}):`,
        resendErrorMsg
      );
      // Don't fail the whole request if owner email fails, but log it
      console.warn(
        `Customer email sent successfully, but owner email failed for order ${orderIdFromRequest}`
      );
    }

    // --- 6. Update Order Record on Success ---
    console.log(
      `order-confirmation: Emails sent successfully for order ${orderIdFromRequest}. Customer Email ID: ${customerEmailData?.id}, Owner Email ID: ${ownerEmailData?.id}`
    );
    await supabase.rpc('update_email_dispatch_status', {
      p_order_id: orderIdFromRequest,
      p_email_dispatch_status: 'SENT_SUCCESSFULLY',
      p_email_dispatch_error: null,
    });

    console.log(
      `Order confirmation emails sent for ${orderIdFromRequest}. Customer Email ID: ${customerEmailData?.id}, Owner Email ID: ${ownerEmailData?.id}`
    );
    return new Response(
      JSON.stringify({
        message: 'Order confirmation emails sent successfully!',
        customer_email_id: customerEmailData?.id,
        owner_email_id: ownerEmailData?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred';
    console.error(
      `Unexpected error for ${orderIdFromRequest || 'unknown'}:`,
      e
    );
    if (orderIdFromRequest) {
      try {
        const supabaseForErrorFallback = createClient(
          supabaseUrl!,
          supabaseServiceRoleKey!
        );
        await supabaseForErrorFallback.rpc('update_email_dispatch_status', {
          p_order_id: orderIdFromRequest,
          p_email_dispatch_status: 'DISPATCH_FAILED',
          p_email_dispatch_error: `Unexpected error: ${errorMessage}`,
        });
      } catch (updateError) {
        console.error(
          `Failed to update error status for ${orderIdFromRequest}:`,
          updateError
        );
      }
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
