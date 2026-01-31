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
const fromEmail = Deno.env.get('FROM_EMAIL') || 'contact@kysfactoryciv.com';
const ownerEmail = Deno.env.get('OWNER_EMAIL') || 'contact@kysfactory.com';
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

  let contactInquiryId: string | null = null;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const resend = new Resend(resendApiKey);

    const body = await req.json();
    const inquiry_id = body.inquiry_id;
    contactInquiryId = inquiry_id;

    if (!contactInquiryId) {
      console.error('contact-confirmation: Missing inquiry_id in request');
      return new Response(JSON.stringify({ error: 'Missing inquiry_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- 1. Fetch Contact Inquiry Details ---
    console.log(
      `contact-confirmation: Fetching contact inquiry data for ${contactInquiryId}`
    );
    const { data: inquiryData, error: inquiryError } = await supabase
      .from('contact_inquiries')
      .select('*')
      .eq('id', contactInquiryId)
      .single();

    if (inquiryError || !inquiryData) {
      console.error(
        `contact-confirmation: Error fetching contact inquiry ${contactInquiryId}:`,
        inquiryError
      );
      if (contactInquiryId) {
        await supabase.rpc('update_contact_inquiry_email_dispatch_status', {
          p_contact_inquiry_id: contactInquiryId,
          p_email_dispatch_status: 'DISPATCH_FAILED',
          p_email_dispatch_error: `Contact inquiry not found or DB error: ${inquiryError?.message}`,
        }).catch((err: unknown) =>
          console.error('Failed to update error status:', err)
        );
      }
      return new Response(
        JSON.stringify({ error: 'Contact inquiry not found or database error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Check if email already sent or in progress to prevent duplicates
    if (
      inquiryData.email_dispatch_status === 'SENT_SUCCESSFULLY' ||
      inquiryData.email_dispatch_status === 'DISPATCH_IN_PROGRESS'
    ) {
      console.warn(
        `contact-confirmation: Contact confirmation email for inquiry ${contactInquiryId} already processed or in progress (${inquiryData.email_dispatch_status}). Skipping.`
      );
      return new Response(
        JSON.stringify({
          message: 'Contact confirmation email already processed or in progress.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update status to in progress
    console.log(
      `contact-confirmation: Setting contact inquiry ${contactInquiryId} to DISPATCH_IN_PROGRESS`
    );
    const { error: updateError } = await supabase.rpc(
      'update_contact_inquiry_email_dispatch_status',
      {
        p_contact_inquiry_id: contactInquiryId,
        p_email_dispatch_status: 'DISPATCH_IN_PROGRESS',
        p_email_dispatch_attempts: (inquiryData.email_dispatch_attempts || 0) + 1,
      }
    );

    if (updateError) {
      console.error(
        `contact-confirmation: Failed to update dispatch status for ${contactInquiryId}:`,
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
    if (!inquiryData.email || !inquiryData.name) {
      console.error(
        `contact-confirmation: Contact data missing for inquiry ${contactInquiryId}`
      );
      await supabase.rpc('update_contact_inquiry_email_dispatch_status', {
        p_contact_inquiry_id: contactInquiryId,
        p_email_dispatch_status: 'DISPATCH_FAILED',
        p_email_dispatch_error: 'Contact data missing for inquiry.',
      });
      return new Response(JSON.stringify({ error: 'Contact data missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const customerName = inquiryData.name || 'Valued Customer';
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0];

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

    // --- 4. Generate Customer Confirmation Email HTML ---
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de réception - KYS Factory</title>
        <style type="text/css">
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { padding: 20px; text-align: center; background-color: #ffffff; }
          .header img { width: 100px; height: auto; border-radius: 6px; object-fit: contain; }
          .content { padding: 30px; }
          .message-box { background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; border-top: 1px solid #eee; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoSrc}" alt="KYS Factory Logo" />
          </div>
          <div class="content">
            <h1>Merci pour votre message, ${firstName} !</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Nous avons bien reçu votre demande de contact et nous vous répondrons dans les plus brefs délais.
            </p>
            
            <div class="message-box">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Votre message :</strong><br>
                ${inquiryData.message.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
              Notre équipe examinera votre demande et vous contactera à l'adresse <strong>${inquiryData.email}</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Si vous avez des questions urgentes, n'hésitez pas à nous contacter directement via WhatsApp au +225 07 13 51 64 17.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KYS Factory</p>
            <p>Merci de votre intérêt pour KYS Factory !</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // --- 5. Generate Owner Notification Email HTML ---
    const ownerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle demande de contact - KYS Factory</title>
        <style type="text/css">
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { padding: 20px; text-align: center; background-color: #ffffff; }
          .header img { width: 100px; height: auto; border-radius: 6px; object-fit: contain; }
          .content { padding: 30px; }
          .info-box { background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .message-box { background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; border-top: 1px solid #eee; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoSrc}" alt="KYS Factory Logo" />
          </div>
          <div class="content">
            <h1>Nouvelle demande de contact</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Une nouvelle demande de contact a été soumise via le formulaire de contact.
            </p>
            
            <div class="info-box">
              <p style="margin: 8px 0;"><strong>Nom :</strong> ${inquiryData.name}</p>
              <p style="margin: 8px 0;"><strong>Email :</strong> <a href="mailto:${inquiryData.email}">${inquiryData.email}</a></p>
              ${inquiryData.company ? `<p style="margin: 8px 0;"><strong>Entreprise/Organisation :</strong> ${inquiryData.company}</p>` : ''}
              ${inquiryData.url ? `<p style="margin: 8px 0;"><strong>URL :</strong> <a href="${inquiryData.url}" target="_blank">${inquiryData.url}</a></p>` : ''}
              <p style="margin: 8px 0;"><strong>Date :</strong> ${new Date(inquiryData.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
            
            <div class="message-box">
              <p style="margin: 0; font-size: 14px;">
                <strong>Message :</strong><br>
                ${inquiryData.message.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
              Veuillez répondre à cette demande dans les plus brefs délais.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KYS Factory</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // --- 6. Send Emails with Resend ---
    // Send to customer
    const { data: customerEmailData, error: customerEmailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: inquiryData.email,
      reply_to: ownerEmail,
      subject: 'Confirmation de réception - KYS Factory',
      html: customerEmailHtml,
    });

    if (customerEmailError) {
      const resendErrorMsg =
        customerEmailError instanceof Error
          ? customerEmailError.message
          : JSON.stringify(customerEmailError);
      console.error(
        `Resend error for customer email (inquiry ${contactInquiryId}):`,
        resendErrorMsg
      );
      await supabase.rpc('update_contact_inquiry_email_dispatch_status', {
        p_contact_inquiry_id: contactInquiryId,
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

    // Send to owner
    const { data: ownerEmailData, error: ownerEmailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: ownerEmail,
      reply_to: inquiryData.email,
      subject: `Nouvelle demande de contact de ${inquiryData.name}`,
      html: ownerEmailHtml,
    });

    if (ownerEmailError) {
      const resendErrorMsg =
        ownerEmailError instanceof Error
          ? ownerEmailError.message
          : JSON.stringify(ownerEmailError);
      console.error(
        `Resend error for owner email (inquiry ${contactInquiryId}):`,
        resendErrorMsg
      );
      // Note: Customer email was sent successfully, so we log the owner email error but don't fail completely
      console.warn(
        `Owner email failed but customer email succeeded for inquiry ${contactInquiryId}`
      );
    }

    // --- 7. Update Contact Inquiry Record on Success ---
    console.log(
      `contact-confirmation: Emails sent successfully for inquiry ${contactInquiryId}. Customer Email ID: ${customerEmailData?.id}, Owner Email ID: ${ownerEmailData?.id}`
    );
    await supabase.rpc('update_contact_inquiry_email_dispatch_status', {
      p_contact_inquiry_id: contactInquiryId,
      p_email_dispatch_status: 'SENT_SUCCESSFULLY',
      p_email_dispatch_error: null,
    });

    console.log(
      `Contact confirmation emails sent for ${contactInquiryId}. Customer Email ID: ${customerEmailData?.id}`
    );
    return new Response(
      JSON.stringify({
        message: 'Contact confirmation emails sent successfully!',
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
      `Unexpected error for ${contactInquiryId || 'unknown'}:`,
      e
    );
    if (contactInquiryId) {
      try {
        const supabaseForErrorFallback = createClient(
          supabaseUrl!,
          supabaseServiceRoleKey!
        );
        await supabaseForErrorFallback.rpc('update_contact_inquiry_email_dispatch_status', {
          p_contact_inquiry_id: contactInquiryId,
          p_email_dispatch_status: 'DISPATCH_FAILED',
          p_email_dispatch_error: `Unexpected error: ${errorMessage}`,
        });
      } catch (updateError) {
        console.error(
          `Failed to update error status for ${contactInquiryId}:`,
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
