import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { opportunities } from "@/data/portal";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/opportunities/$id")({
  loader: ({ params }) => {
    const o = opportunities.find((x) => x.id === params.id);
    if (!o) throw notFound();
    return o;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Opportunities` },
          { name: "description", content: `${loaderData.category} opportunity (sample).` },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: `${loaderData.category} opportunity (sample).` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Opp,
});

function Opp() {
  const o = Route.useLoaderData();
  useEffect(() => {
    track("opportunity_viewed");
  }, []);
  return (
    <PageShell
      title={o.title}
      tags={
        <>
          <StatusTag status="placeholder" />
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs">{o.category}</span>
        </>
      }
      back={{ to: "/opportunities", label: "Opportunities" }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {["About this opportunity", "Who it's for", "How to apply"].map((h) => (
            <section key={h} className="rounded-2xl border bg-card p-5">
              <h2 className="font-bold">{h}</h2>
              <p className="mt-1 text-muted-foreground">
                Placeholder — real details, eligibility and deadlines will not be shown until
                verified.
              </p>
            </section>
          ))}
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-secondary p-5 text-secondary-foreground">
            <p className="text-sm">Offered by</p>
            <p className="font-bold">{o.org}</p>
            <button
              onClick={() => {
                track("external_link_selected");
                toast("External link (placeholder)");
              }}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
            >
              <ExternalLink className="h-4 w-4" /> Visit website
            </button>
          </div>
          <SaveActions allowDelete={false} />
        </aside>
      </div>
    </PageShell>
  );
}
