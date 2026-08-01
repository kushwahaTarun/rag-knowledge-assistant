import Link from "next/link";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center px-4">
      <div className="glass-panel relative max-w-md overflow-hidden rounded-2xl p-8 text-center sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-cyan-900/25 blur-3xl" />
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40">
          <SearchX className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <Button
          render={<Link href="/" />}
          className="mt-6 gap-2 bg-gradient-to-br from-cyan-700 to-sky-800 text-white"
        >
          <Home className="size-4" />
          Back to Knowledge Base
        </Button>
      </div>
    </div>
  );
}
