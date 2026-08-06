import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FUNCTION THAT WILL DISPLAY THE CHATS OF THE CONVERSATION
export async function displayConversationChats(conversationId: string) {
  try {
    if (!conversationId) {
      console.error("Conversation ID is required to display chats.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/conversations/${conversationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch chats for conversation ${conversationId}: ${response.statusText}`,
      );
      return;
    }

    const chats = await response.json();
    return chats;
  } catch (error) {
    console.error("An error occurred while fetching chats:", error);
  }
}

/** Persist one bubble under an existing conversation (Flow A: continue chat). */
export async function saveConversationMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  if (!conversationId || !content.trim()) return;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, content: content.trim() }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to save ${role} message`);
  }

  return response.json();
}

// FUNCTION THAT WILL DELETE THE CONVERSATION
export async function handleDeleteConversation(conversationId: string, router: { replace: (href: string) => void }) {
  if (!conversationId) return;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/conversations/${conversationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete conversation");
    }

    router.replace("/chat");
    return response.json();
  } catch (error) {
    console.error("An error occurred while deleting the conversation:", error);
  }
}