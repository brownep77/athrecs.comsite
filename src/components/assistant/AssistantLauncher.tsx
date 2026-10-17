import { lazy, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { getAssistantStatus } from "@/lib/athrecs/assistant-api";
import { assistantLanguage, type AssistantLanguage } from "@/lib/athrecs/assistant";
import { assistantCopy } from "@/lib/athrecs/assistant-copy";

const AssistantChat = lazy(() => import("./AssistantChat"));

export function AssistantLauncher({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  useEffect(() => {
    const pathLanguage = assistantLanguage.safeParse(pathname.split("/")[1]);
    const browserLanguage = assistantLanguage.safeParse(navigator.language.split("-")[0]);
    setLanguage(
      pathLanguage.success
        ? pathLanguage.data
        : browserLanguage.success
          ? browserLanguage.data
          : "en",
    );
    // Choose the initial language once; preserve the visitor's explicit choice on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const status = useQuery({
    queryKey: ["assistant-status"],
    queryFn: () => getAssistantStatus(),
    staleTime: 300000,
    retry: false,
  });
  if (!status.data?.enabled) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpened(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/20 hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6 lg:right-6"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        {assistantCopy[language].title}
      </button>
      {opened ? (
        <Suspense fallback={null}>
          <AssistantChat
            open={open}
            setOpen={setOpen}
            language={language}
            setLanguage={setLanguage}
            pathname={pathname}
            whatsappUrl={status.data.whatsappUrl}
          />
        </Suspense>
      ) : null}
    </>
  );
}
