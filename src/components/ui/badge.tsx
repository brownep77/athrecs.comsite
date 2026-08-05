import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default:
    "border-border-strong bg-elevated text-fg",
  outline: "border-border bg-transparent text-muted",
  accent: "border-transparent bg-accent-soft text-accent",
  solid: "border-transparent bg-primary text-primary-fg",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
