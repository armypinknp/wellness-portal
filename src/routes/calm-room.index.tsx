import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wind, Headphones, Video, Anchor } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { calmMedia } from "@/data/portal";

export const Route = createFileRoute("/calm-room/")({
  head: () => ({
    meta: [
      { title: "The Calm Room — Wellness Portal" },
      { name: "description", content: "Breathing, grounding, guided audio and calming videos to settle your nervous system." },
      { property: "og:title", content: "The Calm Room — Wellness Portal" },
      { property: "og:description", content: "Breathe, ground, and settle your nervous system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calm,
});

const icons = { Breathing: Wind, Grounding: Anchor, Video: Video, "Guided audio": Headphones } as const;

const phases = ["Breathe", "Breathe In", "Breathe Out"] as const;
function BreatheDisc({ p, onTap }: { p: number; onTap: () => void }) {
  const inhale = p === 1;
  return (
    <button type="button" onClick={onTap} aria-live="polite" aria-label={`${phases[p]} — tap for the next breath`}
      className={`grid h-56 w-56 place-items-center rounded-full transition-all duration-700 sm:h-64 sm:w-64 ${inhale ? "bg-slate/30 p-6" : "p-0"}`}>
      <span className="grid h-full w-full place-items-center rounded-full bg-slate text-2xl font-bold text-tile-foreground shadow-[0_0_40px_-8px_var(--slate)] ring-4 ring-slate/25 transition-all duration-700 sm:text-3xl">
        {phases[p]}
      </span>
    </button>
  );
}

function Calm() {
  const [p, setP] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    setP(1);
    const id = setInterval(() => setP((x) => (x === 1 ? 2 : 1)), 4000);
    return () => clearInterval(id);
  }, [running]);
  return (
    <PageShell
      accent="slate"
      title="The Calm Room"
      intro="A space to slow down. Choose what helps right now."
      tags={<><StatusTag status="confirmed" note="existing experience" /><StatusTag status="placeholder" note="media" /></>}
      back={{ to: "/", label: "Home" }}
    >
      <div className="flex flex-col items-center py-6">
        <BreatheDisc p={p} onTap={() => setP((p + 1) % 3)} />
        <button type="button" onClick={() => { if (running) { setRunning(false); setP(0); setCompleted(true); } else { setRunning(true); setStarted(true); setCompleted(false); } }} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-slate px-7 font-semibold text-tile-foreground shadow-lg hover:opacity-90">
          {running ? "Stop breathing exercise" : "Start breathing exercise"}
        </button>
      </div>
      {started && completed && <SaveActions item={{ room: "Calm Room", activity: "Breathing exercise", source: "/calm-room", text: "Breathing exercise completed. Breathe In and Breathe Out alternate every 4 seconds." }} />}
      <h2 className="mt-8 text-xl font-bold sm:text-2xl">More Calming Resources</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {calmMedia.map((m) => {
          const I = icons[m.kind];
          return (
            <Link key={m.id} to="/calm-room/$id" params={{ id: m.id }} className="flex items-center gap-4 rounded-3xl border bg-card/60 p-4 shadow-lg backdrop-blur hover:bg-card sm:p-5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate text-tile-foreground"><I className="h-3.5 w-3.5" /></span>
              <span className="min-w-0"><span className="block font-bold">{m.title}</span><span className="block text-xs text-muted-foreground">{m.kind} · {m.length}</span></span>
            </Link>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Scripts and media will come from approved sources. No therapeutic guidance is written here.</p>
    </PageShell>
  );
}
