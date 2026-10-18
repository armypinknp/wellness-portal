import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { recoveryRooms } from "@/data/portal";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/recovery-rooms/")({
  head: () => ({
    meta: [
      { title: "Recovery Rooms — Wellness Portal" },
      {
        name: "description",
        content: "Six Recovery Rooms following the survivor journey, from crisis to future.",
      },
      { property: "og:title", content: "Recovery Rooms — Wellness Portal" },
      { property: "og:description", content: "Six rooms for each part of the healing journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rooms,
});

// Feeling → room mapping is provisional and needs approval.
const feelings = [
  { label: "anxious, overwhelmed", slug: "crisis" },
  { label: "restless, can't sleep", slug: "healing" },
  { label: "unsafe, shocked", slug: "safety" },
  { label: "self care, slow down", slug: "rebuilding" },
  { label: "unsure of myself, lost", slug: "clarity" },
  { label: "grief, uncertain", slug: "future" },
];

function Rooms() {
  const tx = useTx();
  return (
    <PageShell
      center
      accent="plum"
      title="Recovery Rooms"
      intro="What are you feeling right now? What do you need? Choose from below and be guided to the right resources."
      tags={<StatusTag status="approval" note="feeling-to-room mapping" />}
      back={{ to: "/", label: "Home" }}
    >
      <section
        aria-labelledby="feel-h"
        className="mx-auto max-w-3xl rounded-3xl bg-card/50 p-5 shadow-xl ring-1 ring-border backdrop-blur sm:p-8"
      >
        <h2 id="feel-h" className="text-center text-2xl font-light sm:text-3xl">
          {tx("I feel.../ I want...")}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {feelings.map((f) => (
            <Link
              key={f.label}
              to="/recovery-rooms/$slug"
              params={{ slug: f.slug }}
              className="grid aspect-[6/5] place-items-center rounded-2xl bg-plum p-4 text-center text-base font-bold text-tile-foreground shadow-lg transition hover:-translate-y-1 hover:brightness-110 sm:text-lg"
            >
              {tx(f.label)}
            </Link>
          ))}
        </div>
      </section>

      <details className="mx-auto mt-10 max-w-3xl rounded-2xl bg-card/40 p-5">
        <summary className="cursor-pointer font-semibold">{tx("Or browse all six rooms")}</summary>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {recoveryRooms.map((r) => (
            <li key={r.slug}>
              <Link
                to="/recovery-rooms/$slug"
                params={{ slug: r.slug }}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-card"
              >
                <span
                  className={`${r.color} grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-tile-foreground`}
                  aria-hidden
                >
                  {r.stage}
                </span>
                <span>
                  <span className="block font-bold">{tx(r.name)}</span>
                  <span className="text-xs text-muted-foreground">{tx(r.forWhen)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </details>
    </PageShell>
  );
}
