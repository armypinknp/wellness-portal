import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Captions } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { calmMedia } from "@/data/portal";
import { useT } from "@/lib/prefs";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/calm-room/$id")({
  loader: ({ params }) => {
    const m = calmMedia.find((x) => x.id === params.id);
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.kind} — Calm Room` },
          {
            name: "description",
            content: `Sample ${loaderData.kind.toLowerCase()} player in the Calm Room.`,
          },
          { property: "og:title", content: `${loaderData.kind} — Calm Room` },
          { property: "og:description", content: "Sample Calm Room media player." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Player,
});

function Player() {
  const m = Route.useLoaderData();
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [cc, setCc] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    track("calm_media_opened");
  }, []);
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => setPos((p) => (p >= 100 ? 100 : p + 0.5)), 200);
    return () => clearInterval(timer.current);
  }, [playing]);

  return (
    <PageShell
      title={m.title}
      tags={
        <>
          <StatusTag status="placeholder" note="media" />
          <StatusTag status="provisional" note="player UI" />
        </>
      }
      back={{ to: "/calm-room", label: "Calm Room" }}
    >
      <div className="mx-auto max-w-2xl rounded-3xl bg-calm p-6 text-calm-foreground sm:p-10">
        <div className="mx-auto grid aspect-square w-48 place-items-center rounded-full bg-calm-foreground/15">
          <div
            className={`h-28 w-28 rounded-full bg-calm-foreground/30 ${playing ? "animate-pulse" : ""}`}
          />
        </div>
        {cc && (
          <p
            aria-live="polite"
            className="mt-6 min-h-12 rounded-xl bg-background/20 p-3 text-center"
          >
            [Captions placeholder — approved script will appear here]
          </p>
        )}
        <div className="mt-6">
          <input
            aria-label="Progress"
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(+e.target.value)}
            className="w-full accent-[var(--calm-foreground)]"
          />
          <div className="mt-1 flex justify-between text-xs opacity-80">
            <span>{Math.round(pos)}%</span>
            <span>{m.length}</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            aria-label="Restart"
            onClick={() => setPos(0)}
            className="grid h-12 w-12 place-items-center rounded-full bg-calm-foreground/15"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            aria-label={playing ? t("pause") : t("play")}
            onClick={() => {
              setPlaying(!playing);
              track(playing ? "calm_media_pause" : "calm_media_play");
            }}
            className="grid h-16 w-16 place-items-center rounded-full bg-calm-foreground text-calm"
          >
            {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          </button>
          <button
            aria-label={t("captions")}
            aria-pressed={cc}
            onClick={() => {
              setCc(!cc);
              track("calm_captions_toggled");
            }}
            className={`grid h-12 w-12 place-items-center rounded-full ${cc ? "bg-calm-foreground text-calm" : "bg-calm-foreground/15"}`}
          >
            <Captions className="h-5 w-5" />
          </button>
        </div>
        {pos >= 100 && (
          <p className="mt-6 text-center font-semibold">
            You finished. Take your time before moving on.
          </p>
        )}
      </div>
      <SaveActions
        item={{
          room: "Calm Room",
          activity: m.title,
          source: `/calm-room/${m.id}`,
          text: `Sample ${m.kind} resource. ${pos >= 100 ? "Completed sample player." : "Saved resource reference."} Media is a placeholder.`,
        }}
      />
    </PageShell>
  );
}
