"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  ChevronUp,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { signOutUser } from "@/lib/action";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getUserInitials(email?: string | null) {
  if (!email) return "?";
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return local.slice(0, 2).toUpperCase() || "?";
}

function getDisplayName(email?: string | null) {
  if (!email) return "Account";
  const local = email.split("@")[0] ?? "user";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMemberSince(value?: string | null) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function UserAvatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide text-white/90",
        "bg-gradient-to-br from-cyan-800/70 to-sky-900/60",
        "shadow-md shadow-black/25 ring-1 ring-cyan-800/30",
        size === "lg" ? "size-11 text-xs" : "size-9 text-[11px]",
        className,
      )}
    >
      {initials}
      <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-sidebar bg-emerald-700/80" />
    </span>
  );
}

export function SidebarUserMenu() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Login/signup set the session via a *server* action (cookies).
    // The sidebar lives in the root layout, so it often stays mounted across
    // that redirect. Re-read the user on every navigation + auth event so the
    // profile appears without a full page reload.
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (isMounted) {
        setUser(currentUser);
        setIsLoading(false);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Prefer getUser() over event.session — cookie-based server login may not
      // push a populated session into this already-running browser client.
      void loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleLogout = () => {
    startTransition(async () => {
      await signOutUser();
    });
  };

  const email = user?.email ?? "";
  const displayName = getDisplayName(email);
  const initials = getUserInitials(email);
  const memberSince = formatMemberSince(user?.created_at);
  const isVerified = Boolean(user?.email_confirmed_at);

  if (isLoading) {
    return (
      <div className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2.5">
        <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted/60" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-muted/70" />
          <div className="h-2.5 w-28 animate-pulse rounded bg-muted/50" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "group/user-menu glass-soft flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors duration-200",
          "hover:bg-sidebar-accent/50 focus-visible:ring-2 focus-visible:ring-sidebar-ring/40",
          "data-popup-open:bg-sidebar-accent/60 data-popup-open:ring-1 data-popup-open:ring-border/80",
        )}
      >
        <UserAvatar initials={initials} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-medium leading-tight text-sidebar-foreground">
              {displayName}
            </span>
            {isVerified ? (
              <ShieldCheck className="size-3 shrink-0 text-cyan-400/70" />
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground">
            {email || "Signed in"}
          </span>
        </span>

        <ChevronUp
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open ? "rotate-0" : "rotate-180",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className={cn(
          "w-(--anchor-width) min-w-60 overflow-hidden rounded-xl p-0",
          "border border-border/70 bg-popover text-popover-foreground shadow-lg shadow-black/40",
        )}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/60 px-3 py-3">
          <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-cyan-900/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-0 size-20 rounded-full bg-sky-950/25 blur-2xl" />

          <div className="relative flex items-start gap-3">
            <UserAvatar initials={initials} size="lg" />

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="truncate text-sm font-medium tracking-tight text-foreground">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {email}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-700/80" />
                  Active
                </span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-700/25 bg-cyan-900/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400/80">
                    <ShieldCheck className="size-2.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-0.5 p-2">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
              <Mail className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                Email
              </p>
              <p className="truncate text-xs text-foreground/90">{email}</p>
            </div>
          </div>

          {memberSince ? (
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
                <Sparkles className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                  Member since
                </p>
                <p className="truncate text-xs text-foreground/90">
                  {memberSince}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Logout */}
        <div className="border-t border-border/60 p-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
              "bg-destructive/10 text-destructive hover:bg-destructive/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/25",
              "disabled:pointer-events-none disabled:opacity-60",
            )}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            <span>{isPending ? "Signing out…" : "Log out"}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
