import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaffAssistantChats,
  getStaffAssistantTranscript,
  deleteStaffAssistantTranscript,
} from "@/lib/athrecs/assistant-api";

export const Route = createFileRoute("/admin/assistant-chats")({
  head: () => ({
    meta: [
      { title: "Chat transcripts — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AssistantChats,
});

function AssistantChats() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const chats = useQuery({
    queryKey: ["staff-assistant-chats", page],
    queryFn: () => getStaffAssistantChats({ data: { page } }),
    refetchInterval: 30000,
  });
  const transcript = useQuery({
    queryKey: ["staff-assistant-transcript", selected],
    queryFn: () => getStaffAssistantTranscript({ data: { id: selected! } }),
    enabled: !!selected,
    refetchInterval: 30000,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteStaffAssistantTranscript({ data: { id } }),
    onSuccess: async () => {
      setSelected(null);
      queryClient.removeQueries({ queryKey: ["staff-assistant-transcript"] });
      await queryClient.invalidateQueries({ queryKey: ["staff-assistant-chats"] });
    },
  });
  const button = "rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40";
  function download() {
    if (!transcript.data) return;
    const { chat, messages } = transcript.data;
    const text = [
      `ATHRECS chat ${chat.id}`,
      `Started: ${chat.created_at}`,
      `Starting page: ${chat.page_path}`,
      `Latest selected language: ${chat.language}`,
      "",
      ...messages.map(
        (message) =>
          `[${message.created_at}] ${message.role} (${message.language}; ${message.status})\n${message.content}\n`,
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `athrecs-chat-${chat.id}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Chat transcripts</h1>
        <p className="mt-2 text-sm text-muted">
          Private website conversations from the last 90 days. Visitors remain anonymous unless they
          identify themselves. This view refreshes every 30 seconds.
        </p>
      </div>
      {chats.data && !chats.data.enabled ? (
        <p
          role="status"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
        >
          The AI assistant is not enabled. Configure the server’s OpenAI key, a persistent database
          and ATHRECS_ASSISTANT_ENABLED=true, then redeploy. No chat launcher is shown to visitors
          until these are set.
        </p>
      ) : null}
      {chats.isError || transcript.isError || remove.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Unable to load or update chat history. Check your staff access and try refreshing.
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-2">
          {chats.isPending ? <p>Loading chats…</p> : null}
          {chats.data?.chats.length === 0 ? (
            <p className="rounded-xl border border-border p-5 text-sm">No chats on this page.</p>
          ) : null}
          {chats.data?.chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => setSelected(chat.id)}
              aria-pressed={selected === chat.id}
              className={`w-full rounded-xl border p-3 text-left ${selected === chat.id ? "border-accent bg-accent-soft" : "border-border bg-surface"}`}
            >
              <p className="truncate text-sm font-semibold">{chat.preview || "Conversation"}</p>
              <p className="mt-1 text-xs text-muted">
                {new Date(chat.updated_at).toLocaleString()} · {chat.language.toUpperCase()} ·{" "}
                {chat.message_count} messages
              </p>
              <p className="mt-1 truncate text-xs text-muted">{chat.page_path}</p>
            </button>
          ))}
          <div className="flex items-center justify-between gap-2">
            <button className={button} disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="text-sm">Page {page + 1}</span>
            <button
              className={button}
              disabled={!chats.data?.hasMore}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
        <section className="min-w-0 rounded-xl border border-border bg-surface p-4">
          {!selected ? (
            <p className="text-sm text-muted">Select a chat to read the full conversation.</p>
          ) : transcript.isPending ? (
            <p>Loading transcript…</p>
          ) : transcript.data ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted">{transcript.data.chat.page_path}</p>
                <div className="flex gap-2">
                  <button className={button} onClick={download}>
                    Download transcript
                  </button>
                  <button
                    className={button}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (
                        window.confirm("Permanently delete this conversation and all its messages?")
                      )
                        remove.mutate(selected);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ol className="space-y-4">
                {transcript.data.messages.map((message, index) => (
                  <li key={index} className="rounded-lg bg-elevated p-3">
                    <p className="mb-2 text-xs text-muted">
                      {message.role === "user" ? "Visitor" : "AI assistant"} ·{" "}
                      {new Date(message.created_at).toLocaleString()} · {message.language}
                      {message.status === "unavailable" ? " · Service unavailable" : ""}
                    </p>
                    <p
                      dir="auto"
                      className="whitespace-pre-wrap break-words text-sm leading-relaxed"
                    >
                      {message.content}
                    </p>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
