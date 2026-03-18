import { cn, pickRandom, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "nope", "end")).toBe("base end");
  });
});

describe("pickRandom", () => {
  it("returns an item from the array", () => {
    const items = ["a", "b", "c"] as const;
    expect(items).toContain(pickRandom(items));
  });

  it("throws when called with an empty array", () => {
    expect(() => pickRandom([])).toThrow("pickRandom called with empty array");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for times under 60 seconds ago", () => {
    const date = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns 'Xm ago' for times 1–59 minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns 'Xh ago' for times 1–23 hours ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns 'Xd ago' for times 1–6 days ago", () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("3d ago");
  });

  it("returns a formatted date string for times 7 or more days ago", () => {
    const date = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toMatch(/^[A-Z][a-z]+ \d+$/);
  });
});
