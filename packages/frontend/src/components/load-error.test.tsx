import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoadError, LOAD_ERROR_MESSAGES } from "./load-error";

describe("LoadError", () => {
  it("renders a friendly message from the copy bank", () => {
    render(<LoadError onRetry={jest.fn()} />);
    const messageTexts = LOAD_ERROR_MESSAGES as readonly string[];
    const displayed = screen.getByText((text) => messageTexts.includes(text));
    expect(displayed).toBeInTheDocument();
  });

  it("renders the retry button with visible text 'Try again'", () => {
    render(<LoadError onRetry={jest.fn()} />);
    expect(screen.getByRole("button", { name: /retry loading todos/i })).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("calls onRetry callback when retry button is clicked", () => {
    const onRetry = jest.fn();
    render(<LoadError onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /retry loading todos/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("container has role='alert'", () => {
    render(<LoadError onRetry={jest.fn()} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("sets data-alert-type='load'", () => {
    render(<LoadError onRetry={jest.fn()} />);
    expect(screen.getByRole("alert")).toHaveAttribute("data-alert-type", "load");
  });

  it("retry button has a descriptive aria-label", () => {
    render(<LoadError onRetry={jest.fn()} />);
    const button = screen.getByRole("button", { name: /retry loading todos/i });
    expect(button).toHaveAttribute("aria-label", "Retry loading todos");
  });
});
