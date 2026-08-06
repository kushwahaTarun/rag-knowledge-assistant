"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Loader2, MessageSquare, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn, handleDeleteConversation } from "@/lib/utils";

const navItems = [
  {
    title: "Knowledge Base",
    href: "/",
    icon: BookOpen,
    description: "Manage documents",
  },
  {
    title: "Chat Interface",
    href: "/chat",
    icon: MessageSquare,
    description: "Ask your docs",
  },
];

type Conversation = {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
};

function formatConversationDate(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("c");
  const isChatPage = pathname.startsWith("/chat");
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Load conversation list only while on the chat page
  useEffect(() => {
    if (!isChatPage) {
      setConversations([]);
      setHistoryError(null);
      setIsLoadingHistory(false);
      return;
    }

    const controller = new AbortController();

    async function loadConversations() {
      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not set");
        }

        const res = await fetch(`${baseUrl}/api/conversations`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to load conversations");
        }

        const json = (await res.json()) as {
          success?: boolean;
          conversations?: Conversation[];
        };

        const list = Array.isArray(json.conversations)
          ? json.conversations
          : [];

        // Newest first when timestamps exist
        list.sort((a, b) => {
          const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
          const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
          return bTime - aTime;
        });

        setConversations(list);
      } catch (err) {
        if (controller.signal.aborted) return;
        setHistoryError(
          err instanceof Error ? err.message : "Failed to load conversations",
        );
        setConversations([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingHistory(false);
        }
      }
    }

    void loadConversations();

    return () => controller.abort();
  }, [isChatPage]);

  return (
    <Sidebar className="border-sidebar-border/80">
      <SidebarHeader className="border-b border-sidebar-border/80 px-3 py-4">
        <div className="flex items-center gap-3 px-1">
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-700/80 to-sky-800/70 text-white shadow-lg shadow-black/30"
          >
            <Sparkles className="size-4.5" />
            <span className="nav-pulse absolute inset-0 rounded-xl ring-2 ring-cyan-800/30" />
          </motion.span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold tracking-tight">
              RAG Assistant
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Knowledge & chat
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href) && !activeConversationId;

                return (
                  <SidebarMenuItem key={item.href} className="my-1">
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                      className={cn(
                        // Use group/menu-button (from SidebarMenuButton), not bare "group"
                        // — the sidebar root is also "group", which made every icon light up
                        "relative h-11 overflow-hidden rounded-xl transition-all duration-300",
                        isActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-black/15",
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-gradient-to-b from-cyan-600 to-sky-700" />
                      )}
                      <span className="flex items-center gap-2">
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 transition-colors duration-200",
                            isActive
                              ? "text-cyan-400/80"
                              : "text-muted-foreground group-hover/menu-button:text-sidebar-accent-foreground",
                          )}
                        />
                        <span className="flex flex-col items-start leading-tight">
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat history only on /chat (list + fetch gated by isChatPage) */}
        {isChatPage ? (
          <SidebarGroup className="mt-2 flex min-h-0 flex-1 flex-col">
            <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
              Chat history
            </SidebarGroupLabel>
            <SidebarGroupContent className="min-h-0 flex-1 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading chats…
                </div>
              ) : historyError ? (
                <p className="px-2 py-2 text-xs text-destructive/90">
                  {historyError}
                </p>
              ) : conversations.length === 0 ? (
                <p className="px-2 py-2 text-xs leading-relaxed text-muted-foreground">
                  No conversations yet. Start a chat to see history here.
                </p>
              ) : (
                <SidebarMenu>
                  {conversations.map((conversation) => {
                    const href = `/chat?c=${conversation.id}`;
                    const isActive = activeConversationId === conversation.id;
                    const dateLabel = formatConversationDate(
                      conversation.updated_at ?? conversation.created_at,
                    );

                    return (
                      <SidebarMenuItem
                        key={conversation.id}
                        className="group/history-row relative my-0.5"
                      >
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={conversation.title || "Untitled chat"}
                          render={<Link href={href} />}
                          className={cn(
                            "relative h-11 overflow-hidden rounded-lg px-2.5 pr-14 transition-colors duration-200",
                            isActive
                              ? "bg-sidebar-accent/90 text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent/50",
                          )}
                        >
                          {isActive ? (
                            <span
                              aria-hidden
                              className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cyan-500/70"
                            />
                          ) : null}
                          <span className="min-w-0 flex-1 truncate pl-1 text-left text-[13px] font-medium tracking-tight text-sidebar-foreground/90">
                            {conversation.title?.trim() || "Untitled chat"}
                          </span>
                        </SidebarMenuButton>

                        {/*
                          Premium meta slot: date by default; on row hover it
                          crossfades into a quiet text action (no icon chrome).
                        */}
                        <div className="pointer-events-none absolute inset-y-0 right-1.5 z-10 flex w-12 items-center justify-end">
                          {dateLabel ? (
                            <span
                              className={cn(
                                "text-[10px] tabular-nums tracking-wide text-muted-foreground/55 transition-opacity duration-200",
                                "group-hover/history-row:opacity-0 group-focus-within/history-row:opacity-0",
                              )}
                            >
                              {dateLabel}
                            </span>
                          ) : null}

                          <button
                            type="button"
                            aria-label={`Delete ${conversation.title?.trim() || "conversation"}`}
                            className={cn(
                              "pointer-events-none absolute right-0 rounded-md px-1.5 py-1",
                              "text-[10px] font-medium tracking-wide text-muted-foreground/70",
                              "opacity-0 transition-all duration-200",
                              "group-hover/history-row:pointer-events-auto group-hover/history-row:opacity-100",
                              "group-focus-within/history-row:pointer-events-auto group-focus-within/history-row:opacity-100",
                              "hover:bg-white/[0.04] hover:text-rose-300/90",
                              "focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400/25",
                            )}
                            onClick={() =>
                              handleDeleteConversation(conversation.id, router)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        <div className="glass-soft rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-medium text-foreground/90">
            Powered by RAG
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
            Upload docs, retrieve context, get grounded answers.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
