import type { ComponentProps } from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = Primitive.Root;
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Primitive.Content
        aria-describedby={undefined}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border border-border bg-surface p-5 text-fg shadow-xl",
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-lg hover:bg-elevated"
          aria-label="Close"
        >
          <X className="size-5" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function DialogHeader(props: ComponentProps<"div">) {
  return <div {...props} className={cn("space-y-2 pr-8", props.className)} />;
}
export function DialogTitle(props: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={cn("font-display text-xl font-semibold", props.className)}
    />
  );
}
