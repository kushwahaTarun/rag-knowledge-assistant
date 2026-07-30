"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileStack,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { deleteDocuments } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UploadDocumentDialog from "@/components/Dialog/upload-document";
import KnowledgeBaseTable from "@/components/home/KnowledgeBaseTable";
import { DocumentType } from "@/interfaces/knowledge-base";
import { Badge } from "@/components/ui/badge";

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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/60 glass-panel p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-cyan-900/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-sky-950/30 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border border-cyan-700/25 bg-cyan-900/20 px-2.5 py-1 text-[11px] font-medium text-cyan-400/80"
            >
              <Sparkles className="size-3" />
              Knowledge workspace
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-gradient">Knowledge Base</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Upload, organize, and manage documents that power your RAG
                assistant. Click any row to preview content.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                <FileStack className="size-3.5 text-cyan-400/80" />
                <span className="font-medium text-foreground">
                  {documents.length}
                </span>
                document{documents.length === 1 ? "" : "s"}
              </span>
              {selectedIds.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-700/30 bg-cyan-900/20 px-3 py-1 text-xs text-cyan-400/80">
                  {selectedIds.length} selected
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <AnimatePresence mode="popLayout">
              {selectedIds.length > 0 && (
                <motion.div
                  key="bulk-delete"
                  initial={{ opacity: 0, scale: 0.9, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 8 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                >
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2 shadow-lg shadow-red-500/10"
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
                </motion.div>
              )}
            </AnimatePresence>

            <Dialog>
              <DialogTrigger
                render={
                  <Button className="gap-2 shrink-0 glow-primary transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                    <Upload className="size-4" />
                    Upload document
                  </Button>
                }
              />
              <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-xl sm:max-w-2xl">
                <UploadDocumentDialog />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <KnowledgeBaseTable
          documents={documents}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </motion.div>
    </div>
  );
}
