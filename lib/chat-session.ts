/** Cross-component signal so the sidebar can start a fresh chat. */

const NEW_CHAT_EVENT = "rag:new-chat";

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
