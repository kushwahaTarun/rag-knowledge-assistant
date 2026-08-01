"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, MessageSquare, Sparkles } from "lucide-react";

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
import { cn } from "@/lib/utils";

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

export function AppSidebar() {
  const pathname = usePathname();

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
              {navItems.map((item, index) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href} className="my-1">
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                      className={cn(
                        "group relative h-11 overflow-hidden rounded-xl transition-all duration-300",
                        isActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-black/15",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-gradient-to-b from-cyan-600 to-sky-700"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <item.icon
                          className={cn(
                            "size-4 transition-colors duration-200",
                            isActive
                              ? "text-cyan-400/80"
                              : "text-muted-foreground group-hover:text-foreground",
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
                      </motion.span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
