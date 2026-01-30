import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Phone, Instagram, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Contact',
};

export default function ContactPage() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-medium text-foreground text-center">
          Contact
        </h1>
        <p className="mt-4 text-center text-muted-foreground">
          For any questions or wholesale orders, feel free to contact us.
        </p>

        <div className="mt-12 space-y-6">
          {/* WhatsApp */}
          <Link
            href="https://wa.me/22507135164117"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-border p-6 hover:bg-muted transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                +225 07 13 51 64 17
              </p>
            </div>
          </Link>

          {/* Phone */}
          <Link
            href="tel:+22507135164117"
            className="flex items-center gap-4 rounded-lg border border-border p-6 hover:bg-muted transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Téléphone</h3>
              <p className="text-sm text-muted-foreground">
                +225 07 13 51 64 17
              </p>
            </div>
          </Link>

          {/* Instagram */}
          <Link
            href="https://instagram.com/kysfactoryciv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-border p-6 hover:bg-muted transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 text-white">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Instagram</h3>
              <p className="text-sm text-muted-foreground">@kysfactoryciv</p>
            </div>
          </Link>

          {/* Email */}
          <Link
            href="mailto:contact@kysfactory.com"
            className="flex items-center gap-4 rounded-lg border border-border p-6 hover:bg-muted transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Email</h3>
              <p className="text-sm text-muted-foreground">
                contact@kysfactory.com
              </p>
            </div>
          </Link>
        </div>

        {/* Payment Notice */}
        <div className="mt-12 rounded-lg bg-amber-50 border border-amber-200 p-6">
          <p className="flex items-start gap-2 text-sm text-amber-800">
            <span className="text-amber-500 text-lg">⚠</span>
            <span>
              <strong>Important:</strong> Your order will only be definitively
              validated if payment has been made via WAVE to +225 07 13 51 64
              17.
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
