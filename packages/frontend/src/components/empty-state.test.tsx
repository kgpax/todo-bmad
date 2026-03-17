import React from "react";
import { render, screen } from "@testing-library/react";
import { EmptyState, EMPTY_STATE_MESSAGES } from "./empty-state";

const TEST_MESSAGE = EMPTY_STATE_MESSAGES[0];

describe("EmptyState", () => {
  it("renders without crashing", () => {
    render(<EmptyState message={TEST_MESSAGE} />);
  });

  it("has role='status' attribute", () => {
    render(<EmptyState message={TEST_MESSAGE} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays the provided message text", () => {
    render(<EmptyState message={TEST_MESSAGE} />);
    expect(screen.getByRole("status")).toHaveTextContent(TEST_MESSAGE);
  });

  it("renders a card with expected structure", () => {
    render(<EmptyState message={TEST_MESSAGE} />);
    const card = screen.getByRole("status");
    expect(card.tagName).toBe("DIV");
    const paragraph = card.querySelector("p");
    expect(paragraph).not.toBeNull();
  });
});
