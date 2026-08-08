import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in · RAG Knowledge Assistant",
  description: "Sign in to access your knowledge base and chat.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-cyan-900/20 blur-3xl" />
        <div className="absolute -right-16 bottom-8 size-64 rounded-full bg-sky-950/25 blur-3xl" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-12">
        <LoginForm />
      </div>
    </div>
  );
}
