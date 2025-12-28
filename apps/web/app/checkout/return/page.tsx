import { Suspense } from 'react';
import ReturnClient from './ReturnClient';

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">A verificar pagamento...</p>
        </div>
      </div>
    }>
      <ReturnClient />
    </Suspense>
  );
}
