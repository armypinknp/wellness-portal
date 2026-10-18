import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrivacyChoice } from "@/components/portal/PrivacyChoice";
import { SavingProvider, useSaving } from "@/components/portal/SavingProvider";
import { createSavedItemsRepository, type SavedItemsRepository } from "@/lib/storage/repository";

let repo: SavedItemsRepository;
beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  repo = createSavedItemsRepository();
});

function Count() {
  const { items, preference } = useSaving();
  return (
    <p data-testid="state">
      {preference ?? "unset"}:{items.length}
    </p>
  );
}

function renderChoice() {
  render(
    <SavingProvider repository={repo}>
      <PrivacyChoice />
      <Count />
    </SavingProvider>,
  );
}

async function seedSavedItem() {
  await repo.setPreference("device");
  await repo.saveItem({
    kind: "reflection",
    roomId: "journals",
    activityId: "a",
    room: "Healing Journals",
    activity: "A",
    source: "/journals",
    payload: { text: "private" },
  });
}

describe("YOUR PRIVACY, YOUR CHOICE", () => {
  it("offers exactly the two choices and no Skip", () => {
    renderChoice();
    expect(screen.getByRole("heading", { name: "YOUR PRIVACY, YOUR CHOICE" })).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Save on This Device",
      "Continue Without Saving",
    ]);
    expect(screen.getByText(/stay in this browser on this device/)).toBeInTheDocument();
  });

  it("records Save on This Device", async () => {
    renderChoice();
    fireEvent.click(screen.getByText("Save on This Device"));
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("device:0"));
    expect(await repo.getPreference()).toBe("device");
  });

  it("D5: keeping saved items when turning saving off", async () => {
    await seedSavedItem();
    renderChoice();
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("device:1"));
    fireEvent.click(screen.getByText("Continue Without Saving"));
    fireEvent.click(await screen.findByText("Keep my saved items"));
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("none:1"));
    expect(await repo.getSavedItems()).toHaveLength(1);
  });

  it("D5: deleting saved items requires a second confirmation", async () => {
    await seedSavedItem();
    renderChoice();
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("device:1"));
    fireEvent.click(screen.getByText("Continue Without Saving"));
    fireEvent.click(await screen.findByText("Delete them now"));
    expect(await repo.getSavedItems()).toHaveLength(1); // nothing deleted yet
    fireEvent.click(await screen.findByText("Delete permanently"));
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("none:0"));
    expect(await repo.getSavedItems()).toHaveLength(0);
  });
});
