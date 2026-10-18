import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { PrivacyWarning } from "@/components/portal/PrivacyChoice";
import { Link } from "@tanstack/react-router";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Your Privacy — Wellness Portal" },
      {
        name: "description",
        content:
          "How the Wellness Portal protects survivor privacy: no sign-up, no profiles, no trackers.",
      },
      { property: "og:title", content: "Your Privacy — Wellness Portal" },
      { property: "og:description", content: "No sign-up, no profiles, no trackers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const promises = [
  "No sign-up or login is ever required",
  "No survivor profiles",
  "No advertising trackers or retargeting",
  "No session recording or invasive heatmaps",
  "No precise location tracking",
  "No identifying information collected for analytics",
];

function Privacy() {
  const tx = useTx();
  return (
    <PageShell
      title="Your privacy"
      intro="This Portal is designed so you never have to tell us who you are."
      tags={<StatusTag status="confirmed" />}
      back={{ to: "/", label: "Home" }}
    >
      <div className="mb-6 space-y-3">
        <PrivacyWarning />
        <Link to="/saved-items" className="text-primary underline">
          {tx("My Saved Items")}
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {promises.map((p) => (
          <li key={p} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            {tx(p)}
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-3xl bg-secondary p-6 text-secondary-foreground">
        <h2 className="text-lg font-bold">About Quick Exit</h2>
        <p className="mt-2">
          Quick Exit (or the Esc key) takes you to a neutral website right away. It does not erase
          your browser history and cannot guarantee that no one is monitoring your device. Consider
          using a private browsing window.
        </p>
        <p className="mt-2">
          The Esc key does not leave while you are typing, drawing or have a window open, so a stray
          key press cannot lose your work. The Quick Exit button always works.
        </p>
        <div className="mt-3">
          <StatusTag status="approval" note="destination & production behavior" />
        </div>
      </section>
      <section className="mt-6 rounded-3xl border p-6">
        <h2 className="text-lg font-bold">Usage measurement</h2>
        <p className="mt-2 text-muted-foreground">
          In the future, the Portal may count anonymous actions (for example, "a page was opened")
          to improve it — never the content of what you write, draw or search, and never who you
          are. Nothing is measured in this prototype.
        </p>
      </section>
    </PageShell>
  );
}
