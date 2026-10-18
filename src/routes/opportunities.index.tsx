import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { opportunities, opportunityCategories } from "@/data/portal";
import { track } from "@/lib/analytics";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — Wellness Portal" },
      {
        name: "description",
        content: "Browse education, employment, mentorship and other opportunities.",
      },
      { property: "og:title", content: "Opportunities — Wellness Portal" },
      { property: "og:description", content: "Education, work, mentorship and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Opps,
});

function Opps() {
  const tx = useTx();
  const [cat, setCat] = useState<string>("All");
  const list = cat === "All" ? opportunities : opportunities.filter((o) => o.category === cat);
  return (
    <PageShell
      title="Opportunities"
      intro="Explore what's possible next — at your own pace."
      tags={
        <>
          <StatusTag status="confirmed" note="category structure" />
          <StatusTag status="approval" note="review vs. SharePoint research (Santhwana, Sikta)" />
          <StatusTag status="placeholder" />
        </>
      }
      back={{ to: "/", label: "Home" }}
    >
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Categories">
        {["All", ...opportunityCategories].map((c) => (
          <button
            key={c}
            aria-pressed={cat === c}
            onClick={() => {
              setCat(c);
              track("opportunity_category_opened");
            }}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold ${cat === c ? "bg-coral text-tile-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {tx(c)}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((o) => (
          <Link
            key={o.id}
            to="/opportunities/$id"
            params={{ id: o.id }}
            className="rounded-3xl border bg-card p-5 hover:shadow-lg"
          >
            <span className="text-xs font-semibold uppercase text-coral">{tx(o.category)}</span>
            <h2 className="mt-1 font-bold">{o.title}</h2>
            <p className="text-sm text-muted-foreground">{o.org}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
