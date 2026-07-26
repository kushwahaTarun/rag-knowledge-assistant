import { ArrowUpIcon, LoaderIcon } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserQueryTextAreaAndOptions({
  isPending,
  className,
}: {
  isPending: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-start gap-2", className)}>
      <Textarea
        className="scrollbar-hide min-h-28 max-h-36 flex-1 overflow-y-auto"
        placeholder="How can i help you today?"
        name="user-query"
      />
      <Button
        className="mt-1 shrink-0 cursor-pointer"
        variant="outline"
        size="icon"
        name="user-query-submit"
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <LoaderIcon
            role="status"
            aria-label="Loading"
            className={cn("size-4 animate-spin")}
          />
        ) : (
          <ArrowUpIcon />
        )}
      </Button>
    </div>
  );
}
