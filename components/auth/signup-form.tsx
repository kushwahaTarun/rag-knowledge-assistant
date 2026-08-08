"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useActionState, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signUpUser } from "@/lib/action";

/**
 * Presentational signup UI only — email + password, no auth logic.
 */
export function SignupForm() {
  const initialState = {
    error: "",
    success: false,
  };

  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    signUpUser,
    initialState,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel relative w-full max-w-md overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-cyan-900/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 size-36 rounded-full bg-sky-950/25 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-800/35 to-sky-900/25 text-cyan-400/85 ring-1 ring-cyan-800/40 shadow-lg shadow-black/20">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
            <span className="text-gradient">Create your account</span>
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Join RAG Assistant to upload documents and chat with your private
            knowledge base.
          </p>
        </div>

        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/55" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isPending}
                className="h-11 border-border/70 bg-background/40 pe-3 ps-10 text-base transition-all focus-visible:border-cyan-700/35 md:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/55" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                disabled={isPending}
                className="h-11 border-border/70 bg-background/40 pe-11 ps-10 text-base transition-all focus-visible:border-cyan-700/35 md:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted/40 hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "mt-1 h-11 w-full gap-2 bg-gradient-to-br from-cyan-700 to-sky-800 text-white shadow-lg shadow-black/25",
              "transition-transform hover:scale-[1.01] hover:from-cyan-600 hover:to-sky-700 active:scale-[0.99]",
            )}
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-cyan-400/90 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
