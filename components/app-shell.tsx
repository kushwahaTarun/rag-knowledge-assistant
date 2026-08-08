"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

/** Routes that should not show the app sidebar / header chrome */
const AUTH_PATH_PREFIXES = ["/login", "/signup", "/auth"];

function isAuthRoute(pathname: string) {
  return AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Chooses full app chrome vs minimal auth shell based on the current path.
 * Keeps login/signup full-viewport on mobile without the sidebar trigger.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authOnly = isAuthRoute(pathname);

  if (authOnly) {
    return (
      <div className="mesh-bg flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider className="!h-full !min-h-0">
      {/* useSearchParams in AppSidebar needs a Suspense boundary */}
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <SidebarInset className="mesh-bg min-h-0 min-w-0 overflow-hidden">
        <AppHeader />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
