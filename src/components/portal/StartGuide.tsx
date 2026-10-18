import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { StatusTag } from "./Shell";
import { useTx } from "@/lib/prefs";

// The choice lives only in component state — it is never saved or measured.
const choices: { label: string; areas: { to: string; title: string; why: string }[] }[] = [
  {
    label: "I need a moment to breathe",
    areas: [
      { to: "/calm-room", title: "Calm Room", why: "Breathing, grounding and calming media." },
      { to: "/recovery-rooms/crisis", title: "Crisis", why: "For the hardest moments." },
    ],
  },
  {
    label: "I'm looking for practical resources",
    areas: [
      { to: "/library", title: "Healing Library", why: "Guides you can read or download." },
      {
        to: "/recovery-rooms/safety",
        title: "Safety & Stability",
        why: "Building steadier ground.",
      },
      { to: "/partners", title: "Wellness Partners", why: "Support from partner organizations." },
    ],
  },
  {
    label: "I want to express myself",
    areas: [
      { to: "/art-room", title: "Art Room", why: "Why I Left → Where I'm Going." },
      { to: "/gallery", title: "Anonymous Art Gallery", why: "See art others have shared." },
    ],
  },
  {
    label: "I want to understand what I'm feeling",
    areas: [
      { to: "/not-broken", title: "You Are Not Broken", why: "Short guided learning modules." },
      {
        to: "/recovery-rooms/clarity",
        title: "Clarity",
        why: "Make sense of what happened, gently.",
      },
    ],
  },
  {
    label: "I'm thinking about what's next",
    areas: [
      {
        to: "/opportunities",
        title: "Opportunities",
        why: "Education, work, mentorship and more.",
      },
      { to: "/recovery-rooms/future", title: "Future", why: "Imagine and plan what comes next." },
    ],
  },
];

export function StartGuide() {
  const tx = useTx();
  const [pick, setPick] = useState<number | null>(null);
  const chosen = pick === null ? null : choices[pick];

  return (
    <section aria-labelledby="start-h" className="mt-16 rounded-3xl bg-secondary/60 p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="start-h" className="font-display text-2xl text-foreground sm:text-3xl">
          {tx("Start where you are")}
        </h2>
        <StatusTag status="provisional" />
      </div>
      <p className="mt-2 text-muted-foreground">
        {tx(
          "Optional. Pick what fits right now and we'll suggest a few places. Your choice isn't saved.",
        )}
      </p>

      <div
        role="radiogroup"
        aria-label={tx("Start where you are")}
        className="mt-5 flex flex-wrap gap-2"
      >
        {choices.map((c, i) => (
          <button
            key={c.label}
            role="radio"
            aria-checked={pick === i}
            onClick={() => setPick(pick === i ? null : i)}
            className={`min-h-12 rounded-full border px-5 text-sm font-semibold transition ${pick === i ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:border-primary"}`}
          >
            {tx(c.label)}
          </button>
        ))}
      </div>

      {chosen && (
        <div aria-live="polite" className="mt-6">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            {tx("You might start here:")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chosen.areas.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-5 hover:shadow-md"
              >
                <span>
                  <span className="block font-bold text-primary">{tx(a.title)}</span>
                  <span className="text-sm text-muted-foreground">{tx(a.why)}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </Link>
            ))}
          </div>
          <button
            onClick={() => setPick(null)}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> {tx("Clear choice")}
          </button>
        </div>
      )}
    </section>
  );
}
