"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquareText, User } from "lucide-react";

import UserQueryTextAreaAndOptions from "@/components/ChatInterface/user-query-section";
import { Message } from "@/interfaces/chat";
import { createHandleSubmit } from "@/lib/stream-answer";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  // State lives HERE (in the component). Helpers only receive setters as args.
  const [chats, setChats] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatListRef = useRef<HTMLUListElement>(null);

  // Pass state + setters into the lib helper so it can update UI
  const handleSubmit = useMemo(
    () =>
      createHandleSubmit({
        isStreaming,
        setChats,
        setIsStreaming,
      }),
    [isStreaming],
  );

  // Keep the message list scrolled to the latest content
  useEffect(() => {
    const list = chatListRef.current;
    if (!list) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth",
    });
  }, [chats, isStreaming]);

  // Empty screen: no messages yet
  if (!chats.length) {
    return (
      <form
        className="flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-4"
        onSubmit={handleSubmit}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full max-w-2xl flex-col items-center gap-8"
        >
          <div className="flex flex-col items-center text-center">
            <motion.span
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40 shadow-lg shadow-black/15"
            >
              <MessageSquareText className="size-7" />
            </motion.span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-gradient">Chat with your knowledge</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Ask questions and get answers grounded in the documents
              you&apos;ve uploaded to your knowledge base.
            </p>
          </div>

          <UserQueryTextAreaAndOptions
            isPending={isStreaming}
            className="w-full"
          />
        </motion.div>
      </form>
    );
  }

  // Chat screen: list scrolls; textarea stays pinned at the bottom
  const showThinking =
    isStreaming &&
    chats[chats.length - 1]?.role === "assistant" &&
    !chats[chats.length - 1]?.content;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden px-4">
        <ul
          ref={chatListRef}
          className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain py-6"
        >
          <AnimatePresence initial={false}>
            {chats.map((chat: Message, index: number) => {
              const isUser = chat.role === "user";
              // Hide empty assistant bubble until first token (thinking row shows instead)
              if (!isUser && !chat.content && isStreaming) {
                return null;
              }

              return (
                <motion.li
                  key={`${chat.role}-${index}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "flex max-w-[92%] gap-2.5 sm:max-w-[85%]",
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl ring-1",
                      isUser
                        ? "bg-cyan-900/30 text-cyan-400/80 ring-cyan-800/40"
                        : "bg-muted/80 text-muted-foreground ring-border/60",
                    )}
                  >
                    {isUser ? (
                      <User className="size-3.5" />
                    ) : (
                      <Bot className="size-3.5" />
                    )}
                  </span>

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-[15px] leading-7 shadow-sm",
                      isUser
                        ? "rounded-tr-md bg-gradient-to-br from-cyan-800 to-sky-900 text-white shadow-black/25"
                        : "rounded-tl-md border border-border/60 bg-card/70 text-foreground backdrop-blur-sm",
                    )}
                  >
                    {chat.content}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>

          {showThinking && (
            <motion.li
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto flex max-w-[85%] items-center gap-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground ring-1 ring-border/60">
                <Bot className="size-3.5" />
              </span>
              <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-md border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-sm">
                <span className="text-sm text-muted-foreground">Thinking</span>
                <span
                  className="inline-flex items-end gap-1.5 pb-0.5"
                  aria-hidden
                >
                  <span className="thinking-dot" />
                  <span className="thinking-dot thinking-dot-delay-1" />
                  <span className="thinking-dot thinking-dot-delay-2" />
                </span>
              </div>
            </motion.li>
          )}
        </ul>

        <form
          onSubmit={handleSubmit}
          className="w-full shrink-0 border-t border-border/40 bg-gradient-to-t from-background via-background/95 to-transparent py-4"
        >
          <UserQueryTextAreaAndOptions isPending={isStreaming} compact />
        </form>
      </div>
    </div>
  );
}
