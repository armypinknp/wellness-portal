import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ArrowRight, Wind, Home, BookOpen, Sparkles, Briefcase, Image as ImageIcon, NotebookPen, Compass, Wrench, Video } from "lucide-react";
import toolCalm from "@/assets/tool-calm.png";
import toolArt from "@/assets/tool-art.png";
import toolJournals from "@/assets/tool-journals.png";
import toolDecision from "@/assets/tool-decision.png";
import toolRooms from "@/assets/tool-rooms.png";
import toolToolkit from "@/assets/tool-toolkit.png";
import hourglass from "@/assets/hourglass.png";
import flowers from "@/assets/partners-flowers.png";
import { Intro } from "@/components/portal/Intro";
import { StatusTag, TranslationNote } from "@/components/portal/Shell";
import { track } from "@/lib/analytics";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome — Army Pink Wellness Portal" },
      { name: "description", content: "Start with the Art Room: Why I Left → Where I'm Going. A private, no-sign-up space to heal and grow." },
      { property: "og:title", content: "Welcome — Army Pink Wellness Portal" },
      { property: "og:description", content: "A private, no-sign-up space to create, calm down, learn and plan what comes next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});


const calmCard = { to: "/calm-room", title: "The Calm Room", desc: "Feeling Overwhelmed? Enter the Calm Room to calm, ground and settle your nervous system.", img: toolCalm, bg: "bg-slate", fg: "text-slate" } as const;
const artCard = { to: "/art-room", title: "The Art Room", desc: "Want to express yourself? Create freely in the Art Room. Why I left, where I'm going.", img: toolArt, bg: "bg-plum", fg: "text-plum" } as const;
const tools = [
  { to: "/journals", title: "Healing Journals", desc: "Gentle, guided reflections. One step at a time.", img: toolJournals, bg: "bg-primary", fg: "text-primary" },
  { to: "/decision-support", title: "Decision Support", desc: "Need to make a tough decision? We're here to help.", img: toolDecision, bg: "bg-teal", fg: "text-teal" },
  { to: "/recovery-rooms", title: "Recovery Rooms", desc: "Healing spaces for sleep, grief, confidence & more.", img: toolRooms, bg: "bg-lavender", fg: "text-lavender" },
  { to: "/toolkit", title: "Survivor Toolkit", desc: "Practical, action-oriented support.", img: toolToolkit, bg: "bg-coral", fg: "text-coral" },
] as const;

type Card = { to: string; title: string; desc: string; img: string; bg: string; fg: string };
// Small compact card on phones; enlarged card with an Enter button from tablet up.
function PortalCard({ c }: { c: Card }) {
  const tx = useTx();
  return (
    <Link to={c.to} className={`group block rounded-3xl ${c.bg} p-4 text-tile-foreground shadow-lg transition hover:-translate-y-1 hover:brightness-105 sm:p-8`}>
      <h3 className="text-center text-base font-bold sm:hidden">{tx(c.title)}</h3>
      <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:gap-8">
        <img src={c.img} alt="" loading="lazy" width={816} height={816} className="h-20 w-20 shrink-0 object-contain transition group-hover:scale-105 sm:h-40 sm:w-40" />
        <div className="min-w-0 flex-1 sm:text-center">
          <h3 className="hidden text-2xl font-bold sm:block">{tx(c.title)}</h3>
          <p className="text-xs leading-relaxed sm:mt-3 sm:text-left sm:text-base">{tx(c.desc)}</p>
          <span className={`mt-5 hidden min-h-12 items-center rounded-full bg-tile-foreground px-16 text-lg font-bold ${c.fg} shadow-[0_0_20px_-4px_var(--color-tile-foreground)] sm:inline-flex`}>{tx("Enter")}</span>
        </div>
      </div>
    </Link>
  );
}

const faqs = [
  { q: "Do I need an account to use the Portal?", a: "No. There is no sign-up and no profile. You can use every space without sharing who you are." },
  { q: "Is anything I do here saved?", a: "Only items you explicitly choose to save are kept in this browser on this device. You can continue without saving and use every room. Manage or delete saved content in My Saved Items." },
  { q: "What does Quick Exit do?", a: "Quick Exit (or the Esc key) immediately leaves the Portal and opens a neutral website." },
  { q: "What if I need help right now?", a: "If you're in immediate danger, call 911. The National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788." },
];

function HeartLine() {
  return (
    <svg aria-hidden viewBox="0 0 600 420" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" fill="none">
      <path d="M20 360c10 30 80 20 120 0s80-90 110-110 60-20 50 10-50 20-50-20 30-80 90-80 120 20 170 10 100-40 140-90c20-30 20-110 50-150"
        className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px currentColor)" }} />
      <path d="M440 230c-40-30-70-70-60-100s50-20 60 10c10-30 50-40 60-10s-20 70-60 100z" className="stroke-primary animate-float" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 8px currentColor)", transformOrigin: "440px 160px" }} />
    </svg>
  );
}

function Index() {
  const tx = useTx();
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    track("landing_opened");
    if (!sessionStorage.getItem("wp-intro-seen")) setShowIntro(true);
  }, []);
  const done = () => { sessionStorage.setItem("wp-intro-seen", "1"); setShowIntro(false); };

  return (
    <>
      {showIntro && <Intro onDone={done} />}
      <main className="mx-auto max-w-6xl px-4">
        {/* 1. Welcome */}
        <section className="relative -mx-4 overflow-hidden px-4 pb-16 pt-12 sm:px-10 sm:pb-24 sm:pt-16">
          <HeartLine />
          <div className="relative max-w-md text-center sm:text-left">
            <TranslationNote />
            <span className="inline-block text-sm font-semibold text-primary">{tx("A safe place, just for you")}</span>
            <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {tx("Welcome.")}<br />{tx("You're safe here.")}
            </h1>
            <p className="mt-4 text-lg text-primary">{tx("Distressed? Explore our Calm Room.")}</p>
            <Link to="/calm-room" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground shadow-[0_0_24px_-4px_var(--color-primary)] hover:opacity-90">
              {tx("Enter the Calm Room")}
            </Link>
          </div>
        </section>

        {/* Calm Room shortcut */}
        <section aria-labelledby="calm-h" className="mt-4">
          <h2 id="calm-h" className="text-2xl font-bold">{tx("Take a Moment")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6"><PortalCard c={calmCard} /><PortalCard c={artCard} /></div>
        </section>

        {/* Wellness tools */}
        <section aria-labelledby="tools-h" className="mt-16">
          <h2 id="tools-h" className="text-2xl font-bold">{tx("Our Wellness Tools")}</h2>
          <p className="mt-1 text-muted-foreground">{tx("Created to support you, by your own terms.")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
            {tools.map((t) => <PortalCard key={t.to} c={t} />)}
          </div>
        </section>

        {/* Pathway to Opportunity */}
        <section aria-labelledby="path-h" className="mt-20">
          <h2 id="path-h" className="text-2xl font-bold">{tx("Pathway to Opportunity")}</h2>
          <div className="mt-6 grid items-center gap-8 sm:grid-cols-2">
            <img src={hourglass} alt="" loading="lazy" width={768} height={1024} className="mx-auto h-64 w-auto animate-float object-contain" />
            <div>
              <p className="text-muted-foreground">{tx("Starting over doesn't have to be hard. Explore our richly curated resources to get you started on building a future for you.")}</p>
              <div className="mt-6 rounded-2xl bg-secondary/70 p-8 text-center shadow-[0_0_24px_-6px_var(--color-primary)] ring-1 ring-primary/30">
                <p className="text-xl font-bold">{tx("99+ Resources to help plan for your future")}</p>
                <Link to="/opportunities" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-tile-foreground px-8 font-semibold text-on-tile shadow-lg hover:opacity-90">{tx("Learn More")}</Link>
                <div className="mt-3"><StatusTag status="placeholder" note="resource count" /></div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet our partners */}
        <section aria-labelledby="partners-h" className="mt-20">
          <h2 id="partners-h" className="text-2xl font-bold">{tx("Meet Our Partners")}</h2>
          <Link to="/partners" className="mt-6 grid items-center gap-6 sm:grid-cols-2">
            <p className="text-center text-xl font-bold text-primary">{tx("We have collaborated with the best in the industry, to bring you the care you need.")}</p>
            <img src={flowers} alt="" loading="lazy" width={1024} height={1024} className="mx-auto h-64 w-auto animate-float object-contain" />
          </Link>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-h" className="mx-auto mt-20 max-w-2xl">
          <h2 id="faq-h" className="text-center text-2xl font-bold">FAQ</h2>
          <div className="mt-2 text-center"><StatusTag status="placeholder" note="answers need approval" /></div>
          <div className="mt-6 divide-y divide-border">
            {faqs.map((f, i) => (
              <details key={f.q} className="group py-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {i + 1}. {tx(f.q)}
                  <ChevronDown className="h-5 w-5 shrink-0 text-primary transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{tx(f.a)}</p>
              </details>
            ))}
          </div>
        </section>
        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          {tx("If you're in immediate danger, call 911. To reach the National Domestic Hotline, call 1-800-799-7233 or text START to 88788.")}
        </p>
      </main>
    </>
  );
}
