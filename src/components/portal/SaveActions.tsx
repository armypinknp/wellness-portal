import { Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTx } from "@/lib/prefs";
import { Button } from "@/components/ui/button";
import { StorageError } from "@/lib/storage/errors";
import type { SaveInput } from "@/lib/storage/schema";
import { useSaving } from "./SavingProvider";
import { PrivacyChoice, PrivacyWarning } from "./PrivacyChoice";

/** The one save control every room uses. Saving only ever happens on click. */
export function SaveActions({
  item,
}: {
  item: SaveInput | (() => SaveInput | Promise<SaveInput>);
}) {
  const tx = useTx();
  const { ready, preference, save } = useSaving();
  const [busy, setBusy] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState("");
  const keep = async () => {
    if (preference !== "device") {
      setChoosing(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const content = typeof item === "function" ? await item() : item;
      await save(content);
      toast(tx("Saved to My Saved Items on this device."));
    } catch (e) {
      setError(
        tx(
          e instanceof StorageError && e.code === "invalid"
            ? e.message
            : "Could not save this item. Browser storage may be unavailable or full. Nothing new was saved.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={!ready || busy}
          onClick={keep}
          variant="secondary"
          className="h-auto min-h-11 whitespace-normal rounded-full px-5 py-3"
        >
          <Save />
          {tx(busy ? "Saving…" : "Save to my device")}
        </Button>
        <Button asChild variant="link" className="h-auto min-h-11 whitespace-normal">
          <Link to="/saved-items">{tx("My Saved Items")}</Link>
        </Button>
      </div>
      {choosing ? <PrivacyChoice onChoice={() => setChoosing(false)} /> : <PrivacyWarning />}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
