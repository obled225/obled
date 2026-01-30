import type { Metadata } from 'next';
import { AboutClient } from '@/components/about/about-client';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / About',
};

export default function AboutPage() {
  return <AboutClient />;
}
