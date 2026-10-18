import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, PlayCircle, Sparkles } from "lucide-react";
import { LogoMark, Wordmark } from "./Logo";
import handshake from "@/assets/intro-handshake.png";
import { LangToggle, QuickExitButton } from "./Shell";
import { StatusTag } from "./Shell";
import { PrivacyChoice } from "./PrivacyChoice";
import { useSaving } from "./SavingProvider";
import { useT, useTx } from "@/lib/prefs";

// Feelings stay in memory; only the explicit saving preference is retained.
const feelings = [
  { label: "I feel overwhelmed", to: "/calm-room" },
  { label: "I need to think something through", to: "/decision-support" },
  { label: "I'm not sure yet", to: "/" },
  { label: "I just want to look around", to: "/" },
];

const TOTAL = 6; // progress segments for steps 1–6; step 7 is the video placeholder

export function Intro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(-1); // -1 = splash
  const [dest, setDest] = useState<string | undefined>();
  const { preference } = useSaving();
  const t = useT();
  const tx = useTx();
  const nav = useNavigate();
  const next = () => setI(i + 1);
  const finish = (to?: string) => {
    if (preference === null) {
      setI(4);
      return;
    }
    onDone();
    if (to && to !== "/") nav({ to });
  };

  const pill = "min-h-12 rounded-full px-8 font-semibold shadow-lg";
  const primary = `${pill} bg-primary text-primary-foreground hover:opacity-90`;
  const choice =
    "min-h-12 w-full rounded-2xl bg-card/70 px-6 text-sm font-semibold text-foreground backdrop-blur hover:bg-card";
  const skip = (
    <button
      onClick={() => finish()}
      className="mt-4 min-h-11 px-4 text-sm font-semibold text-foreground/80 hover:underline"
    >
      {t("skip")}
    </button>
  );

  const Art = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-float mb-8 grid h-36 place-items-center">{children}</div>
  );

  let body: React.ReactNode;
  if (i === -1)
    body = (
      <>
        <LogoMark className="animate-float h-28 w-40 sm:h-36 sm:w-52" />
        <Wordmark className="mt-14 h-14 sm:h-20" />
        <p className="mt-3 text-sm font-semibold">Powered by Army Pink</p>
        <button
          onClick={next}
          className={`mt-14 min-h-14 rounded-full bg-primary/80 px-10 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary`}
        >
          {tx("Get Started")}
        </button>
        <button
          onClick={() => finish()}
          className="mt-4 min-h-11 px-4 text-sm font-semibold text-foreground/80 hover:underline"
        >
          {t("skip")}
        </button>
      </>
    );
  else if (i === 0)
    body = (
      <>
        <Art>
          <img
            src={handshake}
            alt=""
            width={816}
            height={816}
            className="h-36 w-36 object-contain"
          />
        </Art>
        <h1 className="text-3xl font-bold sm:text-4xl">{tx("You have found a safe space.")}</h1>
        <p className="mt-3 text-primary">
          {tx("Take a breath.")}
          <br />
          {tx("There's no rush here.")}
        </p>
        <button onClick={next} className={`mt-10 ${primary}`}>
          {t("begin")}
        </button>
        {skip}
      </>
    );
  else if (i === 1)
    body = (
      <>
        <Art>
          <span className="rounded-full bg-lavender px-8 py-3 text-2xl font-semibold text-tile-foreground ring-4 ring-primary">
            {t("quickExit")}
          </span>
        </Art>
        <h1 className="text-3xl font-bold sm:text-4xl">{tx("This keeps you safe.")}</h1>
        <p className="mt-3 text-primary">
          {tx(
            'Tap "Quick exit" (top corner) anytime to leave instantly for a neutral page. When you aren\'t typing, you can also press the Esc key.',
          )}
        </p>
        <button onClick={next} className={`mt-10 ${primary}`}>
          {t("gotIt")}
        </button>
        {skip}
      </>
    );
  else if (i === 2)
    body = (
      <>
        <Art>
          <span className="relative block h-28 w-48" aria-hidden>
            <span className="absolute left-2 top-6 h-10 w-10 rounded-full bg-primary" />
            <span className="absolute left-8 top-4 h-12 w-12 rotate-12 rounded-xl bg-plum/90" />
            <span className="absolute left-12 top-16 h-10 w-10 rounded-full bg-teal" />
            <span className="absolute left-20 top-6 h-14 w-16 -rotate-12 rounded-2xl bg-primary/90" />
            <span className="absolute right-2 top-8 h-9 w-9 rounded-full bg-primary" />
            <span className="absolute right-10 top-0 h-4 w-4 rounded-full bg-coral" />
          </span>
        </Art>
        <h1 className="text-3xl font-bold sm:text-4xl">{tx("There's no wrong way to be here.")}</h1>
        <p className="mt-3 text-primary">{tx("Go as slow as you need. You can skip anything.")}</p>
        <button onClick={next} className={`mt-10 ${primary}`}>
          {t("okay")}
        </button>
        {skip}
      </>
    );
  else if (i === 3)
    body = (
      <>
        <Art>
          <span className="flex" aria-hidden>
            <Heart className="h-24 w-24 fill-coral text-coral" />
            <Heart className="-ml-10 mt-6 h-16 w-16 fill-coral/80 text-coral" />
          </span>
        </Art>
        <h1 className="text-3xl font-bold sm:text-4xl">{tx("How are you feeling right now?")}</h1>
        <p className="mt-3 text-primary">
          {tx("Choose what feels true — there are no wrong answers.")}
        </p>
        <div className="mt-8 grid w-full gap-3">
          {feelings.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setDest(f.to);
                next();
              }}
              className={choice}
            >
              {tx(f.label)}
            </button>
          ))}
        </div>
        <button
          onClick={next}
          className="mt-4 min-h-11 px-4 text-sm font-semibold text-foreground/80 hover:underline"
        >
          {t("skip")}
        </button>
      </>
    );
  else if (i === 4) body = <PrivacyChoice onChoice={next} />;
  else if (i === 5)
    body = (
      <>
        <Art>
          <Sparkles className="h-20 w-20 text-primary" />
        </Art>
        <h1 className="text-3xl font-bold sm:text-4xl">{tx("You're all set.")}</h1>
        <p className="mt-3 text-primary">{tx("However you arrived today, you're welcome here.")}</p>
        <button onClick={() => finish(dest)} className={`mt-10 w-full ${primary}`}>
          {tx("Enter the portal")}
        </button>
        <button
          onClick={next}
          className="mt-4 min-h-11 px-4 text-sm font-semibold text-foreground hover:underline"
        >
          {tx("Watch the introduction video")}
        </button>
      </>
    );
  else
    body = (
      <>
        <div className="relative grid aspect-video w-full place-items-center rounded-3xl border bg-background text-foreground shadow-2xl">
          <PlayCircle className="h-14 w-14 opacity-70" aria-hidden />
          <p className="absolute bottom-3 text-xs">
            {tx("Sometimes, life can feel overwhelming.")}
          </p>
        </div>
        <div className="mt-3">
          <StatusTag status="placeholder" note="introduction video" />
        </div>
        <button
          onClick={() => finish(dest)}
          className={`${pill} mt-10 w-full bg-card/70 text-foreground backdrop-blur hover:bg-card`}
        >
          {tx("Back to the portal")}
        </button>
      </>
    );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-gradient-to-b from-plum/50 to-transparent"
      />
      <div className="relative mx-auto max-w-md px-6 pb-12 sm:max-w-3xl">
        <div className="flex items-center justify-between gap-2 py-4">
          {i >= 0 ? <LogoMark className="h-8 w-10" /> : <span />}
          <div className="flex items-center gap-2">
            <LangToggle />
            <QuickExitButton />
          </div>
        </div>
        {i >= 0 && i < TOTAL && (
          <div className="grid grid-cols-6 gap-1.5" aria-label={`Step ${i + 1} of ${TOTAL + 1}`}>
            {Array.from({ length: TOTAL }).map((_, d) => (
              <span
                key={d}
                className={`h-1 rounded-full ${d <= i ? "bg-primary" : "bg-foreground/15"}`}
              />
            ))}
          </div>
        )}
        <div className="mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center text-center sm:min-h-[60vh]">
          {body}
        </div>
      </div>
    </div>
  );
}
