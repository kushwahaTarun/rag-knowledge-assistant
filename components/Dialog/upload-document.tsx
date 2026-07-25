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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary"
        >
          <Upload className="size-5" />
        </motion.div>
        <div>
          <DialogTitle className="text-lg">Upload document</DialogTitle>
          <DialogDescription className="mt-1.5">
            Add text to your knowledge base. It will be chunked and embedded for
            search and chat.
          </DialogDescription>
        </div>
      </DialogHeader>

      <FieldGroup className="mt-6">
        <Field>
          <Label htmlFor="document-title" className="text-muted-foreground">
            Document title
          </Label>
          <Input
            id="document-title"
            name="title"
            placeholder="e.g. Product FAQ, Company handbook…"
            className="h-10"
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
              className="min-h-44 max-h-64 resize-none overflow-y-auto pe-10 md:min-h-52"
              name="document"
              id="document"
              disabled={isPending}
              required
            />
            <FileText className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground/50" />
          </div>
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-2">
        <DialogClose
          render={
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          }
        />
        <Button type="submit" disabled={isPending} className="gap-2 min-w-28">
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
