"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Inbox,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { deleteDocument, handleDocumentPreview } from "@/lib/action";
import { Button } from "@/components/ui/button";
import DocumentPreview from "@/components/Dialog/document-preview";
import {
  DocumentType,
  KnowledgeBaseDocType,
} from "@/interfaces/knowledge-base";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KnowledgeBaseTable({
  documents,
  selectedIds,
  onSelectionChange,
}: KnowledgeBaseDocType & {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // states that stores the document dialogue box visibility related state
  const [documentDialogue, setDocumentDialogue] = useState(false);

  // state variable that stores the selected document content
  const [documentContent, setDocumentContent] = useState({});

  const total = documents.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return documents.slice(start, start + PAGE_SIZE);
  }, [documents, currentPage]);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  const pageIds = pageItems.map((doc) => doc.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
      return;
    }
    onSelectionChange(Array.from(new Set([...selectedIds, ...pageIds])));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    onSelectionChange([...selectedIds, id]);
  };

  // triggers when user click on a row to see the table content on the drawer
  const documentPreview = async (id: string) => {
    const data = await handleDocumentPreview(id);
    const { success, document } = data;

    if (success) {
      // enabling the sidebar that shows the document content in it and also updating the state var to store the document content
      setDocumentDialogue(true);
      setDocumentContent(document);
    }
  };

  const handleRowDelete = (id: string) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteDocument(id);
      setDeletingId(null);

      if (!result.success) {
        toast.error(result.error ?? "Failed to delete document", {
          position: "top-center",
        });
        return;
      }

      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      toast.success("Document deleted", { position: "top-center" });
      router.refresh();
    });
  };

  if (!total) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-4 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox className="size-5" />
        </span>
        <div>
          <p className="font-medium tracking-tight">No documents yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a document to start building your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={toggleSelectAllPage}
                  aria-label="Select all documents on this page"
                  className="size-4 cursor-pointer rounded border-border accent-primary"
                />
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Created
              </th>
              <th className="w-16 px-4 py-3 text-right font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((document: DocumentType, index: number) => {
              const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
              const isSelected = selectedIds.includes(document.id);
              const isRowDeleting = deletingId === document.id;

              return (
                <tr
                  key={document.id}
                  className={cn(
                    "cursor-pointer border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/30",
                    isSelected && "bg-muted/40",
                  )}
                  onClick={() => documentPreview(document.id)}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(document.id)}
                      aria-label={`Select ${document.title || "document"}`}
                      className="size-4 cursor-pointer rounded border-border accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {rowNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <FileText className="size-4" />
                      </span>
                      <span className="truncate font-medium tracking-tight">
                        {document.title || "Untitled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(document.created_at)}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleRowDelete(document.id)}
                      aria-label={`Delete ${document.title || "document"}`}
                    >
                      {isRowDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Showing{" "}
          <span className="font-medium text-foreground">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of <span className="font-medium text-foreground">{total}</span>{" "}
          documents
          {selectedIds.length > 0 && (
            <>
              {" "}
              ·{" "}
              <span className="font-medium text-foreground">
                {selectedIds.length}
              </span>{" "}
              selected
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </Button>

          <span className="min-w-20 text-center text-xs text-muted-foreground sm:text-sm">
            Page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium text-foreground">{totalPages}</span>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <DocumentPreview
        documentContent={documentContent}
        setDocumentContent={setDocumentContent}
        documentDialogue={documentDialogue}
        setDocumentDialogue={setDocumentDialogue}
      />
    </div>
  );
}
