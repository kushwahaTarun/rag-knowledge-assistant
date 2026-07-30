"use client";

import { useEffect, useActionState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadDocument } from "@/lib/action";

export default function UploadDocumentDialog() {
  const initialState = {
    error: "",
    document_id: "",
  };

  const [state, formAction, isPending] = useActionState(
    uploadDocument,
    initialState,
  );

  useEffect(() => {
    if (state.error && !state.document_id) {
      toast.error(
        typeof state.error === "string" ? state.error : "Something went wrong",
        { position: "top-center" },
      );
    }

    if (!state.error && state.document_id) {
      toast.success(
        typeof state.document_id === "string"
          ? state.document_id
          : "Uploaded successfully",
        { position: "top-center" },
      );
    }
  }, [state.error, state.document_id]);

  return (
    <form action={formAction}>
      <DialogHeader className="space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40 shadow-lg shadow-black/15"
        >
          <Upload className="size-5" />
        </motion.div>
        <div>
          <DialogTitle className="text-xl tracking-tight">
            Upload document
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm leading-relaxed">
            Add text to your knowledge base. It will be chunked and embedded for
            search and chat.
          </DialogDescription>
        </div>
      </DialogHeader>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <FieldGroup className="mt-6">
          <Field>
            <Label htmlFor="document-title" className="text-muted-foreground">
              Document title
            </Label>
            <Input
              id="document-title"
              name="title"
              placeholder="e.g. Product FAQ, Company handbook…"
              className="h-11 border-border/70 bg-background/40 transition-all focus-visible:border-cyan-700/35"
              disabled={isPending}
              required
            />
          </Field>
          <Field>
            <Label htmlFor="document" className="text-muted-foreground">
              Document text
            </Label>
            <div className="relative">
              <Textarea
                placeholder="Paste your document content here…"
                className="min-h-44 max-h-64 resize-none overflow-y-auto border-border/70 bg-background/40 pe-10 transition-all focus-visible:border-cyan-700/35 md:min-h-52"
                name="document"
                id="document"
                disabled={isPending}
                required
              />
              <FileText className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground/50" />
            </div>
          </Field>
        </FieldGroup>
      </motion.div>

      <DialogFooter className="mt-2">
        <DialogClose
          render={
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          }
        />
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-28 gap-2 bg-gradient-to-br from-cyan-700 to-sky-800 text-white shadow-lg shadow-black/25 transition-transform hover:scale-[1.02] hover:from-cyan-600 hover:to-sky-700"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Upload
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
