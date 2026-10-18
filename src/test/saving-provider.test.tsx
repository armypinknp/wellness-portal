import "fake-indexeddb/auto";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SavingProvider, useSaving } from "@/components/portal/SavingProvider";

function ChoiceProbe() {
  const saving = useSaving();
  return (
    <>
      <p role="status">{saving.preference ?? "not chosen"}</p>
      <p>{saving.error}</p>
      <button onClick={() => void saving.choose("device")}>Device</button>
      <button onClick={() => void saving.choose("none")}>No saving</button>
    </>
  );
}

describe("Saving context recovery", () => {
  it("allows exploration without a provider but refuses enabling saving", async () => {
    render(<ChoiceProbe />);
    expect(screen.getByRole("status").textContent).toBe("not chosen");
    fireEvent.click(screen.getByText("Device"));
    expect(screen.getByRole("status").textContent).toBe("not chosen");
    fireEvent.click(screen.getByText("No saving"));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("none"));
  });
  it("uses real device preferences when the provider is mounted", async () => {
    render(
      <SavingProvider>
        <ChoiceProbe />
      </SavingProvider>,
    );
    fireEvent.click(screen.getByText("Device"));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("device"));
  });
});
