import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TodoInput } from "./todo-input";

// Utility: override the global matchMedia mock for one test
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

describe("TodoInput", () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    placeholderContext: "empty" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: mobile viewport (no auto-focus)
    setMatchMedia(false);
  });

  it("renders as a card container", () => {
    const { container } = render(<TodoInput {...defaultProps} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-surface", "rounded-xl");
  });

  it("renders an input with a placeholder", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    expect(input).toBeInTheDocument();
  });

  it("shows placeholder text from the empty bank after hydration", async () => {
    render(<TodoInput {...defaultProps} placeholderContext="empty" />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    await Promise.resolve();
    const placeholder = input.getAttribute("placeholder") || "";
    const emptyBankValues = [
      "What's first...?",
      "Something on your mind?",
      "Start with one thing...",
      "What needs doing?",
      "Begin anywhere...",
    ];
    expect(emptyBankValues).toContain(placeholder);
  });

  it("calls onSubmit and clears input when Enter is pressed with non-empty text", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(defaultProps.onSubmit).toHaveBeenCalledWith("Buy milk");
    expect(input).toHaveValue("");
  });

  it("does not call onSubmit when Enter is pressed with empty text", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit when Enter is pressed with whitespace-only text", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("clears text and blurs input on Escape", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "some text" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
  });

  it("shows a submit button when text is non-empty", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Buy milk" } });
    expect(screen.getByRole("button", { name: /add todo/i })).toBeInTheDocument();
  });

  it("does not show a submit button when text is empty", () => {
    render(<TodoInput {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /add todo/i })).not.toBeInTheDocument();
  });

  it("calls onSubmit when submit button is clicked", () => {
    render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(screen.getByRole("button", { name: /add todo/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith("Buy milk");
  });

  it("applies focus ring style on focus", () => {
    const { container } = render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    const card = container.firstChild as HTMLElement;
    fireEvent.focus(input);
    expect(card.style.boxShadow).toContain("var(--color-accent)");
  });

  it("restores resting shadow on blur", () => {
    const { container } = render(<TodoInput {...defaultProps} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    const card = container.firstChild as HTMLElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(card.style.boxShadow).toBe("var(--shadow-resting)");
  });

  describe("auto-focus on mount", () => {
    it("focuses the input on mount when on desktop (matchMedia matches)", () => {
      setMatchMedia(true);
      render(<TodoInput {...defaultProps} />);
      expect(screen.getByRole("textbox", { name: /new todo/i })).toHaveFocus();
    });

    it("does not focus the input on mount when on mobile (matchMedia does not match)", () => {
      setMatchMedia(false);
      render(<TodoInput {...defaultProps} />);
      expect(screen.getByRole("textbox", { name: /new todo/i })).not.toHaveFocus();
    });
  });

  describe("focus management around submission", () => {
    it("clears the focus ring when disabled becomes true (create in-flight)", () => {
      const { container, rerender } = render(<TodoInput {...defaultProps} disabled={false} />);
      const input = screen.getByRole("textbox", { name: /new todo/i });
      const card = container.firstChild as HTMLElement;

      fireEvent.focus(input);
      expect(card.style.boxShadow).toContain("var(--color-accent)");

      rerender(<TodoInput {...defaultProps} disabled={true} />);
      expect(card.style.boxShadow).toBe("var(--shadow-resting)");
    });

    it("refocuses the input when disabled transitions from true to false (create complete)", () => {
      const { rerender } = render(<TodoInput {...defaultProps} disabled={false} />);
      const input = screen.getByRole("textbox", { name: /new todo/i });

      rerender(<TodoInput {...defaultProps} disabled={true} />);
      expect(input).not.toHaveFocus();

      rerender(<TodoInput {...defaultProps} disabled={false} />);
      expect(input).toHaveFocus();
    });

    it("does not auto-focus on initial mount when disabled starts as false (no prior disabled state)", () => {
      // wasDisabledRef starts false, so the else-if branch does not fire on mount
      setMatchMedia(false);
      render(<TodoInput {...defaultProps} disabled={false} />);
      expect(screen.getByRole("textbox", { name: /new todo/i })).not.toHaveFocus();
    });
  });
});
