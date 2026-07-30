"use client";

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
      <DrawerContent className="min-w-[70%]">
        <DrawerHeader>
          <DrawerTitle>{document.title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 scroll-fade overflow-y-auto p-4 leading-7 text-base">
          {documentContent.content ?? "No document content available"}
        </div>
        <DrawerFooter>
          <Button onClick={handleClose} className="h-[34px] cursor-pointer">
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
