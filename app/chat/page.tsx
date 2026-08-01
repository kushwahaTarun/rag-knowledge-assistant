"use client";

import {
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquareText, User } from "lucide-react";

import UserQueryTextAreaAndOptions from "@/components/ChatInterface/user-query-section";
import { submitQuery } from "@/lib/action";
import { Message, chatFormState } from "@/interfaces/chat";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  // 1) Initial state for useActionState — empty chat + no error
  const initialState: chatFormState = {
    error: "",
    chats: [],
  };

  // 2) Real server state — only updates when submitQuery RETURNS
  const [state, formAction, isPending] = useActionState(
    submitQuery,
    initialState,
  );

  // Local flag — more reliable than isPending alone when formAction is wrapped
  const [isThinking, setIsThinking] = useState(false);

  // 3) Optimistic chats — starts as state.chats; can append UI-only messages instantly
  //    When the server action finishes, React replaces this with the new state.chats
  const [optimisticChats, addOptimisticChat] = useOptimistic(
    state.chats,
    (currentChats, newMessage: Message) => [...currentChats, newMessage],
  );

  const chatListRef = useRef<HTMLUListElement>(null);
  const showThinking = isThinking || isPending;

  // 4) Scroll when optimistic list changes (user bubble appears immediately, then assistant)
  useEffect(() => {
    const list = chatListRef.current;
    if (!list) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth",
    });
  }, [optimisticChats, showThinking]);

  // 5) Client wrapper: show user message first, THEN run the server action
  async function dispatchQuery(formData: FormData) {
    const userQuery = String(formData.get("user-query") ?? "").trim();

    // Instant UI update — does not wait for the network
    if (userQuery) {
      addOptimisticChat({
        role: "user",
        content: userQuery,
      });
      setIsThinking(true);
    }

    try {
      // Real request — isPending becomes true; state updates on return
      await formAction(formData);
    } finally {
      setIsThinking(false);
    }
  }

  // 6) Empty screen: no messages yet (use optimistic length so first send switches layout)
  if (!optimisticChats.length) {
    return (
      <form
        className="flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-4"
        action={dispatchQuery}
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
              Ask questions and get answers grounded in the documents you&apos;ve
              uploaded to your knowledge base.
            </p>
          </div>

          <UserQueryTextAreaAndOptions
            isPending={showThinking}
            className="w-full"
          />
        </motion.div>
      </form>
    );
  }

  // 7) Chat screen: list scrolls; textarea stays pinned at the bottom
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden px-4">
        <ul
          ref={chatListRef}
          className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain py-6"
        >
          <AnimatePresence initial={false}>
            {optimisticChats.map((chat: Message, index: number) => {
              const isUser = chat.role === "user";

              return (
                <motion.li
                  key={`${chat.role}-${index}-${chat.content.slice(0, 24)}`}
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

          {/* Thinking animation */}
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
                <span className="inline-flex items-end gap-1.5 pb-0.5" aria-hidden>
                  <span className="thinking-dot" />
                  <span className="thinking-dot thinking-dot-delay-1" />
                  <span className="thinking-dot thinking-dot-delay-2" />
                </span>
              </div>
            </motion.li>
          )}
        </ul>

        <form
          action={dispatchQuery}
          className="w-full shrink-0 border-t border-border/40 bg-gradient-to-t from-background via-background/95 to-transparent py-4"
        >
          <UserQueryTextAreaAndOptions isPending={showThinking} compact />
        </form>
      </div>
    </div>
  );
}
