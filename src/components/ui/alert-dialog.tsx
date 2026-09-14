import type { ComponentProps } from "react";
import * as Primitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

export const AlertDialog = Primitive.Root;
export function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Primitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 text-fg shadow-xl",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
export function AlertDialogHeader(props: ComponentProps<"div">) {
  return <div {...props} className={cn("space-y-3", props.className)} />;
}
export function AlertDialogFooter(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("mt-6 flex flex-wrap justify-end gap-2", props.className)} />
  );
}
export function AlertDialogTitle(props: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={cn("font-display text-xl font-semibold", props.className)}
    />
  );
}
export function AlertDialogDescription(props: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      {...props}
      className={cn("text-sm leading-6 text-muted", props.className)}
    />
  );
}
export function AlertDialogCancel(props: ComponentProps<typeof Primitive.Cancel>) {
  return (
    <Primitive.Cancel
      {...props}
      className={cn(
        "min-h-11 rounded-lg border border-border bg-elevated px-4 text-sm font-semibold disabled:opacity-50",
        props.className,
      )}
    />
  );
}
export function AlertDialogAction(props: ComponentProps<typeof Primitive.Action>) {
  return (
    <Primitive.Action
      {...props}
      className={cn(
        "min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg disabled:opacity-50",
        props.className,
      )}
    />
  );
}
