import type { Metadata } from 'next';
import { FaqClient } from '@/components/faq/faq-client';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / FAQ',
};

export default function FaqPage() {
  return <FaqClient />;
}