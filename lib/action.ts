"use server";

import { revalidatePath } from "next/cache";

import { chatFormState } from "@/interfaces/chat";

type UploadState = {
  error: string;
  document_id?: string;
};

// Function that makes an API call to upload the document to the DB
// Supports two sources from the dialog:
// 1) Paste mode  → form field "document" (plain text)
// 2) File mode   → form field "file" (.txt File)
export async function uploadDocument(
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const title = formData.get("title");
  const pastedText = formData.get("document");
  const file = formData.get("file");

  if (typeof title !== "string" || !title.trim().length) {
    return { error: "Please provide a document title" };
  }

  const hasFile = file instanceof File && file.size > 0;
  const hasPaste =
    typeof pastedText === "string" && pastedText.trim().length > 0;

  if (!hasFile && !hasPaste) {
    return {
      error: "Knowledge cannot be empty. Paste text or upload a .txt file",
    };
  }

  try {
    // Multipart FormData so the backend can read either req.file or req.body.fullText
    const outbound = new FormData();
    outbound.append("title", title.trim());

    if (hasFile) {
      // File mode: multer reads field name "file"
      outbound.append("file", file);
    } else if (hasPaste) {
      // Paste mode: text sent as a form field (no file attached)
      outbound.append("fullText", (pastedText as string).trim());
    }

    // Do NOT set Content-Type — fetch sets multipart boundary automatically
    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/api/documents`,
      {
        method: "POST",
        body: outbound,
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return {
        error:
          (errorBody && (errorBody.error || errorBody.message)) ||
          "Failed to upload a document",
      };
    }

    const data = await response.json();
    const { document_id } = data;

    revalidatePath("/");

    return {
      error: "",
      document_id,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

// Function that makes an API call to get the user query response
export async function submitQuery(
  prevState: chatFormState,
  formData: FormData,
): Promise<chatFormState> {
  const rawQuery = formData.get("user-query");
  const userQuery = typeof rawQuery === "string" ? rawQuery.trim() : "";

  // Empty query: keep existing history, surface an error
  if (!userQuery) {
    return {
      error: "Please provide your query",
      chats: prevState.chats,
    };
  }

  // Build chats with the user message first (source of truth for the client after return)
  const chatsWithUser = [
    ...prevState.chats,
    {
      role: "user" as const,
      content: userQuery,
    },
  ];

  try {
    const response = await fetch(`${process.env.BACKEND_BASE_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: userQuery,
      }),
    });

    if (!response.ok) {
      return {
        error: "Failed to get a response",
        chats: chatsWithUser,
      };
    }

    const result = await response.json();

    return {
      error: "",
      chats: [
        ...chatsWithUser,
        {
          role: "assistant",
          content: result.answer,
        },
      ],
    };
  } catch {
    return {
      error: "Something went wrong",
      chats: chatsWithUser,
    };
  }
}

// Function that is responsible for getting the document content once user click on the document in the KB
export async function handleDocumentPreview(id: string) {

  try {
    const result = await fetch(`${process.env.BACKEND_BASE_URL}/api/documents/${id}`);

    if(!result.ok) {
      throw new Error("Error while accessing the document content");
    }

    const response = await result.json();

    return response;
  }
  catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Error while accessing the document content",
    );
  }
}

// Function that deletes a single document from the knowledge base
export async function deleteDocument(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!id) {
    return { success: false, error: "Document id is required" };
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/api/documents/${id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      return { success: false, error: "Failed to delete document" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

// Function that deletes multiple documents from the knowledge base
export async function deleteDocuments(ids: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!ids.length) {
    return { success: false, error: "No documents selected" };
  }

  try {
    const results = await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(
          `${process.env.BACKEND_BASE_URL}/api/documents/${id}`,
          { method: "DELETE" },
        );
        return response.ok;
      }),
    );

    if (results.some((ok) => !ok)) {
      revalidatePath("/");
      return {
        success: false,
        error: "Some documents could not be deleted",
      };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}