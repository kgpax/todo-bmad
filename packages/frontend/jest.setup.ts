import "@testing-library/jest-dom";

jest.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [jest.fn()],
}));

// jsdom does not implement matchMedia — polyfill it so application code
// (e.g. isDesktopDevice) can call window.matchMedia without throwing.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
