import { afterEach, describe, expect, it } from "vitest";
import { shouldQuickExitOnKey } from "@/components/portal/Shell";

const esc = () => new KeyboardEvent("keydown", { key: "Escape", cancelable: true });

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Quick Exit Esc key (D4)", () => {
  it("exits on Esc from the page", () => {
    expect(shouldQuickExitOnKey(esc())).toBe(true);
  });
  it("ignores other keys", () => {
    expect(shouldQuickExitOnKey(new KeyboardEvent("keydown", { key: "Enter" }))).toBe(false);
  });
  it("lets Esc close an open dialog instead", () => {
    document.body.innerHTML = '<div role="alertdialog"></div>';
    expect(shouldQuickExitOnKey(esc())).toBe(false);
  });
  it.each(["<textarea></textarea>", '<input type="text">', "<canvas tabindex=0></canvas>"])(
    "does not exit while %s has focus",
    (html) => {
      document.body.innerHTML = html;
      (document.body.firstElementChild as HTMLElement).focus();
      expect(shouldQuickExitOnKey(esc())).toBe(false);
    },
  );
  it("still exits when a button has focus", () => {
    document.body.innerHTML = "<button>Next</button>";
    document.querySelector("button")!.focus();
    expect(shouldQuickExitOnKey(esc())).toBe(true);
  });
});
