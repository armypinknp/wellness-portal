import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BriefcaseMedical, Map, Lock, Clock, ArrowLeft } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { RowCard, SimulatedBadge, SimulatedPin } from "@/components/portal/Simulated";
import { SaveActions } from "@/components/portal/SaveActions";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/toolkit")({
  head: () => ({
    meta: [
      { title: "Survivor Toolkit — Wellness Portal" },
      {
        name: "description",
        content:
          "Practical, action-oriented support: calm kit, safe exit roadmap, safety planner and quick rescues.",
      },
      { property: "og:title", content: "Survivor Toolkit — Wellness Portal" },
      { property: "og:description", content: "Practical, action-oriented support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Toolkit,
});

const roadmap = [
  "Notice what feels unsafe",
  "Identify one trusted person",
  "Gather important documents",
  "Know who to call",
  "Choose a safe moment",
];
const planner = [
  "Safe places I can go",
  "People I can contact",
  "Things to take with me",
  "A code word",
];

function Toolkit() {
  const tx = useTx();
  const [notes, setNotes] = useState<string[]>(planner.map(() => ""));
  const [view, setView] = useState<"list" | "roadmap" | "planner">("list");
  const back = (
    <button
      onClick={() => setView("list")}
      className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {tx("Survivor Toolkit")}
    </button>
  );

  if (view === "roadmap")
    return (
      <PageShell
        accent="coral"
        title="Safe Exit Roadmap"
        tags={<StatusTag status="approval" note="safety guidance" />}
      >
        {back}
        <ol className="grid max-w-2xl gap-3">
          {roadmap.map((s, i) => (
            <li key={s} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-coral font-bold text-tile-foreground">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Placeholder steps — final guidance pending expert review.
        </p>
      </PageShell>
    );

  if (view === "planner")
    return (
      <PageShell
        accent="coral"
        title="Hidden Safety Planner"
        tags={
          <>
            <SimulatedBadge what="PIN lock" />
            <SimulatedBadge what="works offline" />
          </>
        }
      >
        {back}
        <SimulatedPin label="Create a PIN for your planner">
          <div className="grid max-w-2xl gap-4">
            {planner.map((p, i) => (
              <label key={p} className="block rounded-2xl border bg-card p-4">
                <span className="font-bold">{p}</span>
                <textarea
                  value={notes[i]}
                  onChange={(e) =>
                    setNotes((old) => old.map((v, j) => (i === j ? e.target.value : v)))
                  }
                  rows={2}
                  className="mt-2 w-full rounded-xl border bg-background p-3 text-base"
                />
              </label>
            ))}
            <SimulatedBadge what="PIN & encryption — not real protection" />
            <SaveActions
              item={{
                kind: "reflection",
                roomId: "toolkit",
                activityId: "safety-planner",
                room: "Survivor Toolkit",
                activity: "Hidden Safety Planner",
                source: "/toolkit",
                payload: {
                  text: planner.map((p, i) => `${p}\n${notes[i] ?? ""}`).join("\n\n"),
                },
              }}
            />
          </div>
        </SimulatedPin>
      </PageShell>
    );

  return (
    <PageShell
      accent="coral"
      title="Survivor Toolkit"
      back={{ to: "/", label: "Back" }}
      intro="Practical, action-oriented support."
    >
      <div className="grid gap-4">
        <RowCard
          icon={BriefcaseMedical}
          color="bg-coral"
          title="Emergency Calm Kit"
          sub={tx("Grounding & regulation tools")}
          to="/calm-room"
        />
        <RowCard
          icon={Map}
          color="bg-coral"
          title="Safe Exit Roadmap"
          sub={tx("Planning & preparation support")}
          onClick={() => setView("roadmap")}
        />
        <RowCard
          icon={Lock}
          color="bg-coral"
          title="Hidden Safety Planner"
          sub={tx("Optional device saving; PIN & offline features are simulated")}
          onClick={() => setView("planner")}
          highlight
          right={<SimulatedBadge what="PIN & offline" />}
        />
        <RowCard
          icon={Clock}
          color="bg-coral"
          title="5-Minute Rescue Library"
          sub={tx("Quick support when you need it fast")}
          to="/calm-room"
        />
      </div>
    </PageShell>
  );
}
