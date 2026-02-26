import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Buffer } from 'node:buffer';

// --- Helper: Verify lomi. Webhook Signature ---
async function verifylomiWebhook(
  rawBody: string | Buffer,
  signatureHeader: string | null,
  webhookSecret: string
) {
  if (!signatureHeader) {
    throw new Error('Missing lomi. signature header (X-lomi-Signature).');
  }
  if (!webhookSecret) {
    console.error('LOMI_WEBHOOK_SECRET is not set. Cannot verify webhook.');
    throw new Error('Webhook secret not configured internally.');
  }
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  const sigBuffer = Buffer.from(signatureHeader);
  const expectedSigBuffer = Buffer.from(expectedSignature);
  if (
    sigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
  ) {
    throw new Error('lomi. webhook signature mismatch.');
  }
  return JSON.parse(
    typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  );
}

// --- POST Handler for App Router ---
export async function POST(request: Request) {
  console.log(
    '🚀 lomi. Webhook: Received request at',
    new Date().toISOString()
  );
  console.log(
    '📧 Request headers:',
    Object.fromEntries(request.headers.entries())
  );

  // --- Environment Variables ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAPIKey = process.env.SUPABASE_API_KEY;
  const lomiWebhookSecret = process.env.LOMI_WEBHOOK_SECRET;

  console.log('🔧 Environment check:');
  console.log(
    `  - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`
  );
  console.log(
    `  - SUPABASE_API_KEY: ${supabaseAPIKey ? '✅ Set' : '❌ Missing'}`
  );
  console.log(
    `  - LOMI_WEBHOOK_SECRET: ${lomiWebhookSecret ? '✅ Set' : '❌ Missing'}`
  );

  // Check for required environment variables
  if (!supabaseUrl || !supabaseAPIKey || !lomiWebhookSecret) {
    console.error(
      'lomi. Webhook: Missing critical environment variables. Check NEXT_PUBLIC_SUPABASE_URL, SUPABASE_API_KEY, LOMI_WEBHOOK_SECRET.'
    );
    return new Response(
      JSON.stringify({ error: 'Missing required environment variables' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseAPIKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Read the raw body
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (bodyError) {
    console.error('lomi. Webhook: Error reading request body:', bodyError);
    return new Response(
      JSON.stringify({ error: 'Failed to read request body' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const signature = request.headers.get('x-lomi-signature');
  let eventPayload: {
    event?: string;
    data?: {
      transaction_id?: string;
      id?: string;
      checkout_session_id?: string;
      gross_amount?: string;
      amount?: string;
      net_amount?: string;
      currency_code?: string;
      currency?: string;
      metadata?: {
        internal_order_id?: string;
        checkout_session_id?: string;
        linkId?: string;
      };
    };
  };

  try {
    eventPayload = (await verifylomiWebhook(
      rawBody,
      signature,
      lomiWebhookSecret
    )) as typeof eventPayload;
    console.log(
      'lomi. Webhook: lomi. event verified:',
      eventPayload?.event || 'Event type missing'
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(
      'lomi. Webhook: lomi. signature verification failed:',
      errorMessage
    );
    return new Response(
      JSON.stringify({ error: `Webhook verification failed: ${errorMessage}` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // --- Event Processing ---
  try {
    const lomiEventType = eventPayload?.event;
    const eventData = eventPayload?.data;

    if (!lomiEventType || !eventData) {
      console.warn(
        'lomi. Webhook: Event type or data missing in lomi. payload.',
        eventPayload
      );
      return new Response(
        JSON.stringify({ error: 'Event type or data missing.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('lomi. Webhook: Received lomi. event type:', lomiEventType);
    console.log(
      'lomi. Webhook: Full event payload:',
      JSON.stringify(eventPayload, null, 2)
    );

    // Extract order ID from metadata
    const orderId = eventData.metadata?.internal_order_id;

    if (!orderId) {
      console.error(
        'lomi. Webhook Error: Missing internal_order_id in lomi. webhook metadata.',
        { lomiEventData: eventData }
      );
      return new Response(
        JSON.stringify({
          error: 'Missing internal_order_id in lomi. webhook metadata.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // lomiTransactionId is extracted but not currently used
    // const lomiTransactionId = eventData.transaction_id || eventData.id;

    // checkout_session_id is sent directly on eventData from lomi
    const lomiCheckoutSessionId = String(
      eventData.checkout_session_id ||
        eventData.metadata?.checkout_session_id ||
        eventData.metadata?.linkId ||
        eventData.id ||
        ''
    );

    // Amount: lomi sends gross_amount from the transactions table
    const amount = parseFloat(
      eventData.gross_amount || eventData.amount || eventData.net_amount || '0'
    );

    // Currency: lomi sends currency_code from the transactions table
    const currency = eventData.currency_code || eventData.currency || 'XOF';

    // Determine payment status based on event type
    // Valid lomi. webhook events: PAYMENT_SUCCEEDED, PAYMENT_FAILED, PAYMENT_CREATED, REFUND_*, SUBSCRIPTION_*
    let paymentStatusForDb = 'unknown';
    if (lomiEventType === 'PAYMENT_SUCCEEDED') {
      paymentStatusForDb = 'paid';
    } else if (lomiEventType === 'PAYMENT_FAILED') {
      paymentStatusForDb = 'payment_failed';
    } else {
      console.log(
        'lomi. Webhook: lomi. event type not handled for direct payment status update:',
        lomiEventType
      );
      return new Response(
        JSON.stringify({
          received: true,
          message: 'Webhook event type not handled for payment update.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Record Payment Outcome
    const { error: rpcError } = await supabase.rpc('record_order_payment', {
      p_lomi_session_id: lomiCheckoutSessionId,
      p_payment_status: paymentStatusForDb,
      p_total_amount: amount,
      p_currency_code: currency,
      p_lomi_event_payload: eventPayload,
    });

    if (rpcError) {
      console.error(
        `lomi. Webhook Error: Failed to call record_order_payment RPC for order ${orderId}:`,
        rpcError
      );
      return new Response(
        JSON.stringify({
          error: 'Failed to record payment',
          details: rpcError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(
      `lomi. Webhook: Payment for order ${orderId} (status: ${paymentStatusForDb}) processed.`
    );

    // Only proceed to email dispatch if payment was successful
    if (paymentStatusForDb === 'paid') {
      console.log(
        `📧 lomi. Webhook: Triggering order-confirmation for order ${orderId}`
      );
      try {
        const functionUrl = `${supabaseUrl}/functions/v1/order-confirmation`;

        const emailResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseAPIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_id: orderId }),
        });

        const emailResult = await emailResponse.text();

        if (!emailResponse.ok) {
          console.error(
            `❌ lomi. Webhook: Error triggering order-confirmation for ${orderId}:`,
            {
              status: emailResponse.status,
              statusText: emailResponse.statusText,
              response: emailResult,
            }
          );

          // Try to update order status to indicate email dispatch failed
          try {
            await supabase.rpc('update_email_dispatch_status', {
              p_order_id: orderId,
              p_email_dispatch_status: 'DISPATCH_FAILED',
              p_email_dispatch_error: `HTTP call failed: ${emailResponse.status} - ${emailResult}`,
            });
          } catch (updateError) {
            console.error(
              `❌ Failed to update email dispatch status after HTTP error:`,
              updateError
            );
          }
        } else {
          console.log(
            `✅ lomi. Webhook: Successfully triggered order-confirmation for ${orderId}:`,
            emailResult
          );
        }
      } catch (functionError: unknown) {
        const errorMessage =
          functionError instanceof Error
            ? functionError.message
            : 'Unknown error';
        const errorName =
          functionError instanceof Error ? functionError.name : 'Error';
        const errorStack =
          functionError instanceof Error ? functionError.stack : undefined;
        console.error(
          `❌ lomi. Webhook: Exception calling order-confirmation for ${orderId}:`,
          functionError
        );
        console.error(`❌ Function Error Details:`, {
          name: errorName,
          message: errorMessage,
          stack: errorStack,
        });

        // Try to update order status to indicate email dispatch failed
        try {
          await supabase.rpc('update_email_dispatch_status', {
            p_order_id: orderId,
            p_email_dispatch_status: 'DISPATCH_FAILED',
            p_email_dispatch_error: `Function invocation error: ${errorMessage}`,
          });
        } catch (updateError) {
          console.error(
            `❌ Failed to update email dispatch status after function error:`,
            updateError
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true, message: 'Webhook processed.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      'lomi. Webhook - Uncaught error during event processing:',
      error
    );
    return new Response(
      JSON.stringify({
        error: 'Internal server error processing webhook event.',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
