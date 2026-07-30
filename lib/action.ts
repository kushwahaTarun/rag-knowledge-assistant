"use server";

import { revalidatePath } from "next/cache";

import { chatFormState } from "@/interfaces/chat";

type UploadState = {
  error: string;
  document_id?: string;
};

// Function that makes an API call to upload the document to the DB
export async function uploadDocument(
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const document = formData.get("document");
  const title = formData.get("title");

  // if user has not provided the document title or the document text
  if (
    typeof title !== "string" ||
    typeof document !== "string" ||
    !title.trim().length ||
    !document.trim().length
  ) {
    return {
      error: "Knowledge cannot be empty, Please add some data",
    };
  }

  try {
    // API call to store the document on the DB
    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/api/documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          fullText: document,
        }),
      },
    );

    if (!response.ok) {
      return { error: "Failed to upload a document" };
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