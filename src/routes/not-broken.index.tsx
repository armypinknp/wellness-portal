import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { notBrokenModules } from "@/data/portal";

export const Route = createFileRoute("/not-broken/")({
  head: () => ({
    meta: [
      { title: "You Are Not Broken — Wellness Portal" },
      { name: "description", content: "Short, self-paced learning modules. Pick any module to begin." },
      { property: "og:title", content: "You Are Not Broken — Wellness Portal" },
      { property: "og:description", content: "Short, self-paced learning modules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NB,
});

function NB() {
  return (
    <PageShell title="You Are Not Broken" intro="Short learning modules you can take in any order, at any pace." tags={<><StatusTag status="provisional" /><StatusTag status="placeholder" note="module titles" /></>} back={{ to: "/", label: "Home" }}>
      <div className="grid gap-4 sm:grid-cols-2">
        {notBrokenModules.map((m, i) => (
          <Link key={m.slug} to="/not-broken/$module" params={{ module: m.slug }} className="rounded-3xl border bg-card p-6 hover:bg-secondary">
            <span className="font-display text-3xl text-primary">0{i + 1}</span>
            <h2 className="mt-2 text-xl font-bold">{m.title}</h2>
            <p className="text-sm text-muted-foreground">{m.steps} short steps · about 10 min</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
