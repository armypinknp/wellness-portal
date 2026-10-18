import { createFileRoute } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { partners } from "@/data/portal";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Wellness Partners — Wellness Portal" },
      { name: "description", content: "Guided sessions and resources from wellness partners." },
      { property: "og:title", content: "Wellness Partners — Wellness Portal" },
      { property: "og:description", content: "Guided sessions: movement, breathwork, writing & more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Partners,
});

function Partners() {
  return (
    <PageShell title="Wellness Partners" intro="Guided sessions and resources from organizations who support survivors." tags={<><StatusTag status="placeholder" /><StatusTag status="approval" note="no real partnerships shown" /></>} back={{ to: "/", label: "Home" }}>
      <div className="grid gap-4 sm:grid-cols-2">
        {partners.map((p) => (
          <div key={p.name} className="flex items-center gap-4 rounded-3xl border bg-card p-5">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-plum text-tile-foreground"><PlayCircle className="h-6 w-6" /></span>
            <div><p className="font-bold">{p.name}</p><p className="text-sm text-muted-foreground">{p.focus}</p></div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
