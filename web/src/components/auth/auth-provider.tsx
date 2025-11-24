"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getClientSession } from "@/lib/auth/client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is authenticated on client-side
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const session = await getClientSession();

        // Only redirect if the component is still mounted and we're in a protected route
        if (mounted && !session && !pathname.includes("/login")) {
          console.log("No session found, redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  // Don't show children until auth check is complete
  // This prevents flash of content before redirects
  return <>{children}</>;
}
