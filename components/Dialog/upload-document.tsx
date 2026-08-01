"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
import { cn } from "@/lib/utils";

type SourceMode = "paste" | "file";

const MAX_TXT_BYTES = 2 * 1024 * 1024; // 2 MB

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPlainTextFile(file: File) {
  const name = file.name.toLowerCase();
  return file.type === "text/plain" || name.endsWith(".txt");
}

function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, "").trim();
}

export default function UploadDocumentDialog() {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialState = {
    error: "",
    document_id: "",
  };

  const [state, formAction, isPending] = useActionState(
    uploadDocument,
    initialState,
  );

  // Which input path the user is using
  const [mode, setMode] = useState<SourceMode>("paste");
  const [title, setTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  // Track if title was auto-filled from a file so we can replace it when file changes
  const [titleFromFile, setTitleFromFile] = useState(false);

  useEffect(() => {
    if (state.error && !state.document_id) {
      toast.error(
        typeof state.error === "string" ? state.error : "Something went wrong",
        { position: "top-center" },
      );
    }

    if (!state.error && state.document_id) {
      toast.success("Document uploaded successfully", {
        position: "top-center",
      });
      // Reset local form state after success
      setPastedText("");
      setSelectedFile(null);
      setFileError("");
      setTitle("");
      setTitleFromFile(false);
      setMode("paste");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [state.error, state.document_id]);

  // Keep the native <input type="file"> in sync so form submit includes the File
  // (needed for drag-and-drop, which does not update the input by itself)
  const syncFileInput = (file: File | null) => {
    if (!fileInputRef.current) return;
    if (!file) {
      fileInputRef.current.value = "";
      return;
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInputRef.current.files = dataTransfer.files;
  };

  const acceptFile = (file: File | null | undefined) => {
    if (!file) return;

    if (!isPlainTextFile(file)) {
      setSelectedFile(null);
      setFileError("Only .txt files are supported right now");
      syncFileInput(null);
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setFileError("This file is empty");
      syncFileInput(null);
      return;
    }

    if (file.size > MAX_TXT_BYTES) {
      setSelectedFile(null);
      setFileError("File is too large (max 2 MB)");
      syncFileInput(null);
      return;
    }

    setFileError("");
    setSelectedFile(file);
    syncFileInput(file);

    // Auto-fill title from filename when empty or previously auto-filled
    if (!title.trim() || titleFromFile) {
      setTitle(titleFromFileName(file.name));
      setTitleFromFile(true);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileError("");
    syncFileInput(null);
  };

  const switchMode = (next: SourceMode) => {
    if (next === mode) return;
    setMode(next);
    setFileError("");
    // Clear the other source so only one path is submitted
    if (next === "paste") {
      clearFile();
    } else {
      setPastedText("");
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isPending) return;
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const canSubmit =
    title.trim().length > 0 &&
    (mode === "paste"
      ? pastedText.trim().length > 0
      : Boolean(selectedFile) && !fileError);

  return (
    <form action={formAction}>
      <DialogHeader className="space-y-2.5">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40 shadow-lg shadow-black/15"
        >
          <Upload className="size-5" />
        </motion.div>
        <div>
          <DialogTitle className="text-xl tracking-tight">
            Upload document
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-relaxed">
            Paste text or upload a .txt file. Content is chunked and embedded
            for search and chat.
          </DialogDescription>
        </div>
      </DialogHeader>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <FieldGroup className="mt-5">
          {/* Shared title for both modes */}
          <Field>
            <Label htmlFor="document-title" className="text-muted-foreground">
              Document title
            </Label>
            <Input
              id="document-title"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleFromFile(false);
              }}
              placeholder="e.g. Product FAQ, Company handbook…"
              className="h-11 border-border/70 bg-background/40 transition-all focus-visible:border-cyan-700/35"
              disabled={isPending}
              required
            />
          </Field>

          {/* Source mode switcher */}
          <Field>
            <Label className="text-muted-foreground">Source</Label>
            <div
              role="tablist"
              aria-label="Document source"
              className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-background/30 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "paste"}
                disabled={isPending}
                onClick={() => switchMode("paste")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  mode === "paste"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Type className="size-3.5" />
                Paste text
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "file"}
                disabled={isPending}
                onClick={() => switchMode("file")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  mode === "file"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Upload className="size-3.5" />
                Upload file
              </button>
            </div>
          </Field>

          {/* Mode-specific content */}
          <AnimatePresence mode="wait" initial={false}>
            {mode === "paste" ? (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Field>
                  <Label
                    htmlFor="document"
                    className="text-muted-foreground"
                  >
                    Document text
                  </Label>
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your document content here…"
                      className="min-h-44 max-h-64 resize-none overflow-y-auto border-border/70 bg-background/40 pe-10 transition-all focus-visible:border-cyan-700/35 md:min-h-52"
                      name="document"
                      id="document"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      disabled={isPending}
                      required={mode === "paste"}
                    />
                    <FileText className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground/50" />
                  </div>
                </Field>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <Field>
                  <Label className="text-muted-foreground">Text file</Label>

                  {/* Hidden real file input — dropzone triggers it */}
                  <input
                    ref={fileInputRef}
                    id={fileInputId}
                    type="file"
                    name="file"
                    accept=".txt,text/plain"
                    className="sr-only"
                    disabled={isPending}
                    onChange={onFileInputChange}
                  />

                  {/*
                    Empty: show dropzone.
                    File selected: replace dropzone with compact file card
                    (avoids stacking dropzone + chip → no scrollbar for 1 file).
                  */}
                  <AnimatePresence mode="wait" initial={false}>
                    {selectedFile ? (
                      <motion.div
                        key="selected-file"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-3"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/60 text-cyan-400/80 ring-1 ring-border/60">
                          <FileText className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                            <span className="inline-flex items-center gap-1 text-emerald-400/90">
                              <CheckCircle2 className="size-3" />
                              Ready
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => {
                              if (!isPending) fileInputRef.current?.click();
                            }}
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            onClick={clearFile}
                            aria-label="Remove file"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        onClick={() => {
                          if (!isPending) fileInputRef.current?.click();
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                        }}
                        onDrop={onDrop}
                        className={cn(
                          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed px-4 py-6 text-center transition-all",
                          isDragging
                            ? "border-cyan-600/50 bg-cyan-950/30"
                            : "border-border/80 bg-background/30 hover:border-cyan-700/40 hover:bg-muted/20",
                          isPending && "pointer-events-none opacity-60",
                        )}
                      >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-800/30 to-sky-900/20 text-cyan-400/80 ring-1 ring-cyan-800/40">
                          <Upload className="size-4.5" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            Drag & drop a .txt file here
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            or click to browse · Max 2 MB · PDF/DOCX coming soon
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Field>

                {fileError && (
                  <p className="text-xs text-destructive">{fileError}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
          disabled={isPending || !canSubmit}
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
