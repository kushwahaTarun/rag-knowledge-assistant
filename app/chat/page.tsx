"use client";

import {
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";

import UserQueryTextAreaAndOptions from "@/components/ChatInterface/user-query-section";
import { submitQuery } from "@/lib/action";
import { Message, chatFormState } from "@/interfaces/chat";

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
        <UserQueryTextAreaAndOptions
          isPending={showThinking}
          className="w-full max-w-[60%]"
        />
      </form>
    );
  }

  // 7) Chat screen: list scrolls; textarea stays pinned at the bottom
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[60%] flex-col overflow-hidden px-4">
        <ul
          ref={chatListRef}
          className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pt-6"
        >
          {optimisticChats.map((chat: Message, index: number) => {
            return (
              <li
                key={index}
                className={`max-w-[90%] px-4 py-2.5 text-lg leading-7 ${
                  chat.role === "user"
                    ? "ml-auto rounded-xl bg-gray-900 text-white"
                    : "mr-auto"
                }`}
              >
                {chat.content}
              </li>
            );
          })}

          {/* Thinking animation */}
          {showThinking && (
            <li className="mr-auto flex items-center gap-2 px-4 py-2.5 text-muted-foreground">
              <span className="text-base">Thinking</span>
              <span className="inline-flex items-end gap-1 pb-0.5" aria-hidden>
                <span className="thinking-dot" />
                <span className="thinking-dot thinking-dot-delay-1" />
                <span className="thinking-dot thinking-dot-delay-2" />
              </span>
            </li>
          )}
        </ul>

        <form
          action={dispatchQuery}
          className="w-full shrink-0 border-t border-border/40 bg-background py-4"
        >
          <UserQueryTextAreaAndOptions isPending={showThinking} />
        </form>
      </div>
    </div>
  );
}
