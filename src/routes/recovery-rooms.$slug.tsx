import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, PlayCircle, FileText, Compass } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { recoveryRooms } from "@/data/portal";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/recovery-rooms/$slug")({
  loader: ({ params }) => {
    const r = recoveryRooms.find((x) => x.slug === params.slug);
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} Room — Recovery Rooms` },
          { name: "description", content: loaderData.blurb },
          { property: "og:title", content: `${loaderData.name} Room — Wellness Portal` },
          { property: "og:description", content: loaderData.blurb },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Room,
});

function Room() {
  const r = Route.useLoaderData();
  const [step, setStep] = useState(-1);
  useEffect(() => {
    track("recovery_room_opened");
  }, []);
  const idx = recoveryRooms.findIndex((x) => x.slug === r.slug);
  const next = recoveryRooms[idx + 1];

  return (
    <PageShell
      accent="plum"
      title={`${r.name} Room`}
      intro={r.blurb}
      tags={
        <>
          <StatusTag status="approval" note="name & content" />
          <StatusTag status="placeholder" />
        </>
      }
      back={{ to: "/recovery-rooms", label: "All rooms" }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border bg-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold">Sample exercise</h2>
          {step === -1 ? (
            <>
              <p className="mt-2 text-muted-foreground">
                A short, guided exercise. Content to be provided from the approved content guide.
              </p>
              <button
                onClick={() => {
                  setStep(0);
                  track("recovery_exercise_started");
                }}
                className="mt-5 min-h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
              >
                Start exercise
              </button>
            </>
          ) : step < 3 ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">Step {step + 1} of 3</p>
              <div className="mt-3 rounded-2xl bg-muted p-6">
                Placeholder guided step {step + 1}.
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setStep(step + 1)}
                  className="min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
                >
                  Continue
                </button>
                <button
                  onClick={() => setStep(-1)}
                  className="min-h-11 rounded-full border px-5 font-semibold"
                >
                  Stop for now
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <Check className="h-6 w-6" />
              <p className="mt-2 font-bold">You completed this exercise.</p>
              <p className="text-sm">Come back whenever you need it.</p>
              <div className="mt-4">
                <SaveActions
                  item={{
                    kind: "exercise",
                    roomId: `recovery-${r.slug}`,
                    activityId: "sample-exercise",
                    room: `${r.name} Room`,
                    activity: "Sample exercise completed",
                    source: `/recovery-rooms/${r.slug}`,
                    payload: {
                      text: "Completed the three-step sample exercise. Guided content remains placeholder content.",
                    },
                  }}
                />
              </div>
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            In this room
          </h2>
          {[
            [PlayCircle, "Guided interaction"],
            [FileText, "Educational resource"],
            [Compass, "Related content"],
          ].map(([I, l]) => {
            const Icon = I as typeof PlayCircle;
            return (
              <div
                key={l as string}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4"
              >
                <Icon className="h-5 w-5 text-primary" />
                {l as string}{" "}
                <span className="ml-auto text-xs text-muted-foreground">placeholder</span>
              </div>
            );
          })}
          {next && (
            <Link
              to="/recovery-rooms/$slug"
              params={{ slug: next.slug }}
              className="mt-2 rounded-2xl bg-muted p-4 font-semibold"
            >
              Next room: {next.name} →
            </Link>
          )}
          <Link to="/" className="rounded-2xl border p-4 font-semibold">
            Leave room — back to home
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}
