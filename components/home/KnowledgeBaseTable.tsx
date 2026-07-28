"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentType, KnowledgeBaseDocType } from "@/interfaces/knowledge-base";

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
}: KnowledgeBaseDocType) {
  const [page, setPage] = useState(1);

  const total = documents.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return documents.slice(start, start + PAGE_SIZE);
  }, [documents, currentPage]);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

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
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 font-medium text-muted-foreground">
                #
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((document: DocumentType, index: number) => {
              const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
              return (
                <tr
                  key={document.id}
                  className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/30"
                >
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
            of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
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
    </div>
  );
}
