/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';
import { EmailTemplateEngine } from '../_shared/contact-email.ts';


// --- Environment Variables ---
const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('URL');
const supabaseServiceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail = Deno.env.get('FROM_EMAIL') || 'notifications@contact.kysfactoryciv.com';
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

    // --- 3. Generate Customer Confirmation Email HTML using Email Engine ---
    const customerEmailHtml = EmailTemplateEngine.renderCustomerConfirmation({
      name: inquiryData.name,
      email: inquiryData.email,
      message: inquiryData.message,
    });

    // --- 4. Generate Owner Notification Email HTML using Email Engine ---
    const ownerEmailHtml = EmailTemplateEngine.renderOwnerNotification({
      name: inquiryData.name,
      email: inquiryData.email,
      company: inquiryData.company,
      url: inquiryData.url,
      message: inquiryData.message,
      createdAt: inquiryData.created_at,
    });

    // --- 5. Send Emails with Resend ---
    // Send to customer
    const { data: customerEmailData, error: customerEmailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: inquiryData.email,
      reply_to: replyEmail,
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

    // Send to owner(s)
    const { data: ownerEmailData, error: ownerEmailError } = await resend.emails.send({
      from: `KYS Factory <${fromEmail}>`,
      to: ownerEmails,
      reply_to: replyEmail,
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

    // --- 6. Update Contact Inquiry Record on Success ---
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
