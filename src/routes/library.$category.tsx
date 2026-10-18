import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ResourcePreview } from "@/components/portal/ResourcePreview";
import { ExternalLink } from "lucide-react";
import { useTx } from "@/lib/prefs";
import type { Resource } from "@/data/portal";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { libraryCategories, resources } from "@/data/portal";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/library/$category")({
  loader: ({ params }) => {
    const c = libraryCategories.find((x) => x.slug === params.category);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Healing Library` },
          { name: "description", content: `Resources about ${loaderData.name.toLowerCase()}.` },
          { property: "og:title", content: `${loaderData.name} — Healing Library` },
          {
            property: "og:description",
            content: `Resources about ${loaderData.name.toLowerCase()}.`,
          },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Category,
});

function Category() {
  const c = Route.useLoaderData();
  const tx = useTx();
  const [preview, setPreview] = useState<Resource | null>(null);
  useEffect(() => {
    track("library_category_opened");
  }, []);
  return (
    <PageShell
      title={c.name}
      tags={<StatusTag status="placeholder" />}
      back={{ to: "/library", label: "Healing Library" }}
    >
      <ul className="flex flex-col gap-3">
        {resources
          .filter((r) => r.category === c.slug)
          .map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setPreview(r)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-card p-5 text-left hover:bg-secondary"
              >
                <span className="font-semibold">{r.title}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {r.external && (
                    <ExternalLink
                      aria-label={tx("Leaves the Portal")}
                      className="h-4 w-4 text-muted-foreground"
                    />
                  )}
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    {tx(r.type)} · {r.minutes} min
                  </span>
                </span>
              </button>
            </li>
          ))}
      </ul>
      {preview && <ResourcePreview r={preview} onClose={() => setPreview(null)} />}
    </PageShell>
  );
}
