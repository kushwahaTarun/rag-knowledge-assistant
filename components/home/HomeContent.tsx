"use client";

import { Upload } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadDocumentDialog from "@/components/Dialog/upload-document";

export function HomeContent() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-8"
      >
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

        {/* Documents table will go here once the list endpoint is ready */}
        <div className="flex min-h-64 flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Document table will appear here.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
