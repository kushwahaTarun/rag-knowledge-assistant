"use client";

import { ExternalLink, FileText } from "lucide-react";
import { motion } from "framer-motion";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type DocumentPreviewContent = {
  title?: string;
  content?: string;
  file_url?: string | null;
};

// interface for the component props
interface propsType {
  documentContent: DocumentPreviewContent;
  setDocumentContent: (state: DocumentPreviewContent) => void;
  documentDialogue: boolean;
  setDocumentDialogue: (state: boolean) => void;
}

function getFileKind(fileUrl: string | null | undefined) {
  if (!fileUrl) return "none" as const;

  const lower = fileUrl.toLowerCase();
  if (lower.includes(".pdf")) return "pdf" as const;
  if (lower.includes(".docx")) return "docx" as const;
  if (lower.includes(".txt") || lower.includes("text/plain")) return "txt" as const;
  return "other" as const;
}

export default function DocumentPreview({
  documentContent,
  setDocumentContent,
  documentDialogue,
  setDocumentDialogue,
}: propsType) {
  const isMobile = useIsMobile();
  const fileUrl = documentContent.file_url ?? null;
  const kind = getFileKind(fileUrl);
  const isPdf = kind === "pdf";
  const isDocx = kind === "docx";
  const showTextBody = !isPdf;

  // triggers when user click on the submit button
  const handleClose = () => {
    setDocumentDialogue(false);
    setDocumentContent({});
  };

  return (
    <Drawer
      open={documentDialogue}
      onOpenChange={setDocumentDialogue}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent
        className={
          isMobile
            ? "w-full max-w-none border-border/60 bg-card/95 backdrop-blur-xl"
            : "min-w-[min(70%,40rem)] max-w-[min(92vw,48rem)] border-border/60 bg-card/95 backdrop-blur-xl"
        }
      >
        <DrawerHeader className="border-b border-border/50 pb-4 text-left">
          <div className="flex items-start gap-3">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40"
            >
              <FileText className="size-4.5" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <DrawerTitle className="truncate text-base tracking-tight sm:text-lg">
                {documentContent.title || "Document preview"}
              </DrawerTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPdf
                  ? "Original PDF from storage"
                  : isDocx
                    ? "Extracted text preview — download for the original file"
                    : "Full document content from your knowledge base"}
              </p>
            </div>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="space-y-3 rounded-xl border border-border/50 bg-background/40 p-3 sm:p-5">
            {/* DOCX: browser cannot render natively — offer download + show extracted text */}
            {isDocx && fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                Download original file
              </a>
            ) : null}

            {/* PDF: iframe against public file_url */}
            {isPdf && fileUrl ? (
              <>
                <iframe
                  title={documentContent.title || "PDF preview"}
                  src={fileUrl}
                  className="h-[min(70vh,32rem)] w-full rounded-lg border border-border/50 bg-background"
                />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 underline-offset-4 hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" />
                  Open PDF in new tab
                </a>
              </>
            ) : null}

            {/* Paste / .txt / .docx / other: show extracted or pasted content */}
            {showTextBody ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90 sm:text-base sm:leading-7">
                {documentContent.content ?? "No document content available"}
              </p>
            ) : null}
          </div>
        </div>

        <DrawerFooter className="gap-2 border-t border-border/50 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <DrawerClose
            className="cursor-pointer sm:order-1"
            render={
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            }
          />
          <Button
            onClick={handleClose}
            className="h-10 w-full cursor-pointer bg-gradient-to-br from-cyan-700 to-sky-800 text-white shadow-lg shadow-black/20 sm:order-2 sm:h-9 sm:w-auto"
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
