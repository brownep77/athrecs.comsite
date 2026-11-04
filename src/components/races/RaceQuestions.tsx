import { raceQuestions } from "@/lib/athrecs/race-questions";

export function RaceQuestions({ data }: { data: Parameters<typeof raceQuestions>[0] }) {
  return (
    <section
      aria-labelledby="race-questions-heading"
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
    >
      <h2 id="race-questions-heading" className="font-display text-xl font-semibold">
        Race questions
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        {raceQuestions(data).map((item) => (
          <div key={item.question} className="space-y-2">
            <h3 className="font-semibold text-fg">{item.question}</h3>
            <p className="text-sm leading-relaxed text-muted">{item.answer}</p>
            {item.link ? (
              <a href={item.link.href} className="text-sm font-semibold text-accent underline">
                {item.link.label}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
