import React from "react";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

const EXPECTED_MESSAGES = [
  "Your list is empty. That's either very zen, or you haven't started yet.",
  "Nothing here yet. The input above is waiting.",
  "A blank slate — the best kind.",
  "All clear. Time to think of something new.",
  "No todos? Sounds peaceful.",
];

describe("EmptyState", () => {
  it("renders without crashing", () => {
    render(<EmptyState />);
  });

  it("has role='status' attribute", () => {
    render(<EmptyState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays text content from the copy bank", () => {
    render(<EmptyState />);
    const element = screen.getByRole("status");
    const text = element.textContent ?? "";
    expect(EXPECTED_MESSAGES.some((msg) => text.includes(msg))).toBe(true);
  });

  it("renders a card with expected structure", () => {
    render(<EmptyState />);
    const card = screen.getByRole("status");
    expect(card.tagName).toBe("DIV");
    const paragraph = card.querySelector("p");
    expect(paragraph).not.toBeNull();
  });
});
