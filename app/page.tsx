import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadDocumentDialog from "@/components/Dialog/upload-document";

export default function KnowledgeBasePage() {
  return (
    <section className="h-screen w-full">
      <div className="border">
        <h1 className="text-4xl">Knowledge Base Page</h1>
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline">Open Dialog</Button>}
          />
          <DialogContent className="sm:max-w-3xl max-h-[90%]">
            <UploadDocumentDialog />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
