import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import artRoom from "@/assets/art-room.jpg";
import { StatusTag } from "./Shell";
import { usePrefs, useTx } from "@/lib/prefs";

const featured = [
  { img: artRoom, title: "Stepping into the light", stage: "Where I'm Going" },
  { bg: "from-primary to-coral", title: "Untitled", stage: "Why I Left" },
  { bg: "from-teal to-lavender", title: "Quiet morning", stage: "Where I Am" },
  { bg: "from-sun to-coral", title: "New roots", stage: "Where I'm Going" },
  { bg: "from-lavender to-plum", title: "Breathing room", stage: "Where I Am" },
  { bg: "from-calm to-teal", title: "The open door", stage: "Why I Left" },
];

export function ArtCarousel() {
  const { reduceMotion } = usePrefs();
  const tx = useTx();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const n = featured.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!playing || reduceMotion || prefersReduced) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % n), 4500);
    return () => clearInterval(id);
  }, [playing, reduceMotion, n]);

  const a = featured[i]!;
  return (
    <section aria-roledescription="carousel" aria-label="Featured artwork" className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {tx("Featured artwork")}
        </h2>
        <StatusTag status="placeholder" />
      </div>
      <div className="relative overflow-hidden rounded-3xl border bg-card shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {featured.map((f, k) => (
            <figure key={k} aria-hidden={k !== i} className="w-full shrink-0">
              {f.img ? (
                <img
                  src={f.img}
                  alt="Placeholder artwork: a woman stepping into a sunflower field"
                  className="aspect-[16/7] w-full object-cover"
                />
              ) : (
                <div className={`aspect-[16/7] w-full bg-gradient-to-br ${f.bg}`} />
              )}
            </figure>
          ))}
        </div>
        <div
          aria-live={playing ? "off" : "polite"}
          className="flex flex-wrap items-center gap-3 p-4"
        >
          <div className="mr-auto">
            <p className="font-semibold">{a.title}</p>
            <p className="text-xs text-muted-foreground">
              {tx("Anonymous")} · {tx(a.stage)} · {i + 1} of {n}
            </p>
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Choose artwork">
            {featured.map((_, k) => (
              <button
                key={k}
                aria-label={`Show artwork ${k + 1}`}
                aria-current={k === i}
                onClick={() => setI(k)}
                className={`h-2.5 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Previous artwork"
              onClick={() => go(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              onClick={() => setPlaying(!playing)}
              className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              aria-label="Next artwork"
              onClick={() => go(1)}
              className="grid h-11 w-11 place-items-center rounded-full border hover:bg-secondary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
