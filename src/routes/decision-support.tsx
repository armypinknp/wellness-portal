import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Flag, HeartHandshake, Scale, ArrowLeft } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/decision-support")({
  head: () => ({
    meta: [
      { title: "Decision Support — Wellness Portal" },
      { name: "description", content: "Guided flows that walk with you, one question at a time." },
      { property: "og:title", content: "Decision Support — Wellness Portal" },
      {
        property: "og:description",
        content: "Guided flows, one question at a time. No wrong answers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Decision,
});

const steps = [
  {
    q: "Right now, what feels heaviest?",
    a: ["Too many choices", "Feeling unsafe", "Feeling exhausted", "I'm not sure"],
  },
  {
    q: "What would help most in the next hour?",
    a: ["Calming down", "One small next step", "Talking to someone"],
  },
  {
    q: "Pick one tiny thing you can do now.",
    a: ["Drink some water", "Take 5 slow breaths", "Step outside for a minute"],
  },
];

const flows = [
  { t: "Decision Reset", sub: "When everything feels overwhelming", icon: Compass, active: true },
  { t: "Stay or Leave", sub: "Weighing what feels right for you", icon: Scale, active: false },
  {
    t: "Red Flag/ Green Flag",
    sub: "Something feels off and I'm not sure why",
    icon: Flag,
    active: false,
  },
  { t: "Can I trust this person?", sub: "Trust flow", icon: HeartHandshake, active: false },
];

function Decision() {
  const tx = useTx();
  const [answers, setAnswers] = useState<string[]>([]);
  const [step, setStep] = useState<number | null>(null);
  if (step !== null) {
    const done = step >= steps.length;
    const s = steps[step];
    return (
      <PageShell
        accent="teal"
        title="The Decision Reset"
        tags={<StatusTag status="placeholder" note="flow copy TBC" />}
      >
        <button
          onClick={() => setStep(null)}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {tx("Back")}
        </button>
        <div className="max-w-xl rounded-3xl border bg-card p-6 shadow-sm">
          {done ? (
            <>
              <h2 className="text-2xl font-bold">{tx("You did something kind for yourself.")}</h2>
              <p className="mt-2 text-muted-foreground">
                {tx("Your answers are not saved automatically. Come back anytime.")}
              </p>
              <SaveActions
                item={{
                  room: "Decision Support",
                  activity: "Decision Reset",
                  source: "/decision-support",
                  text: steps.map((s, i) => `${s.q}\n${answers[i] ?? ""}`).join("\n\n"),
                }}
              />
              <button
                onClick={() => setStep(null)}
                className="mt-5 min-h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
              >
                {tx("Finish")}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-muted-foreground">
                {step + 1} / {steps.length}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{tx(s?.q ?? "")}</h2>
              <div className="mt-5 grid gap-3">
                {s?.a.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAnswers((old) => [...old.slice(0, step), a]);
                      setStep(step + 1);
                    }}
                    className="min-h-14 rounded-2xl border px-5 text-left font-semibold hover:border-primary hover:bg-secondary"
                  >
                    {tx(a)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </PageShell>
    );
  }
  return (
    <PageShell
      center
      accent="teal"
      title="Decision Support"
      back={{ to: "/", label: "Back" }}
      intro="Choose what support you need and be guided to make decisions that align with your situation."
    >
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-6">
        {flows.map((f) => (
          <button
            key={f.t}
            disabled={!f.active}
            onClick={() => {
              setAnswers([]);
              setStep(0);
            }}
            className="group flex min-h-28 items-center gap-5 rounded-2xl bg-card/50 p-6 text-left shadow-lg ring-1 ring-border backdrop-blur transition enabled:hover:-translate-y-1 enabled:hover:ring-teal disabled:cursor-not-allowed sm:min-h-36 sm:p-8"
          >
            <span
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-teal text-tile-foreground shadow-lg transition group-enabled:group-hover:scale-105 sm:h-24 sm:w-24 ${f.active ? "" : "opacity-60"}`}
            >
              <f.icon className="h-7 w-7 sm:h-9 sm:w-9" />
            </span>
            <span className="min-w-0">
              <span
                className={`block text-lg font-semibold sm:text-2xl ${f.active ? "" : "text-muted-foreground"}`}
              >
                {tx(f.t)}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {f.active ? tx(f.sub) : tx("Coming soon")}
              </span>
            </span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
