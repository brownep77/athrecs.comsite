import { cn } from "@/lib/utils";

export function FilterChips({
  label,
  options,
  value,
  onChange,
  wrap = false,
  optionClassName,
  optionLabel = (option) => option,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  wrap?: boolean;
  optionClassName?: (option: string) => string;
  optionLabel?: (option: string) => string;
}) {
  return (
    <fieldset className="min-w-0 max-w-full space-y-1.5">
      <legend className="text-[11px] font-medium uppercase tracking-wider text-subtle">
        {label}
      </legend>
      <div
        className={
          wrap
            ? "flex max-w-full flex-wrap gap-2"
            : "flex max-w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
                optionClassName
                  ? optionClassName(option)
                  : active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg",
                optionClassName &&
                  (active
                    ? "ring-2 ring-fg ring-offset-2 ring-offset-surface font-bold"
                    : "hover:brightness-95"),
              )}
            >
              {optionLabel(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
