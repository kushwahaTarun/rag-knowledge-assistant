"use client";

import { useEffect, useActionState } from "react";
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
  // initial state of the form
  const initialState = {
    error: "",
    document_id: "",
  };

  const [state, formAction] = useActionState(
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
          : "Uploaded Successfully",
        { position: "top-center" },
      );
    }
  }, [state.error, state.document_id]);

  return (
    <form action={formAction}>
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Upload your document to the Knowledge Base
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="mt-4">
        <Field>
          <Label htmlFor="document-title">Document Title</Label>
          <Input id="document-title" name="title" />
        </Field>
        <Field>
          <Label htmlFor="document">Document Text</Label>
          <Textarea
            placeholder="Type your message here."
            className="md:min-h-56 md:max-h-68 overflow-y-auto"
            name="document"
            id="document"
          />
        </Field>
        <Field></Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}
