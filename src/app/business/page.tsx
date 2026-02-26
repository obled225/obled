import { redirect } from 'next/navigation';

/**
 * Legacy /business route - redirect to home (normal e-commerce store, no separate business page).
 */
export default function BusinessPage() {
  redirect('/');
}
