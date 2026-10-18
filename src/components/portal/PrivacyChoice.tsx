import { useState } from "react";
import { HardDrive, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/prefs";
import { PRIVACY_WARNING } from "@/lib/saved-items";
import { useSaving } from "./SavingProvider";

export function PrivacyWarning() {
  // Safety guidance stays English until approved translation is supplied.
  return <p className="text-sm leading-relaxed text-muted-foreground">{PRIVACY_WARNING}</p>;
}

export function PrivacyChoice({ onChoice }: { onChoice?: () => void }) {
  const tx = useTx();
  const { choose, error } = useSaving();
  const [busy, setBusy] = useState(false);
  const select = async (value: "device" | "none") => {
    setBusy(true);
    if (await choose(value)) onChoice?.();
    setBusy(false);
  };
  return (
    <div className="w-full space-y-5">
      <h2 className="text-2xl font-bold sm:text-3xl">{tx("YOUR PRIVACY, YOUR CHOICE")}</h2>
      <p className="text-base text-muted-foreground">
        {tx(
          "Explore the entire Wellness Portal without creating an account or providing your name or email.",
        )}
      </p>
      <div className="grid gap-4">
        <div>
          <Button
            disabled={busy}
            onClick={() => select("device")}
            className="min-h-12 h-auto w-full whitespace-normal rounded-full px-6 py-3"
          >
            <HardDrive />
            {tx("Save on This Device")}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            {tx(
              "Keep only reflections, artwork and completed exercises you explicitly choose to save, in this browser on this device. No account or email required.",
            )}
          </p>
        </div>
        <div>
          <Button
            disabled={busy}
            variant="secondary"
            onClick={() => select("none")}
            className="min-h-12 h-auto w-full whitespace-normal rounded-full px-6 py-3"
          >
            <ArrowRight />
            {tx("Continue Without Saving")}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            {tx(
              "Explore every room and activity without saving your personal content. Nothing is saved automatically.",
            )}
          </p>
        </div>
      </div>
      <PrivacyWarning />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {tx(error)}
        </p>
      )}
    </div>
  );
}
