"use client";

import { FileText } from "lucide-react";
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

// interface for the component props
interface propsType {
  documentContent: {
    title?: string;
    content?: string;
  };
  setDocumentContent: (state: { title?: string; content?: string }) => void;
  documentDialogue: boolean;
  setDocumentDialogue: (state: boolean) => void;
}

export default function DocumentPreview({
  documentContent,
  setDocumentContent,
  documentDialogue,
  setDocumentDialogue,
}: propsType) {
  const isMobile = useIsMobile();

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
      <DrawerContent className="min-w-[70%] border-border/60 bg-card/95 backdrop-blur-xl">
        <DrawerHeader className="border-b border-border/50 pb-4">
          <div className="flex items-start gap-3">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40"
            >
              <FileText className="size-4.5" />
            </motion.span>
            <div className="min-w-0">
              <DrawerTitle className="text-lg tracking-tight">
                {documentContent.title || "Document preview"}
              </DrawerTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Full document content from your knowledge base
              </p>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="rounded-xl border border-border/50 bg-background/40 p-4 sm:p-5">
            <p className="whitespace-pre-wrap text-base leading-7 text-foreground/90">
              {documentContent.content ?? "No document content available"}
            </p>
          </div>
        </div>

        <DrawerFooter className="border-t border-border/50">
          <Button
            onClick={handleClose}
            className="h-9 cursor-pointer bg-gradient-to-br from-cyan-700 to-sky-800 text-white shadow-lg shadow-black/20"
          >
            Close
          </Button>
          <DrawerClose
            className="cursor-pointer"
            render={<Button variant="outline">Cancel</Button>}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
