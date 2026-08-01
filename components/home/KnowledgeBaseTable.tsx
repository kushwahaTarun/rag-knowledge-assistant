"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

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
    setPreviewLoadingId(id);
    try {
      const data = await handleDocumentPreview(id);
      const { success, document } = data;

      if (success) {
        // enabling the sidebar that shows the document content in it and also updating the state var to store the document content
        setDocumentDialogue(true);
        setDocumentContent(document);
      }
    } finally {
      setPreviewLoadingId(null);
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
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex min-h-72 flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed border-border/80 glass-panel px-4 py-14 text-center"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px shimmer-border opacity-60" />
        <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-800/25 to-sky-900/15 text-cyan-400/80 ring-1 ring-cyan-800/35">
          <Inbox className="size-6" />
        </span>
        <div>
          <p className="text-lg font-medium tracking-tight">No documents yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Upload your first document to start building a searchable knowledge
            base for chat.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 glass-panel">
      {/* Horizontal scroll only when needed; uses shadcn ScrollArea (no native table scrollbar) */}
      <ScrollArea className="w-full">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="w-12 px-4 py-3.5">
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  onCheckedChange={() => toggleSelectAllPage()}
                  aria-label="Select all documents on this page"
                  className="cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                #
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="w-16 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout" initial={false}>
              {pageItems.map((document: DocumentType, index: number) => {
                const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                const isSelected = selectedIds.includes(document.id);
                const isRowDeleting = deletingId === document.id;
                const isPreviewLoading = previewLoadingId === document.id;

                return (
                  <motion.tr
                    key={document.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      "group cursor-pointer border-b border-border/50 transition-colors duration-200 last:border-b-0",
                      "hover:bg-cyan-950/40",
                      isSelected && "bg-cyan-900/20 hover:bg-cyan-900/25",
                    )}
                    onClick={() => documentPreview(document.id)}
                  >
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(document.id)}
                        aria-label={`Select ${document.title || "document"}`}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {rowNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                            "bg-gradient-to-br from-muted to-muted/40 text-foreground ring-1 ring-border/60",
                            "group-hover:from-cyan-900/40 group-hover:to-sky-950/30 group-hover:text-cyan-400/80 group-hover:ring-cyan-800/40",
                          )}
                        >
                          {isPreviewLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <FileText className="size-4" />
                          )}
                        </span>
                        <span className="truncate font-medium tracking-tight transition-colors group-hover:text-cyan-200/70">
                          {document.title || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                      {formatDate(document.created_at)}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground opacity-70 transition-all duration-200 hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
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
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </ScrollArea>

      <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/15 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
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
              <span className="font-medium text-cyan-400/80">
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
            className="gap-1 border-border/70 bg-background/30 transition-transform hover:scale-[1.02]"
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
            className="gap-1 border-border/70 bg-background/30 transition-transform hover:scale-[1.02]"
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
