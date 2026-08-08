import { Suspense } from "react";

import ChatPageContent from "./ChatPageContent";

/**
 * useSearchParams() in the chat client tree requires a Suspense boundary
 * so the page can still be statically prepared during `next build`.
 */
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading chat…
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
