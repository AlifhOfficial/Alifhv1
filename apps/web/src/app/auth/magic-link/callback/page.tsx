"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function MagicLinkCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleMagicLinkCallback = async () => {
      try {
        // The magic link verification should happen automatically through Better Auth
        // Just wait a moment and then redirect
        setTimeout(() => {
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        }, 2000);
      } catch (error) {
        console.error("Magic link callback error:", error);
        setStatus('error');
      }
    };

    handleMagicLinkCallback();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying Magic Link...</h1>
          <p className="text-gray-600">Please wait while we sign you in.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Success!</h1>
          <p className="text-gray-600">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-gray-600">Something went wrong. Please try again.</p>
      </div>
    </div>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <MagicLinkCallback />
    </Suspense>
  );
}
