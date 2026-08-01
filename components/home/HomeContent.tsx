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

  // Outer full-width scroller → scrollbar sits at the page edge (SidebarInset),
  // not hugging the table. Inner container keeps content centered.
  return (
    <div className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain">
      <section className="mx-auto w-full max-w-6xl px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10">
        <KnowledgeBaseClient documents={documents} />
      </section>
    </div>
  );
}
