import type { Metadata } from 'next';
import { TermsClient } from '@/components/terms/terms-client';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Terms',
};

export default function TermsPage() {
  return <TermsClient />;
}
