'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';

export function ContactForm() {
  const tContact = useTranslations('contact');
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    url: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du formulaire");
      }

      success(
        tContact('form.success.title'),
        tContact('form.success.description')
      );

      // Reset form
      setFormData({
        name: '',
        company: '',
        url: '',
        email: '',
        message: '',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Une erreur est survenue';
      error(tContact('form.error.title'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mt-8">
      <p className="text-sm sm:text-lg leading-relaxed mb-4 text-foreground/80">
        {tContact('form.title')}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={tContact('form.fields.name')}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
          <Input
            label={tContact('form.fields.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={tContact('form.fields.company')}
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <Input
            label={tContact('form.fields.url')}
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://"
            disabled={isSubmitting}
          />
        </div>
        <Textarea
          label={tContact('form.fields.message')}
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={6}
          disabled={isSubmitting}
          className="min-h-[120px]"
        />
        <div className="flex justify-end mb-8">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? tContact('form.submitting')
              : tContact('form.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
