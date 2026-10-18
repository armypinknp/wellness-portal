import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, ArrowLeft, Shield } from "lucide-react";
import { Logo } from "./Logo";
import { usePrefs, useT, useTx, type UIKey } from "@/lib/prefs";
import { track } from "@/lib/analytics";
import type { Status } from "@/data/portal";

// Prototype neutral destination — production destination requires approval.
export const QUICK_EXIT_URL = "https://www.weather.com";

export function quickExit() {
  track("quick_exit_selected");
  window.location.replace(QUICK_EXIT_URL);
}

/**
 * D4: Esc leaves the Portal, except when it would interrupt the visitor:
 * an open dialog/menu (Esc closes it instead) or a focused text field or
 * canvas (stray presses must not lose unsaved writing or drawing).
 * The Quick Exit button always works.
 */
export function shouldQuickExitOnKey(e: KeyboardEvent, doc: Document = document): boolean {
  if (e.key !== "Escape" || e.defaultPrevented) return false;
  if (doc.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'))
    return false;
  const el = doc.activeElement;
  if (!(el instanceof HTMLElement)) return true;
  return !(
    el.isContentEditable ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLCanvasElement ||
    (el instanceof HTMLInputElement && !["button", "checkbox", "radio", "submit"].includes(el.type))
  );
}

export function useQuickExitKey() {
  useEffect(() => {
    const h = (e: KeyboardEvent) => shouldQuickExitOnKey(e) && quickExit();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
}

export function QuickExitButton({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <button
      onClick={quickExit}
      className={`inline-flex min-h-10 items-center shrink-0 whitespace-nowrap rounded-full bg-calm px-5 text-sm font-medium text-foreground shadow-md hover:brightness-110 ${className}`}
    >
      {t("quickExit")}
    </button>
  );
}

export function LangToggle() {
  const { lang, setLang } = usePrefs();
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-0.5 rounded-full bg-foreground/25 p-1 text-xs font-semibold"
    >
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`min-h-8 min-w-9 rounded-full px-2.5 transition ${lang === l ? "bg-foreground/70 text-background" : "text-foreground/80 hover:text-foreground"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const navItems: { to: string; k: UIKey }[] = [
  { to: "/", k: "home" },
  { to: "/saved-items", k: "savedItems" },
  { to: "/art-room", k: "artRoom" },
  { to: "/calm-room", k: "calmRoom" },
  { to: "/recovery-rooms", k: "recoveryRooms" },
  { to: "/library", k: "library" },
  { to: "/not-broken", k: "notBroken" },
  { to: "/opportunities", k: "opportunities" },
  { to: "/partners", k: "partners" },
  { to: "/gallery", k: "gallery" },
];

const moreItems = [
  { to: "/journals", label: "Healing Journals" },
  { to: "/decision-support", label: "Decision Support" },
  { to: "/toolkit", label: "Survivor Toolkit" },
  { to: "/partner-sessions", label: "Partner Sessions" },
];

export function Header() {
  const t = useT();
  const tx = useTx();
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const h = () => setFloating(window.scrollY > 120);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <>
      {/* Quick Exit follows the visitor down the page once the top bar scrolls away. */}
      <div
        aria-hidden={!floating}
        className={`fixed right-4 top-4 z-50 transition-all duration-300 sm:right-6 ${floating ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"}`}
      >
        <QuickExitButton className="shadow-xl" />
      </div>
      <header className="relative z-40 px-3 pt-3">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-primary/70 bg-background/85 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3 px-5 py-3 sm:px-7 sm:py-4">
            <Link to="/" aria-label="Wellness Portal home">
              <Logo />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <LangToggle />
              <button
                aria-label={t("menu")}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                className="grid h-10 w-10 place-items-center rounded-full border bg-card lg:hidden"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <QuickExitButton />
            </div>
          </div>
          <nav
            aria-label="Portal areas"
            className={`${open ? "block" : "hidden"} border-t border-primary/30 lg:block`}
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 lg:flex-row lg:flex-wrap lg:gap-1">
              {navItems.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    activeOptions={{ exact: n.to === "/" }}
                    onClick={() => setOpen(false)}
                    className="block rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                  >
                    {t(n.k)}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t pt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground lg:hidden">
                {tx("More tools")}
              </li>
              {moreItems.map((n) => (
                <li key={n.to} className="lg:hidden">
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                    activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                  >
                    {tx(n.label)}
                  </Link>
                </li>
              ))}
              <li className="sm:hidden pt-2">
                <LangToggle />
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">Army Pink Wellness Portal</p>
          <p className="mt-1">Clickable prototype for stakeholder review. Not a live service.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Label legend</p>
          <div className="flex flex-wrap gap-2">
            <StatusTag status="confirmed" />
            <StatusTag status="provisional" />
            <StatusTag status="placeholder" />
            <StatusTag status="approval" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/privacy" className="inline-flex items-center gap-2 font-semibold text-primary">
            <Shield className="h-4 w-4" /> {t("privacy")} information
          </Link>
          <p>No sign-up. No profiles. No trackers. Use Quick Exit or press Esc to leave.</p>
        </div>
      </div>
    </footer>
  );
}

const statusStyle: Record<Status, [string, string]> = {
  confirmed: ["Confirmed", "bg-teal/15 text-teal border-teal/40"],
  provisional: ["Provisional UX", "bg-lavender/15 text-lavender border-lavender/40"],
  placeholder: ["Placeholder content", "bg-coral/15 text-coral border-coral/50"],
  approval: ["Needs approval", "bg-primary/10 text-primary border-primary/40"],
};

export function StatusTag({ status, note }: { status: Status; note?: string }) {
  const [label, cls] = statusStyle[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold dark:brightness-125 ${cls}`}
      title={note}
    >
      {label}
      {note ? ` · ${note}` : ""}
    </span>
  );
}

export function TranslationNote() {
  const t = useT();
  const msg = t("translationPending");
  if (!msg) return null;
  return (
    <p className="mb-4 rounded-xl border border-dashed bg-muted px-4 py-2 text-sm text-muted-foreground">
      {msg}
    </p>
  );
}

export type Accent = "pink" | "teal" | "plum" | "coral" | "slate";
const accentStyle: Record<Accent, [string, string]> = {
  pink: ["text-primary", "from-primary/30"],
  teal: ["text-teal", "from-teal/35"],
  plum: ["text-plum", "from-plum/40"],
  coral: ["text-coral", "from-coral/35"],
  slate: ["text-slate", "from-slate/45"],
};

export function PageShell({
  title,
  intro,
  tags,
  back,
  accent = "pink",
  center = false,
  children,
}: {
  center?: boolean;
  title: string;
  intro?: string;
  tags?: ReactNode;
  back?: { to: string; label: string };
  accent?: Accent;
  children: ReactNode;
}) {
  const tx = useTx();
  const [titleCls, glow] = accentStyle[accent];
  return (
    <main className="relative mx-auto max-w-6xl px-4 pt-8">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 -top-32 -z-10 h-96 bg-gradient-to-b ${glow} to-transparent blur-2xl`}
      />
      {back && (
        <Link
          to={back.to}
          className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {tx(back.label)}
        </Link>
      )}
      <TranslationNote />
      {tags && (
        <div className={`mb-3 flex flex-wrap gap-2 ${center ? "justify-center" : ""}`}>{tags}</div>
      )}
      <h1
        className={`font-display text-3xl sm:text-5xl ${titleCls} ${center ? "text-center" : ""}`}
      >
        {tx(title)}
      </h1>
      {intro && (
        <p
          className={`mt-3 max-w-2xl text-lg text-muted-foreground ${center ? "mx-auto text-center" : ""}`}
        >
          {tx(intro)}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </main>
  );
}
