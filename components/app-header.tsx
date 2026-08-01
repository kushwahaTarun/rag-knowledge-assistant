"use client";

import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { requestNewChat } from "@/lib/chat-session";

export function AppHeader() {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");

  return (
    <header className="glass-soft relative z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-3 pt-[env(safe-area-inset-top)] sm:gap-3 sm:px-4">
      <SidebarTrigger className="shrink-0 transition-transform duration-200 hover:scale-105" />
      <div className="h-4 w-px shrink-0 bg-border/70" />
      <p className="min-w-0 flex-1 truncate text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
        Intelligent document search & chat
      </p>

      {isChat && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => requestNewChat()}
          className="ml-auto size-9 shrink-0 text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground active:scale-95"
          aria-label="New chat"
          title="New chat"
        >
          <MessageSquarePlus className="size-4" />
        </Button>
      )}
    </header>
  );
}
