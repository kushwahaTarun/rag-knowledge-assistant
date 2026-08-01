"use client";

import { flushSync } from "react-dom";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import type { Message } from "@/interfaces/chat";

/**
 * Everything this helper needs from React — supplied by the component that owns the state.
 * Lib files do not call useState; they only receive setters/values as arguments.
 */
export type StreamAnswerControls = {
  isStreaming: boolean;
  setChats: Dispatch<SetStateAction<Message[]>>;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
};

export async function sendQuestion(
  question: string,
  { isStreaming, setChats, setIsStreaming }: StreamAnswerControls,
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

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      },
    );

    if (!res.ok || !res.body) {
      throw new Error("Stream failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

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
