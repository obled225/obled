/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

// Helper function to convert Uint8Array to Base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Environment Variables ---
const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('URL');
const supabaseServiceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail = Deno.env.get('FROM_EMAIL') || 'orders@kysfactoryciv.com';
const defaultLogoUrl = `${supabaseUrl}/storage/v1/object/public/assets/logo.png`;

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
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0];

    const orderItems = orderData.items || [];
    const subtotal = orderData.total_amount - orderData.shipping_fee - orderData.tax_amount + orderData.discount_amount;

    // --- 3. Fetch Logo ---
    let logoSrc = defaultLogoUrl;
    try {
      const { data: logoData, error: logoError } = await supabase.storage
        .from('assets')
        .download('logo.png');

      if (logoData && !logoError) {
        try {
          const logoBytes = new Uint8Array(await logoData.arrayBuffer());
          const logoBase64 = uint8ArrayToBase64(logoBytes);
          logoSrc = `data:image/png;base64,${logoBase64}`;
          console.log(
            'Successfully fetched and encoded logo from Supabase Storage.'
          );
        } catch (conversionError) {
          console.warn(
            'Failed to convert Supabase logo to Base64, using URL fallback:',
            conversionError
          );
        }
      } else {
        console.warn(
          'Logo not found in Supabase Storage, trying direct URL fetch...'
        );

        try {
          const logoResponse = await fetch(defaultLogoUrl);
          if (logoResponse.ok) {
            const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
            const logoBase64 = uint8ArrayToBase64(logoBytes);
            logoSrc = `data:image/png;base64,${logoBase64}`;
            console.log('Successfully fetched logo via direct URL.');
          } else {
            console.warn(
              `Failed to fetch logo (status: ${logoResponse.status}), using URL as final fallback.`
            );
          }
        } catch (urlFetchError) {
          console.warn(
            'Failed to fetch logo via URL, using URL as final fallback:',
            urlFetchError
          );
        }
      }
    } catch (logoError) {
      console.error(
        'Unexpected error in logo fetching, using URL fallback:',
        logoError
      );
    }

    // --- 4. Generate HTML Email ---
    const formatCurrency = (amount: number, currency: string) => {
      if (currency === 'XOF') {
        return `${Math.round(amount).toLocaleString('fr-FR')} F CFA`;
      }
      return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    };

    const emailHtmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${orderData.order_number}</title>
        <style type="text/css">
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { padding: 20px; text-align: center; background-color: #ffffff; }
          .header img { width: 100px; height: auto; border-radius: 6px; object-fit: contain; }
          .content { padding: 30px; }
          .order-number { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .item-table th, .item-table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
          .item-table th { background-color: #f8f9fa; font-weight: bold; }
          .item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
          .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .summary-table td { padding: 8px 12px; }
          .summary-table .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
          .shipping-address { background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; border-top: 1px solid #eee; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoSrc}" alt="KYS Factory Logo" />
          </div>
          <div class="content">
            <h1>Thank you for your order, ${firstName}!</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We have received your order and are preparing it for shipment. Here is a summary of your order:
            </p>
            
            <div class="order-number">Order #${orderData.order_number}</div>
            
            <table class="item-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems
                  .map(
                    (item: {
                      product_title: string;
                      variant_title?: string;
                      quantity: number;
                      total_amount: number;
                      product_image_url?: string;
                    }) => `
                  <tr>
                    <td>
                      ${item.product_image_url ? `<img src="${item.product_image_url}" alt="${item.product_title}" class="item-image" style="margin-right: 10px;" />` : ''}
                      <div style="display: inline-block; vertical-align: top;">
                        <strong>${item.product_title}</strong>
                        ${item.variant_title ? `<br><span style="color: #666; font-size: 14px;">${item.variant_title}</span>` : ''}
                      </div>
                    </td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.total_amount, orderData.currency_code)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <table class="summary-table">
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td style="text-align:right;">${formatCurrency(subtotal, orderData.currency_code)}</td>
                </tr>
                ${orderData.shipping_fee > 0 ? `
                <tr>
                  <td>Shipping</td>
                  <td style="text-align:right;">${formatCurrency(orderData.shipping_fee, orderData.currency_code)}</td>
                </tr>
                ` : ''}
                ${orderData.tax_amount > 0 ? `
                <tr>
                  <td>Tax</td>
                  <td style="text-align:right;">${formatCurrency(orderData.tax_amount, orderData.currency_code)}</td>
                </tr>
                ` : ''}
                ${orderData.discount_amount > 0 ? `
                <tr>
                  <td>Discount</td>
                  <td style="text-align:right;">-${formatCurrency(orderData.discount_amount, orderData.currency_code)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td>Total</td>
                  <td style="text-align:right;">${formatCurrency(orderData.total_amount, orderData.currency_code)}</td>
                </tr>
              </tbody>
            </table>
            
            ${orderData.shipping_address ? `
            <div class="shipping-address">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p style="margin: 4px 0;">
                <strong>${orderData.shipping_address.name || ''}</strong><br>
                ${orderData.shipping_address.address || ''}<br>
                ${orderData.shipping_address.city || ''}, ${orderData.shipping_address.country || ''}<br>
                ${orderData.shipping_address.postalCode || ''}
                ${orderData.shipping_address.phone ? `<br>Phone: ${orderData.shipping_address.phone}` : ''}
              </p>
            </div>
            ` : ''}
            
            <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
              We will send you another notification once your order has been shipped.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              If you have any questions, please reply to this email.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KYS Factory</p>
            <p>Thank you for choosing KYS Factory!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // --- 5. Send Email with Resend ---
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: orderData.customer_email,
      reply_to: fromEmail,
      subject: `Order Confirmation - ${orderData.order_number}`,
      html: emailHtmlBody,
    });

    if (emailError) {
      const resendErrorMsg =
        emailError instanceof Error
          ? emailError.message
          : JSON.stringify(emailError);
      console.error(
        `Resend error for order ${orderIdFromRequest}:`,
        resendErrorMsg
      );
      await supabase.rpc('update_email_dispatch_status', {
        p_order_id: orderIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_FAILED',
        p_email_dispatch_error: `Resend API error: ${resendErrorMsg}`,
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: resendErrorMsg,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // --- 6. Update Order Record on Success ---
    console.log(
      `order-confirmation: Email sent successfully for order ${orderIdFromRequest}. Email ID: ${emailData?.id}`
    );
    await supabase.rpc('update_email_dispatch_status', {
      p_order_id: orderIdFromRequest,
      p_email_dispatch_status: 'SENT_SUCCESSFULLY',
      p_email_dispatch_error: null,
    });

    console.log(
      `Order confirmation email sent for ${orderIdFromRequest}. Email ID: ${emailData?.id}`
    );
    return new Response(
      JSON.stringify({
        message: 'Order confirmation email sent successfully!',
        email_id: emailData?.id,
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
