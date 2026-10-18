import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { libraryCategories, resources } from "@/data/portal";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/resource/$id")({
  loader: ({ params }) => {
    const r = resources.find((x) => x.id === params.id);
    if (!r) throw notFound();
    return { r, cat: libraryCategories.find((c) => c.slug === r.category) ?? libraryCategories[0] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.r.title} — Healing Library` },
          { name: "description", content: `${loaderData.r.type} in the Healing Library.` },
          { property: "og:title", content: loaderData.r.title },
          { property: "og:description", content: `${loaderData.r.type} in the Healing Library.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Resource,
});

function Resource() {
  const { r, cat } = Route.useLoaderData();
  useEffect(() => {
    track("library_resource_opened");
  }, []);
  return (
    <PageShell
      title={r.title}
      tags={
        <>
          <StatusTag status="placeholder" />
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs">{r.type}</span>
        </>
      }
      back={{ to: `/library/${cat.slug}`, label: cat.name }}
    >
      <article className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">
        <p>
          Placeholder article body. Final copy will come from vetted, approved sources and will be
          reviewed for trauma-informed language.
        </p>
        <p>
          This layout shows readable line length, generous spacing, and clear actions at the end of
          each resource.
        </p>
      </article>
      <SaveActions
        item={{
          kind: "resource",
          roomId: "library",
          activityId: r.id,
          room: "Healing Library",
          activity: r.title,
          source: `/resource/${r.id}`,
          payload: {
            text: `${r.type} — ${r.formatNote}. Placeholder article body. Final content remains pending approval.`,
          },
        }}
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => {
            track("external_link_selected");
            toast("External link (placeholder)");
          }}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl border px-5 font-semibold"
        >
          <ExternalLink className="h-4 w-4" /> Visit external resource
        </button>
      </div>
    </PageShell>
  );
}
