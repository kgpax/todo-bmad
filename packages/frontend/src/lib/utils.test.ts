import { isDesktopDevice, pickRandom, formatTimestamp } from "./utils";

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
});
