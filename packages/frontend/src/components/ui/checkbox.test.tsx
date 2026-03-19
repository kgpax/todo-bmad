import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

const noop = () => {};

describe("Checkbox", () => {
  it("renders a checkbox role element", () => {
    render(<Checkbox checked={false} onCheckedChange={noop} aria-label="Test checkbox" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("is not checked when checked=false", () => {
    render(<Checkbox checked={false} onCheckedChange={noop} aria-label="Test checkbox" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("is checked when checked=true", () => {
    render(<Checkbox checked={true} onCheckedChange={noop} aria-label="Test checkbox" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("has the provided aria-label", () => {
    render(<Checkbox checked={false} onCheckedChange={noop} aria-label="Mark task as complete" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-label", "Mark task as complete");
  });

  it("calls onCheckedChange with true when unchecked checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={false} onCheckedChange={onChange} aria-label="Test" />);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onCheckedChange with false when checked checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={true} onCheckedChange={onChange} aria-label="Test" />);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("is disabled when pending=true", () => {
    render(<Checkbox checked={false} onCheckedChange={noop} aria-label="Test" pending={true} />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("is not disabled when pending is not set", () => {
    render(<Checkbox checked={false} onCheckedChange={noop} aria-label="Test" />);
    expect(screen.getByRole("checkbox")).not.toBeDisabled();
  });

  it("does not call onCheckedChange when disabled (pending=true)", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={false} onCheckedChange={onChange} aria-label="Test" pending={true} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders check indicator when checked", () => {
    const { container } = render(
      <Checkbox checked={true} onCheckedChange={noop} aria-label="Test" />
    );
    const indicator = container.querySelector('[data-state="checked"]');
    expect(indicator).toBeInTheDocument();
  });

  it("aria-checked reflects checked state", () => {
    render(<Checkbox checked={true} onCheckedChange={noop} aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });
});
