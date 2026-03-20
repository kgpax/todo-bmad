import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorCallout } from "./error-callout";

const CREATE_COPY = [
  "That one didn't stick. Give it another go?",
  "Couldn't save that one. Try again?",
  "Something got in the way. One more shot?",
];

const TOGGLE_COPY = [
  "Hmm, couldn't update that one. Try again?",
  "That change didn't take. Give it another tap?",
  "Couldn't flip that one. Try once more?",
];

const DELETE_COPY = [
  "Wouldn't let go of that one. One more try?",
  "That one's holding on. Try again?",
  "Couldn't remove that one. Give it another go?",
];

describe("ErrorCallout", () => {
  it("renders create error copy when type='create'", () => {
    render(<ErrorCallout type="create" id="test-callout" />);
    const text = screen.getByRole("alert").textContent ?? "";
    expect(CREATE_COPY.some((c) => text.includes(c))).toBe(true);
  });

  it("renders toggle error copy when type='toggle'", () => {
    render(<ErrorCallout type="toggle" id="test-callout" />);
    const text = screen.getByRole("alert").textContent ?? "";
    expect(TOGGLE_COPY.some((c) => text.includes(c))).toBe(true);
  });

  it("renders delete error copy when type='delete'", () => {
    render(<ErrorCallout type="delete" id="test-callout" />);
    const text = screen.getByRole("alert").textContent ?? "";
    expect(DELETE_COPY.some((c) => text.includes(c))).toBe(true);
  });

  it("renders message override when provided instead of copy bank", () => {
    render(<ErrorCallout type="create" id="test-callout" message="Custom error message" />);
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("has role='alert' attribute", () => {
    render(<ErrorCallout type="create" id="test-callout" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has the id attribute for aria-describedby linking", () => {
    render(<ErrorCallout type="create" id="error-callout-create" />);
    expect(screen.getByRole("alert")).toHaveAttribute("id", "error-callout-create");
  });

  it("renders restore button when onRestore prop provided", () => {
    render(<ErrorCallout type="create" id="test-callout" onRestore={jest.fn()} />);
    expect(screen.getByRole("button", { name: /restore/i })).toBeInTheDocument();
  });

  it("calls onRestore callback when restore button is clicked", () => {
    const onRestore = jest.fn();
    render(<ErrorCallout type="create" id="test-callout" onRestore={onRestore} />);
    fireEvent.click(screen.getByRole("button", { name: /restore/i }));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it("does not render restore button when onRestore not provided", () => {
    render(<ErrorCallout type="create" id="test-callout" />);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
  });
});
