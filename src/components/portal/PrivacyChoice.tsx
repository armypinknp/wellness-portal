import { useState } from "react";
import { HardDrive, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useTx } from "@/lib/prefs";
import { PRIVACY_WARNING } from "@/lib/privacy-copy";
import { useSaving } from "./SavingProvider";

export function PrivacyWarning() {
  // Safety guidance stays English until approved translation is supplied.
  return <p className="text-sm leading-relaxed text-muted-foreground">{PRIVACY_WARNING}</p>;
}

export function PrivacyChoice({ onChoice }: { onChoice?: () => void }) {
  const tx = useTx();
  const { choose, remove, error, items, preference } = useSaving();
  const [busy, setBusy] = useState(false);
  // D5: turning saving off with items present asks whether to keep or delete them.
  const [askExisting, setAskExisting] = useState<"ask" | "confirm-delete" | null>(null);
  const select = async (value: "device" | "none") => {
    if (value === "none" && preference === "device" && items.length > 0) {
      setAskExisting("ask");
      return;
    }
    setBusy(true);
    if (await choose(value)) onChoice?.();
    setBusy(false);
  };
  const continueWithoutSaving = async (deleteExisting: boolean) => {
    setBusy(true);
    try {
      if (deleteExisting) await remove(null, true);
      if (await choose("none")) {
        setAskExisting(null);
        onChoice?.();
      }
    } catch {
      // Provider shows a content-free error; keep the dialog open to retry.
    } finally {
      setBusy(false);
    }
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
      <AlertDialog
        open={askExisting !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setAskExisting(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-lg sm:max-w-lg">
          {/* Copy pending founder approval (ADR 0001, D5). */}
          {askExisting === "confirm-delete" ? (
            <>
              <AlertDialogTitle>{tx("Permanently delete all saved items?")}</AlertDialogTitle>
              <AlertDialogDescription>
                {tx("This cannot be undone. Downloaded or shared copies are not removed.")}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <Button
                  variant="outline"
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => setAskExisting("ask")}
                >
                  {tx("Cancel")}
                </Button>
                <Button
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => void continueWithoutSaving(true)}
                >
                  {tx(busy ? "Deleting…" : "Delete permanently")}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogTitle>{tx("What should happen to your saved items?")}</AlertDialogTitle>
              <AlertDialogDescription>
                {tx(
                  "New items will not be saved. Items you already saved stay in this browser on this device until you delete them.",
                )}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy} className="rounded-full">
                  {tx("Cancel")}
                </AlertDialogCancel>
                <Button
                  variant="outline"
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => setAskExisting("confirm-delete")}
                >
                  {tx("Delete them now")}
                </Button>
                <Button
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => void continueWithoutSaving(false)}
                >
                  {tx("Keep my saved items")}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
