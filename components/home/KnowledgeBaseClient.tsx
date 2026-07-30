"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { deleteDocuments } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UploadDocumentDialog from "@/components/Dialog/upload-document";
import KnowledgeBaseTable from "@/components/home/KnowledgeBaseTable";
import { DocumentType } from "@/interfaces/knowledge-base";

export default function KnowledgeBaseClient({
  documents,
}: {
  documents: DocumentType[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;

    const count = selectedIds.length;
    if (
      !window.confirm(
        `Delete ${count} document${count === 1 ? "" : "s"}? This cannot be undone.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDocuments(selectedIds);

      if (!result.success) {
        toast.error(result.error ?? "Failed to delete documents", {
          position: "top-center",
        });
        return;
      }

      setSelectedIds([]);
      toast.success(
        count === 1 ? "Document deleted" : `${count} documents deleted`,
        { position: "top-center" },
      );
      router.refresh();
    });
  };

  return (
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

        <div className="flex shrink-0 items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              disabled={isPending}
              onClick={handleBulkDelete}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete ({selectedIds.length})
            </Button>
          )}

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
      </div>

      <KnowledgeBaseTable
        documents={documents}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}
