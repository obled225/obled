import { Suspense } from 'react';
import AdminClient from './admin-client';

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-4">🔄</div>
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          </div>
        </div>
      }
    >
      <AdminClient />
    </Suspense>
  );
}
