"use client";

import { flushSync } from "react-dom";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import type { Message } from "@/interfaces/chat";
import { saveConversationMessage } from "@/lib/utils";

/**
 * Everything this helper needs from React — supplied by the component that owns the state.
 * Lib files do not call useState; they only receive setters/values as arguments.
 */
export type StreamAnswerControls = {
  isStreaming: boolean;
  setChats: Dispatch<SetStateAction<Message[]>>;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
  conversationId?: string | null;
  /** Used to set ?c= after creating a new conversation */
  router?: { replace: (href: string) => void };
};

export async function sendQuestion(
  question: string,
  {
    isStreaming,
    setChats,
    setIsStreaming,
    conversationId,
    router,
  }: StreamAnswerControls,
) {
  if (!question || isStreaming) return;

  // Force an immediate paint of the user message before any await
  flushSync(() => {
    setChats((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);
    setIsStreaming(true);
  });

  // Local id so we can reassign after create (URL param is not writable)
  let activeConversationId = conversationId ?? null;
  // True when this turn created a brand-new conversation (need URL update)
  let createdNewConversation = false;

  try {
    // Flow B: /chat with no ?c= → create a conversation first
    if (!activeConversationId) {
      const createRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // API returns { conversation: { id, title, ... } } — not conversationId
          body: JSON.stringify({ title: question.slice(0, 80) }),
        },
      );

      if (!createRes.ok) {
        throw new Error("Failed to create conversation");
      }

      const createData = (await createRes.json()) as {
        conversation?: { id?: string };
      };
      const newId = createData.conversation?.id;

      if (!newId) {
        throw new Error(
          "Create conversation response missing conversation.id",
        );
      }

      activeConversationId = newId;
      createdNewConversation = true;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          conversationId: activeConversationId,
        }),
      },
    );

    if (!res.ok || !res.body) {
      throw new Error("Stream failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullAssistant = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        const json = JSON.parse(line.slice(5).trim()) as {
          text?: string;
          done?: boolean;
        };

        if (json.done) continue;
        if (!json.text) continue;

        fullAssistant += json.text;

        setChats((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (!last || last.role !== "assistant") return prev;

          next[next.length - 1] = {
            ...last,
            content: last.content + json.text,
          };
          return next;
        });
      }
    }

    // Persist turn under this conversation (existing or newly created)
    if (activeConversationId && fullAssistant.trim()) {
      try {
        await saveConversationMessage(activeConversationId, "user", question);
        await saveConversationMessage(
          activeConversationId,
          "assistant",
          fullAssistant,
        );
      } catch (saveError) {
        console.error("Failed to persist conversation messages:", saveError);
      }
    }

    // Put ?c= in the URL so later messages continue the same thread
    if (createdNewConversation && activeConversationId && router) {
      router.replace(`/chat?c=${activeConversationId}`);
    }
  } catch {
    setChats((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant" && !last.content) {
        next[next.length - 1] = {
          ...last,
          content: "Something went wrong. Please try again.",
        };
      }
      return next;
    });
  } finally {
    setIsStreaming(false);
  }
}

/** Bind React state into a form onSubmit handler */
export function createHandleSubmit(controls: StreamAnswerControls) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const question = String(formData.get("user-query") ?? "").trim();
    form.reset();
    void sendQuestion(question, controls);
  };
}
