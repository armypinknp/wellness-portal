import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { ArtCarousel } from "@/components/portal/ArtCarousel";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Anonymous Art Gallery — Wellness Portal" },
      {
        name: "description",
        content:
          "Concept for an anonymous gallery of survivor artwork, with no names or profiles attached.",
      },
      { property: "og:title", content: "Anonymous Art Gallery — Wellness Portal" },
      { property: "og:description", content: "Art shared by survivors, no names attached." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Gallery,
});

const tiles = [
  "bg-primary",
  "bg-teal",
  "bg-coral",
  "bg-lavender",
  "bg-sun",
  "bg-plum",
  "bg-calm",
  "bg-secondary",
  "bg-teal",
];

function Gallery() {
  return (
    <PageShell
      title="Anonymous Art Gallery"
      intro="A place to see that you're not alone. Every piece is shared anonymously and only by choice."
      tags={
        <>
          <StatusTag status="approval" note="concept" />
          <StatusTag status="placeholder" />
        </>
      }
      back={{ to: "/art-room", label: "Art Room" }}
    >
      <ArtCarousel />
      <div className="columns-2 gap-4 md:columns-3">
        {tiles.map((c, i) => (
          <figure
            key={i}
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-card"
          >
            <div className={`${c} ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"} opacity-80`} />
            <figcaption className="p-3 text-xs text-muted-foreground">
              Placeholder artwork · "Where I'm Going"
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-6 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
        Moderation, consent and removal process require approval before any real artwork is shown.
      </p>
    </PageShell>
  );
}
