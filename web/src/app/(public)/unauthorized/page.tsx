"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <Lock className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
        <p className="mb-8 text-gray-600">
          You don&apos;t have permission to access this page. If you believe
          this is an error, please contact an administrator or try logging in
          with an account that has the necessary permissions.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-3">
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link href="/login">
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
