import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChevronRight, FlaskConical, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/prefs";

/** Clear label for anything that only pretends to secure/store data in this prototype. */
export function SimulatedBadge({ what }: { what: string }) {
  const tx = useTx();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-coral bg-coral/10 px-3 py-1 text-xs font-semibold text-foreground">
      <FlaskConical className="h-3.5 w-3.5" /> {tx("Simulated")}: {tx(what)}
    </span>
  );
}

/** Row card matching the original prototype's list screens. */
export function RowCard({
  icon: Icon,
  color,
  title,
  sub,
  to,
  onClick,
  muted,
  highlight,
  right,
  soon,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  sub: string;
  to?: string;
  onClick?: () => void;
  muted?: boolean;
  highlight?: boolean;
  right?: ReactNode;
  soon?: boolean;
}) {
  const tx = useTx();
  const cls = `flex w-full items-center gap-4 rounded-3xl border bg-card/60 p-4 backdrop-blur sm:gap-5 sm:p-5 text-left shadow-lg transition hover:bg-card ${highlight ? "border-2 border-primary" : ""} ${muted ? "opacity-60" : ""} ${soon ? "cursor-not-allowed hover:shadow-sm" : ""}`;
  const inner = (
    <>
      <span
        aria-hidden
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${muted ? "bg-muted text-muted-foreground" : `${color} text-tile-foreground`}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-snug sm:text-lg">{tx(title)}</span>
        <span className="block text-sm text-muted-foreground sm:text-base">{sub}</span>
        {right && <span className="mt-2 block">{right}</span>}
      </span>
      {soon ? (
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {tx("Coming soon")}
        </span>
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-foreground" />
      )}
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} disabled={soon} aria-disabled={soon} className={cls}>
      {inner}
    </button>
  );
}

/**
 * Simulated PIN gate. The PIN is held only in component memory and compared in plain
 * JS — nothing is encrypted or stored. Leaving the page forgets it.
 */
export function SimulatedPin({ label, children }: { label: string; children: ReactNode }) {
  const tx = useTx();
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  if (open) return <>{children}</>;
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) return setErr(tx("Use 4–6 numbers."));
    if (pin !== again) return setErr(tx("The PINs don't match."));
    setOpen(true);
  };
  const input =
    "h-16 w-full rounded-2xl border-2 bg-background text-center text-2xl tracking-[0.5em] focus:border-primary focus:outline-none";
  return (
    <form onSubmit={create} className="max-w-md rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Lock className="h-5 w-5 text-primary" /> {tx(label)}
      </h2>
      <div className="mt-4 grid gap-3">
        <input
          aria-label={tx("PIN")}
          inputMode="numeric"
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          className={input}
        />
        <input
          aria-label={tx("Re-enter PIN")}
          inputMode="numeric"
          type="password"
          maxLength={6}
          value={again}
          onChange={(e) => setAgain(e.target.value)}
          placeholder={tx("Re-enter PIN")}
          className={`${input} placeholder:text-base placeholder:tracking-[0.3em]`}
        />
      </div>
      {err && (
        <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
          {err}
        </p>
      )}
      <button className="mt-5 min-h-12 w-full rounded-2xl bg-primary px-8 sm:w-auto font-semibold text-primary-foreground shadow-lg">
        {tx("Create")}
      </button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="mt-3 h-auto min-h-11 whitespace-normal rounded-full"
      >
        {tx("Continue without a simulated PIN")}
      </Button>
      <p className="mt-4 rounded-xl border border-dashed border-coral bg-coral/10 p-3 text-xs text-foreground">
        {tx(
          "Prototype only: the PIN isn't stored or used to encrypt anything. It's forgotten when you leave this page.",
        )}
      </p>
    </form>
  );
}
