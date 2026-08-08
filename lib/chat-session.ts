/**
 * Cross-component signals (window events).
 * Used when two client components do not share React state
 * (e.g. chat page stream helper ↔ sidebar history list).
 */

const NEW_CHAT_EVENT = "rag:new-chat";
const CONVERSATION_CREATED_EVENT = "rag:conversation-created";

export type CreatedConversation = {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
};

export function requestNewChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NEW_CHAT_EVENT));
}

export function onNewChatRequest(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(NEW_CHAT_EVENT, handler);
  return () => window.removeEventListener(NEW_CHAT_EVENT, handler);
}

/** Call after Flow B creates a conversation so the sidebar can prepend it. */
export function notifyConversationCreated(conversation: CreatedConversation) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CONVERSATION_CREATED_EVENT, { detail: conversation }),
  );
}

export function onConversationCreated(
  callback: (conversation: CreatedConversation) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const custom = event as CustomEvent<CreatedConversation>;
    if (custom.detail?.id) {
      callback(custom.detail);
    }
  };

  window.addEventListener(CONVERSATION_CREATED_EVENT, handler);
  return () => window.removeEventListener(CONVERSATION_CREATED_EVENT, handler);
}
