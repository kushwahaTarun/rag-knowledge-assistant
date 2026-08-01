import KnowledgeBaseClient from "@/components/home/KnowledgeBaseClient";

export async function HomeContent() {
  // making an API call to get the documents from the DB
  const response = await fetch(
    `${process.env.BACKEND_BASE_URL}/api/get-documents`,
    { cache: "no-store" },
  );

  // if error while making an API call or in the response
  if (!response.ok) {
    throw new Error("Error while extracting a documents from the database");
  }

  const result = await response.json();
  const documents = result.documents ?? [];

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
      <KnowledgeBaseClient documents={documents} />
    </section>
  );
}
