import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Send, X } from "lucide-react";
import {
  assistantActions,
  type AssistantLanguage,
  type ChatMessage,
} from "@/lib/athrecs/assistant";
import { assistantCopy } from "@/lib/athrecs/assistant-copy";
import { TRANSLATION_LANGUAGES } from "@/lib/athrecs/site-translation";
import { getAssistantHistory, sendAssistantMessage } from "@/lib/athrecs/assistant-api";

export default function AssistantChat({
  open,
  setOpen,
  language,
  setLanguage,
  pathname,
  whatsappUrl,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  language: AssistantLanguage;
  setLanguage: (language: AssistantLanguage) => void;
  pathname: string;
  whatsappUrl: string | null;
}) {
  const copy = assistantCopy[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<"unavailable" | "limited" | "busy" | null>(null);
  const pending = useRef<{ text: string; id: string } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await getAssistantHistory();
      setMessages(result.messages);
      setError(result.error);
    } catch {
      setError("unavailable");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, sending, open]);
  async function send() {
    const text = draft.trim();
    if (!text || sending || loading) return;
    if (pending.current?.text !== text) pending.current = { text, id: crypto.randomUUID() };
    setSending(true);
    setError(null);
    try {
      const result = await sendAssistantMessage({
        data: {
          message: text,
          requestId: pending.current.id,
          language,
          page: pathname.slice(0, 300),
        },
      });
      if (result.error) setError(result.error);
      else {
        setMessages(result.messages);
        setDraft("");
        pending.current = null;
      }
    } catch {
      setError("unavailable");
    } finally {
      setSending(false);
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          lang={language}
          className="fixed bottom-2 right-2 z-[71] flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface text-fg shadow-2xl sm:bottom-5 sm:right-5"
        >
          <div className="flex items-start justify-between gap-3 bg-slate-950 p-4 text-white">
            <div>
              <Dialog.Title className="text-lg font-semibold">{copy.title}</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-300">
                {copy.subtitle}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={copy.close}
              className="rounded-lg p-2 hover:bg-white/15 focus-visible:outline-2"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
            <label htmlFor="assistant-language" className="text-xs text-muted">
              {copy.language}
            </label>
            <select
              id="assistant-language"
              value={language}
              disabled={sending}
              onChange={(e) => setLanguage(e.target.value as AssistantLanguage)}
              className="max-w-40 rounded-md border border-border bg-bg p-1 text-sm"
            >
              {TRANSLATION_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.label}
                </option>
              ))}
            </select>
          </div>
          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
            style={{ minHeight: "12rem", maxHeight: "48dvh" }}
          >
            <p className="rounded-xl bg-elevated p-3 text-sm leading-relaxed">{copy.welcome}</p>
            <div className="grid grid-cols-2 gap-2">
              {assistantActions.map((action) => (
                <a
                  key={action.key}
                  href={action.href}
                  className="rounded-lg border border-accent/30 px-3 py-2 text-xs font-medium text-accent no-underline hover:bg-accent-soft"
                >
                  {copy[action.key]}
                </a>
              ))}
            </div>
            <div role="log" aria-live="polite" aria-busy={sending || loading} className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted">{copy.loading}</p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    dir="auto"
                    className={`max-w-[95%] whitespace-pre-wrap break-words rounded-xl p-3 text-sm leading-relaxed ${message.role === "user" ? "ml-auto bg-slate-900 text-white" : "mr-auto bg-elevated"}`}
                  >
                    {message.content}
                  </div>
                ))
              )}
              {sending ? (
                <>
                  <div
                    dir="auto"
                    className="ml-auto max-w-[95%] whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-3 text-sm text-white"
                  >
                    {draft}
                  </div>
                  <p className="flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {copy.thinking}
                  </p>
                </>
              ) : null}
            </div>
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
              >
                <p>{copy[error]}</p>
                {!draft ? (
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-2 font-semibold underline"
                  >
                    {copy.retry}
                  </button>
                ) : null}
              </div>
            ) : null}
            <div ref={bottom} />
          </div>
          <div className="border-t border-border p-3">
            <p className="mb-2 text-[11px] leading-relaxed text-muted">
              {copy.notice}{" "}
              <a href="/privacy#assistant-chat" className="underline">
                {copy.privacy}
              </a>
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                aria-label={copy.placeholder}
                placeholder={copy.placeholder}
                value={draft}
                maxLength={1000}
                rows={2}
                disabled={sending || loading}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 resize-none rounded-lg border border-border bg-bg p-2 text-base focus:outline-accent"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />
              <button
                type="submit"
                aria-label={copy.send}
                disabled={!draft.trim() || sending || loading}
                className="rounded-lg bg-slate-950 p-3 text-white disabled:opacity-40"
              >
                <Send className="size-5" />
              </button>
            </form>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
              <a href="mailto:paul@athrecs.com" className="underline">
                {copy.contact}
              </a>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {copy.whatsapp}
                </a>
              ) : null}
              <span>{copy.saved}</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
