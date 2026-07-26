"use server";

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

export async function submitQuery(prevState: chatFormState, formData) {

    const userQuery = formData.get("user-query");
    
    prevState = {
        error: "",
        chats: [
            ...prevState.chats,
            {
                role: "user",
                content: userQuery
            }
        ]
    }

try{

    // if no query is provided by the user returning an error to the user
    if(!userQuery.trim()) {
        return {
            error: "Please provide you query",
            chats: []
        }
    }

    const response = await fetch(`${process.env.BACKEND_BASE_URL}/api/ask`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: userQuery
        })
    })

    const result = await response.json();
    console.log(result);
    return {
        error: "",
        chats: [
            ...prevState.chats,
            {
                role: "assistant",
                content: result.answer
            }
        ]
    }

}
catch(err) {
    return {
        error: err.message,
        content: []
    }
}
}
