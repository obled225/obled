import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, url, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Les champs nom, email et message sont requis.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // URL validation (if provided)
    if (url && url.trim() !== '') {
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });
      }
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Insert contact inquiry
    const { data: inquiry, error: insertError } = await supabase
      .from('contact_inquiries')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        url: url?.trim() || null,
        message: message.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting contact inquiry:', insertError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de votre demande." },
        { status: 500 }
      );
    }

    // Trigger email dispatch
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const functionUrl = `${supabaseUrl}/functions/v1/contact-confirmation`;

      const emailResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inquiry_id: inquiry.id }),
      });

      if (!emailResponse.ok) {
        let errorData: { error?: string; message?: string } = {};
        try {
          errorData = await emailResponse.json();
        } catch {
          const errorText = await emailResponse.text();
          errorData = { error: errorText };
        }
        emailError =
          errorData.error ||
          errorData.message ||
          "Erreur lors de l'envoi de l'email de confirmation";
        console.error(
          `Error triggering contact-confirmation for ${inquiry.id}:`,
          {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            response: errorData,
          }
        );
      } else {
        emailSent = true;
        console.log(
          `Successfully triggered contact-confirmation for ${inquiry.id}`
        );
      }
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : 'Erreur de connexion';
      emailError = `Erreur lors de l'envoi de l'email: ${errorMessage}`;
      console.error(
        `Exception calling contact-confirmation for ${inquiry.id}:`,
        fetchError
      );
    }

    // Always return success since inquiry is saved, but include email status
    return NextResponse.json(
      {
        success: true,
        message:
          'Votre demande a été envoyée avec succès. Nous vous répondrons dans les plus brefs délais.',
        emailSent,
        emailError: emailError || undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de votre demande." },
      { status: 500 }
    );
  }
}
