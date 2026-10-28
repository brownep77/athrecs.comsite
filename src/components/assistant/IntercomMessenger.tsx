import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import {
  bootIntercom,
  INTERCOM_ENABLED,
  openIntercomMessage,
  updateIntercomPage,
} from "@/lib/athrecs/intercom";

/** Boots the Intercom Messenger and keeps it informed of client-side page changes. */
export function IntercomMessenger({ pathname }: { pathname: string }) {
  useEffect(() => {
    bootIntercom();
  }, []);
  useEffect(() => {
    updateIntercomPage();
  }, [pathname]);
  return null;
}

const PROMPTS = {
  results: {
    label: "Can’t find your results? Ask Paul to research them.",
    prefill: "I can’t find my results. Can you help me find my missing results?",
  },
  race: {
    label: "Know a race we’re missing? Tell us about it.",
    prefill: "I’d like to add a race or race results that are missing from AthRecs.",
  },
} as const;

/** Contextual entry point into the Messenger. Renders nothing unless Intercom is enabled. */
export function ChatPrompt({
  kind,
  className = "",
}: {
  kind: keyof typeof PROMPTS;
  className?: string;
}) {
  if (!INTERCOM_ENABLED) return null;
  const prompt = PROMPTS[kind];
  return (
    <button
      type="button"
      onClick={() => openIntercomMessage(prompt.prefill)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-left text-sm font-semibold text-accent shadow-card hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
      {prompt.label}
    </button>
  );
}
