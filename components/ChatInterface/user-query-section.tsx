"use client";

import { ArrowUpIcon, LoaderIcon, Sparkles } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserQueryTextAreaAndOptions({
  isPending,
  className,
  compact = false,
}: {
  isPending: boolean;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/50 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-300",
        "focus-within:border-cyan-700/35 focus-within:shadow-black/15 focus-within:glow-primary",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-700/30 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />

      <Textarea
        className={cn(
          // text-base (16px) on mobile avoids iOS zoom-on-focus; slightly smaller on md+
          "scrollbar-hide max-h-36 w-full resize-none border-0 bg-transparent px-3 pb-14 pt-3 text-base shadow-none focus-visible:border-transparent focus-visible:ring-0 sm:max-h-40 sm:px-4 sm:pt-4 md:text-[15px]",
          compact ? "min-h-[4.25rem] sm:min-h-20" : "min-h-[5.5rem] sm:min-h-28",
        )}
        placeholder="Ask anything about your knowledge base…"
        name="user-query"
        disabled={isPending}
        enterKeyHint="send"
        autoComplete="off"
        rows={compact ? 2 : 3}
      />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        <span className="hidden min-w-0 items-center gap-1.5 truncate text-[11px] text-muted-foreground sm:inline-flex">
          <Sparkles className="size-3 shrink-0 text-cyan-400/70" />
          Answers grounded in your documents
        </span>

        <Button
          className={cn(
            // 44px+ touch target on phones
            "ml-auto size-11 shrink-0 rounded-xl transition-all duration-200 sm:size-10",
            "bg-gradient-to-br from-cyan-700 to-sky-800 text-white shadow-lg shadow-black/30",
            "hover:scale-105 hover:from-cyan-600 hover:to-sky-700",
            "active:scale-95 disabled:opacity-60",
          )}
          size="icon"
          name="user-query-submit"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderIcon
              role="status"
              aria-label="Loading"
              className="size-4 animate-spin"
            />
          ) : (
            <ArrowUpIcon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
