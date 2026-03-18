import { cn, isDesktopDevice, pickRandom, formatTimestamp } from "./utils";

describe("cn", () => {
  it("merges multiple class names into a single string", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes (last one wins)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("ignores falsy values (false, null, undefined)", () => {
    expect(cn("foo", false && "bar", null, undefined, "baz")).toBe("foo baz");
  });
});

describe("isDesktopDevice", () => {
  const originalMatchMedia = window.matchMedia;

  function setMatchMedia(matches: boolean) {
    window.matchMedia = jest.fn().mockReturnValue({
      matches,
      media: "",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
  }

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns true when primary input is mouse/trackpad", () => {
    setMatchMedia(true);
    expect(isDesktopDevice()).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(hover: hover) and (pointer: fine)"
    );
  });

  it("returns false when primary input is touch", () => {
    setMatchMedia(false);
    expect(isDesktopDevice()).toBe(false);
  });
});

describe("pickRandom", () => {
  it("returns an element from the array", () => {
    const items = ["a", "b", "c"];
    expect(items).toContain(pickRandom(items));
  });

  it("throws when given an empty array", () => {
    expect(() => pickRandom([])).toThrow("pickRandom called with empty array");
  });
});

describe("formatTimestamp", () => {
  it("formats an ISO date string as DD/MM/YYYY HH:mm", () => {
    const result = formatTimestamp("2026-03-18T14:05:00.000Z");
    expect(result).toMatch(/^\d{2}\/\d{2}\/2026 \d{2}:\d{2}$/);
  });

  it("zero-pads single-digit day, month, hour and minute values", () => {
    const input = "2026-01-05T07:03:00.000Z";
    const d = new Date(input);
    const expected = [
      String(d.getDate()).padStart(2, "0"),
      String(d.getMonth() + 1).padStart(2, "0"),
      d.getFullYear(),
    ].join("/") + " " + [
      String(d.getHours()).padStart(2, "0"),
      String(d.getMinutes()).padStart(2, "0"),
    ].join(":");
    expect(formatTimestamp(input)).toBe(expected);
  });

  it("output always matches DD/MM/YYYY HH:mm pattern", () => {
    expect(formatTimestamp("2026-12-31T23:59:00.000Z")).toMatch(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/
    );
  });
});
