import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PersonStanding, Waves, Star, BookOpen, PenLine, Info } from "lucide-react";
import { PageShell } from "@/components/portal/Shell";
import { RowCard } from "@/components/portal/Simulated";
import { useTx } from "@/lib/prefs";
import { toast } from "sonner";

export const Route = createFileRoute("/partner-sessions")({
  head: () => ({
    meta: [
      { title: "Partner Sessions — Wellness Portal" },
      { name: "description", content: "Trauma-informed sessions from trusted creators — go at your own pace." },
      { property: "og:title", content: "Partner Sessions — Wellness Portal" },
      { property: "og:description", content: "Movement, breathwork, guided writing, storytelling and meditation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sessions,
});

const cats = ["All", "Movement", "Breathwork", "Guided writing", "Storytelling", "Meditation"];
const sessions = [
  { t: "5-Minute Grounding Meditation", who: "Dr. Lena Cho", cat: "Meditation", min: 5, icon: PersonStanding, color: "bg-lavender" },
  { t: "Breathing to Calm", who: "Dr. Lena Cho", cat: "Breathwork", min: 6, icon: Waves, color: "bg-teal" },
  { t: "Gentle Morning Movement", who: "Maya Rivers", cat: "Movement", min: 10, icon: Star, color: "bg-coral" },
  { t: "Stories of Starting Over", who: "Maya Rivers", cat: "Storytelling", min: 8, icon: BookOpen, color: "bg-plum" },
  { t: "Writing a Letter to Yourself", who: "Maya Rivers", cat: "Guided writing", min: 12, icon: PenLine, color: "bg-primary" },
];

function Sessions() {
  const tx = useTx();
  const [cat, setCat] = useState("All");
  const list = sessions.filter((s) => cat === "All" || s.cat === cat);
  return (
    <PageShell title="Partner Sessions" intro="Trauma-informed sessions from trusted creators — go at your own pace." back={{ to: "/", label: "Back" }}>
      <div role="tablist" aria-label={tx("Filter sessions")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={c === cat} onClick={() => setCat(c)}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-5 ${c === cat ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 text-primary hover:bg-secondary"}`}>{tx(c)}</button>
        ))}
      </div>
      <div className="mt-5 grid gap-4">
        {list.map((s) => (
          <RowCard key={s.t} icon={s.icon} color={s.color} title={s.t} sub={`${tx("with")} ${s.who} · ${tx(s.cat)} · ${s.min} min`}
            onClick={() => toast(tx("Prototype: session video not available yet."))} />
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary p-4 text-secondary-foreground"><Info className="h-4 w-4" /> {tx("Sample content — real sessions appear here once creators publish.")}</p>
    </PageShell>
  );
}
