import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UploadDocumentDialog from "@/components/Dialog/upload-document";
import KnowledgeBaseTable from "@/components/home/KnowledgeBaseTable";

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
    <section className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Knowledge Base
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload documents to build your knowledge base.
            </p>
          </div>

          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2 shrink-0">
                  <Upload className="size-4" />
                  Upload document
                </Button>
              }
            />
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <UploadDocumentDialog />
            </DialogContent>
          </Dialog>
        </div>

        <KnowledgeBaseTable documents={documents} />
      </div>
    </section>
  );
}
