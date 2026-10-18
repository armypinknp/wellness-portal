import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ArrowLeft, Clock, ExternalLink, FileText, Info, X } from "lucide-react";
import { StatusTag } from "./Shell";
import { useTx } from "@/lib/prefs";
import type { Resource } from "@/data/portal";

/** "What to expect" — shown before a resource opens. */
export function ResourcePreview({ r, onClose }: { r: Resource; onClose: () => void }) {
  const tx = useTx();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const h = (e: KeyboardEvent) => { if (e.key === "Tab") return; };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/40 p-0 sm:place-items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="prev-h" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl bg-card p-6 text-card-foreground shadow-2xl sm:rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="mr-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tx("What to expect")}</p>
            <h2 id="prev-h" className="mt-1 text-xl font-bold">{r.title}</h2>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label={tx("Close")} className="grid h-10 w-10 place-items-center rounded-full border"><X className="h-4 w-4" /></button>
        </div>

        <dl className="mt-5 grid gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-muted p-3"><FileText className="h-5 w-5 text-primary" /><dt className="sr-only">{tx("Format")}</dt><dd><span className="font-semibold">{tx(r.type)}</span> · {tx(r.formatNote)}</dd></div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted p-3"><Clock className="h-5 w-5 text-primary" /><dt className="sr-only">{tx("Time")}</dt><dd>{tx("About")} {r.minutes} min</dd></div>
          <div className={`flex items-center gap-3 rounded-2xl p-3 ${r.external ? "bg-coral/15" : "bg-muted"}`}>
            <ExternalLink className="h-5 w-5 text-primary" /><dt className="sr-only">{tx("Destination")}</dt>
            <dd>{r.external ? tx("Opens a website outside the Portal. Quick Exit won't work there.") : tx("Stays inside the Portal.")}</dd>
          </div>
          {r.contentNote && (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed p-3"><Info className="mt-0.5 h-5 w-5 text-primary" /><dt className="sr-only">{tx("Content note")}</dt><dd><span className="font-semibold">{tx("Content note")}:</span> {tx(r.contentNote)}</dd></div>
          )}
        </dl>
        <div className="mt-2"><StatusTag status="placeholder" note="notes TBC" /></div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <button onClick={onClose} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border font-semibold"><ArrowLeft className="h-4 w-4" /> {tx("Not now — go back")}</button>
          <Link to="/resource/$id" params={{ id: r.id }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground">
            {r.external ? tx("Continue") : tx("Open resource")}
          </Link>
        </div>
      </div>
    </div>
  );
}
