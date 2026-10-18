import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SimulatedBadge, SimulatedPin } from "@/components/portal/Simulated";
import { useTx } from "@/lib/prefs";
import { SaveActions } from "@/components/portal/SaveActions";

export const Route = createFileRoute("/journals")({
  head: () => ({
    meta: [
      { title: "Healing Journals — Wellness Portal" },
      { name: "description", content: "Five gentle journals behind a PIN (simulated in this prototype), each in six small steps." },
      { property: "og:title", content: "Healing Journals — Wellness Portal" },
      { property: "og:description", content: "A private place to write, at your own pace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Journals,
});

// Placeholder journal structure — step names and prompts need approval.
// Display order matches the design: featured journal sits in the middle.
const journals = [
  { t: "Identity Rebuilding", sub: "Exploring life after", dot: "bg-sun", size: "sm" },
  { t: "Release", sub: "Processing thoughts & emotions", dot: "bg-lavender", size: "md" },
  { t: "Emotional Check-In", sub: "Daily emotional awareness", dot: "bg-primary", size: "lg" },
  { t: "Trigger Reflection", sub: "Understanding emotional triggers", dot: "bg-teal", size: "md" },
  { t: "Strength Recall", sub: "Recognizing your growth & resilience", dot: "bg-coral", size: "sm" },
] as const;
const sizes = {
  sm: { card: "sm:h-60 sm:w-36", dot: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" },
  md: { card: "sm:h-64 sm:w-40", dot: "h-16 w-16 sm:h-20 sm:w-20" },
  lg: { card: "sm:h-80 sm:w-56", dot: "h-20 w-20 sm:h-28 sm:w-28" },
};
const steps = [
  { n: "Opening", q: "How are you arriving today?", h: "No need to explain or fix anything — just notice where you are right now." },
  { n: "Noticing", q: "What are you noticing in your body?", h: "A word or two is enough." },
  { n: "Naming", q: "If this feeling had a name, what would it be?", h: "There's no wrong answer." },
  { n: "Needs", q: "What do you need more of right now?", h: "Rest, space, company — anything." },
  { n: "Kindness", q: "What would you say to a friend feeling this way?", h: "Try saying it to yourself." },
  { n: "Closing", q: "One small thing you can do for yourself today.", h: "Keep it tiny and doable." },
];

function Journals() {
  const tx = useTx();
  const [open, setOpen] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState<string[]>(Array(steps.length).fill(""));
  const exit = () => { setOpen(null); setStep(0); setText(Array(steps.length).fill("")); };

  if (open) {
    const s = steps[step];
    if (!s) return null;
    return (
      <main className="relative mx-auto max-w-2xl px-4 pt-8">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-96 bg-gradient-to-b from-primary/30 to-transparent blur-2xl" />
        <button onClick={exit} className="inline-flex min-h-11 items-center gap-2 text-lg font-bold text-primary"><ArrowLeft className="h-5 w-5" /> {tx("Exit journal")}</button>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl">{tx(open)}</h1>
        <div className="mt-2 flex flex-wrap gap-2"><SimulatedBadge what="PIN & encryption" /><StatusTag status="placeholder" note="prompts" /></div>
        <p className="mt-5 text-sm font-bold text-primary">{tx("Step")} {step + 1}. {tx(s.n)}</p>
        <div className="mt-2 grid grid-cols-6 gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((_, i) => <span key={i} className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}
        </div>
        <div className="mt-6 rounded-3xl border bg-card/70 p-5 shadow-lg backdrop-blur">
          <label htmlFor="entry" className="block text-lg font-bold">{tx(s.q)}</label>
          <p className="mt-2 text-sm text-muted-foreground">{tx(s.h)}</p>
          <textarea id="entry" rows={5} value={text[step]} placeholder={tx("Write freely. This is just for you.")}
            onChange={(e) => setText(text.map((v, i) => (i === step ? e.target.value : v)))}
            className="mt-4 w-full rounded-2xl border bg-background p-4 text-base focus:border-primary focus:outline-none" />
          <div className="mt-4 flex justify-between">
            <button aria-label={tx("Back")} disabled={step === 0} onClick={() => setStep(step - 1)} className="grid h-12 w-20 place-items-center rounded-full bg-tile-foreground text-primary shadow-lg disabled:opacity-40"><ArrowLeft className="h-5 w-5" /></button>
            <button aria-label={tx("Next")} onClick={() => (step === steps.length - 1 ? exit() : setStep(step + 1))} className="grid h-12 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"><ArrowRight className="h-5 w-5" /></button>
          </div>
        </div>
        <SaveActions item={{ room: "Healing Journals", activity: open, source: "/journals", text: steps.map((s, i) => `${s.q}\n${text[i] ?? ""}`).join("\n\n") }} />
      </main>
    );
  }

  return (
    <PageShell center title="Healing Journals" back={{ to: "/", label: "Back" }}
      intro="Five gentle journals. Each moves through six small steps — write as much or as little as you like."
      tags={<><SimulatedBadge what="PIN & encryption" /></>}>
      <SimulatedPin label="Create a PIN for your journals">
        <div className="-mx-4 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-4 py-6 sm:mx-0 sm:justify-center sm:overflow-visible sm:px-0">
          {journals.map((j) => (
            <button key={j.t} onClick={() => { setOpen(j.t); setStep(0); }} title={tx(j.sub)}
              className={`group flex h-56 w-40 shrink-0 snap-center flex-col items-center justify-center gap-4 rounded-2xl border-2 border-primary/70 bg-card/60 p-4 text-center shadow-xl backdrop-blur transition hover:-translate-y-2 hover:border-primary focus-visible:-translate-y-2 ${sizes[j.size].card} ${j.size === "lg" ? "border-primary bg-card/80" : ""}`}>
              <span className={`rounded-full ${j.dot} ${sizes[j.size].dot} shadow-lg transition group-hover:scale-110`} />
              <span className={`font-semibold leading-tight ${j.size === "lg" ? "text-lg" : "text-sm"}`}>{tx(j.t)}</span>
              <span className="text-xs text-muted-foreground">{tx(j.sub)}</span>
            </button>
          ))}
        </div>
      </SimulatedPin>
    </PageShell>
  );
}
