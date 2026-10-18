import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { libraryCategories } from "@/data/portal";
import { track } from "@/lib/analytics";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "Healing Library — Wellness Portal" },
      { name: "description", content: "Trustworthy reading, guides and resources organized by topic." },
      { property: "og:title", content: "Healing Library — Wellness Portal" },
      { property: "og:description", content: "Gentle, trustworthy reading and guides." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Library,
});

const dots = ["bg-sun", "bg-lavender", "bg-primary", "bg-teal", "bg-coral", "bg-plum"];

function Library() {
  const tx = useTx();
  const n = libraryCategories.length;
  const [cur, setCur] = useState(2);
  useEffect(() => { track("library_opened"); }, []);
  const go = (d: number) => setCur((c) => (c + d + n) % n);
  return (
    <PageShell center title="Healing Library" intro="Read, download or bookmark at your own pace." tags={<><StatusTag status="provisional" note="categories" /><StatusTag status="placeholder" /></>} back={{ to: "/", label: "Home" }}>
      <div role="region" aria-roledescription="carousel" aria-label={tx("Library topics")}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}
        className="relative mx-auto h-[22rem] max-w-5xl overflow-x-clip sm:h-[26rem]">
        {libraryCategories.map((c, i) => {
          let off = i - cur; if (off > n / 2) off -= n; if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          const hidden = abs > 2;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.8 : 0.68;
          const style = { transform: `translateX(calc(-50% + ${off} * var(--step))) scale(${scale})`, zIndex: 10 - abs, opacity: hidden ? 0 : 1 } as React.CSSProperties;
          const cls = `absolute left-1/2 top-1/2 -mt-40 flex h-80 w-56 flex-col items-center justify-center gap-6 rounded-3xl border-2 border-primary/70 bg-card/70 p-5 text-center shadow-xl backdrop-blur transition-all duration-500 sm:-mt-44 sm:h-[22rem] sm:w-60 ${hidden ? "pointer-events-none" : ""} ${abs === 0 ? "border-primary bg-card/90" : "hover:border-primary"}`;
          const inner = (<>
            <span className={`rounded-full ${dots[i % dots.length]} shadow-lg ${abs === 0 ? "h-28 w-28" : "h-20 w-20"}`} />
            <span className="block text-lg font-semibold text-foreground">{tx(c.name)}</span>
            {abs === 0 && <span className="text-sm text-muted-foreground">{c.count} {tx("resources")}</span>}
          </>);
          return abs === 0
            ? <Link key={c.slug} to="/library/$category" params={{ category: c.slug }} style={style} className={cls}>{inner}</Link>
            : <button key={c.slug} type="button" tabIndex={hidden ? -1 : 0} aria-label={`${tx("Show")} ${tx(c.name)}`} onClick={() => setCur(i)} style={style} className={cls}>{inner}</button>;
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" aria-label={tx("Previous")} onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full bg-tile-foreground text-primary shadow-lg"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex gap-2">{libraryCategories.map((c, i) => <button key={c.slug} type="button" aria-label={tx(c.name)} aria-current={i === cur} onClick={() => setCur(i)} className={`h-2.5 rounded-full transition-all ${i === cur ? "w-6 bg-primary" : "w-2.5 bg-foreground/30"}`} />)}</div>
        <button type="button" aria-label={tx("Next")} onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{tx("Tap the centre card to open a topic.")}</p>
    </PageShell>
  );
}
