"use client";

import { useActionState, useEffect, useOptimistic, useRef } from "react";

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

  // 3) Optimistic chats — starts as state.chats; can append UI-only messages instantly
  //    When the server action finishes, React replaces this with the new state.chats
  const [optimisticChats, addOptimisticChat] = useOptimistic(
    state.chats,
    (currentChats, newMessage: Message) => [...currentChats, newMessage],
  );

  const chatListRef = useRef<HTMLUListElement>(null);

  // 4) Scroll when optimistic list changes (user bubble appears immediately, then assistant)
  useEffect(() => {
    const list = chatListRef.current;
    if (!list) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth",
    });
  }, [optimisticChats]);

  // 5) Client wrapper: show user message first, THEN run the server action
  async function dispatchQuery(formData: FormData) {
    const userQuery = String(formData.get("user-query") ?? "").trim();

    // Instant UI update — does not wait for the network
    if (userQuery) {
      addOptimisticChat({
        role: "user",
        content: userQuery,
      });
    }

    // Real request — isPending becomes true; state updates on return
    await formAction(formData);
  }

  // 6) Empty screen: no messages yet (use optimistic length so first send switches layout)
  if (!optimisticChats.length) {
    return (
      <form
        className="flex h-screen w-full items-center justify-center px-4"
        action={dispatchQuery}
      >
        <UserQueryTextAreaAndOptions
          isPending={isPending}
          className="w-[90%] md:max-w-[60%]"
        />
      </form>
    );
  }

  // 7) Chat screen: render optimisticChats so the user message shows before the API returns
  return (
    <div className="flex h-screen w-full justify-center px-4">
      <div className="flex h-full w-[90%] flex-col md:max-w-[60%]">
        <ul
          ref={chatListRef}
          className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pt-8"
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
        </ul>

        <form action={dispatchQuery} className="w-full shrink-0 py-4">
          <UserQueryTextAreaAndOptions isPending={isPending} />
        </form>
      </div>
    </div>
  );
}
