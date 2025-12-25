"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardSetupLoader() {
  const router = useRouter();

  useEffect(() => {
    // Auto-refresh after a short delay to allow user creation to complete
    const timer = setTimeout(() => {
      router.refresh();
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Setting up your dashboard...</p>
      </div>
    </div>
  );
}
