"use client";

import { useActionState } from "react";

import UserQueryTextAreaAndOptions from "@/components/ChatInterface/user-query-section";
import { submitQuery } from "@/lib/action";
import { Message, chatFormState } from "@/interfaces/chat";

export default function ChatPage() {
  // intial state of the useActionState hook
  const initialState: chatFormState = {
    error: "",
    chats: [],
  };

  const [state, formAction, isPending] = useActionState(
    submitQuery,
    initialState,
  );

  // RENDER THE TEXTAREA AND THE BRANDING
  if (!state?.error && !state?.chats.length) {
    return (
      <form
        className="flex h-screen w-full items-center justify-center px-4"
        action={formAction}
      >
        <UserQueryTextAreaAndOptions
          isPending={isPending}
          className="w-[90%] md:max-w-[60%]"
        />
      </form>
    );
  }

  // RENDER ONCE THE CHATS ARE PRESENT
  if (!state?.error && state?.chats.length) {
    const { chats }: chatFormState = state;
    return (
      <div className="flex h-screen w-full justify-center px-4">
        {/* Same width as the initial screen input */}
        <div className="flex h-full w-[90%] flex-col md:max-w-[60%]">
          <ul className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pt-8">
            {chats.map((chat: Message, index: number) => {
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

          <form action={formAction} className="w-full shrink-0 py-4">
            <UserQueryTextAreaAndOptions isPending={isPending} />
          </form>
        </div>
      </div>
    );
  }

  return null;
}
