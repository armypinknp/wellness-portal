import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { notBrokenModules } from "@/data/portal";

export const Route = createFileRoute("/not-broken/$module")({
  loader: ({ params }) => {
    const m = notBrokenModules.find((x) => x.slug === params.module);
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — You Are Not Broken` },
          { name: "description", content: "A sample learning module." },
          { property: "og:title", content: `${loaderData.title} — You Are Not Broken` },
          { property: "og:description", content: "A sample learning module." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Module,
});

function Module() {
  const m = Route.useLoaderData();
  const [s, setS] = useState(0);
  const done = s >= m.steps;
  return (
    <PageShell title={m.title} tags={<StatusTag status="placeholder" />} back={{ to: "/not-broken", label: "All modules" }}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={s} aria-valuemax={m.steps}>
          <div className="h-full bg-primary transition-all" style={{ width: `${(s / m.steps) * 100}%` }} />
        </div>
        {!done ? (
          <div className="rounded-3xl border bg-card p-8">
            <p className="text-sm text-muted-foreground">Step {s + 1} of {m.steps}</p>
            <p className="mt-3 text-xl font-semibold">Placeholder learning content for step {s + 1}.</p>
            <p className="mt-2 text-muted-foreground">Final copy to be written and approved by the content team.</p>
            <div className="mt-6 flex gap-2">
              <button disabled={s === 0} onClick={() => setS(s - 1)} className="min-h-11 rounded-full border px-5 font-semibold disabled:opacity-40">Back</button>
              <button onClick={() => setS(s + 1)} className="min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground">Next</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-3xl bg-secondary p-8 text-secondary-foreground">
            <p className="text-xl font-bold">Module complete.</p>
            <SaveActions item={{ room: "You Are Not Broken", activity: m.title, source: `/not-broken/${m.slug}`, text: "Sample learning module completed. Learning content remains placeholder content." }} />
            <Link to="/not-broken" className="inline-block font-semibold underline">Choose another module</Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
