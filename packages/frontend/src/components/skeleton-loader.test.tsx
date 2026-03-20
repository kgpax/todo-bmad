import React from "react";
import { render, screen } from "@testing-library/react";
import { SkeletonLoader } from "./skeleton-loader";

describe("SkeletonLoader", () => {
  it("renders 4 skeleton rows", () => {
    render(<SkeletonLoader />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(4);
  });

  it("each row has a checkbox placeholder and a text placeholder", () => {
    render(<SkeletonLoader />);
    const rows = screen.getAllByRole("listitem");
    rows.forEach((row) => {
      expect(row.querySelector('[data-skeleton-part="checkbox"]')).toBeInTheDocument();
      expect(row.querySelector('[data-skeleton-part="text"]')).toBeInTheDocument();
    });
  });

  it("container has aria-busy='true'", () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
  });

  it("container has aria-label='Loading todos'", () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole("list", { name: /loading todos/i })).toBeInTheDocument();
  });

  it("container has role='list'", () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("skeleton rows have role='listitem'", () => {
    render(<SkeletonLoader />);
    const rows = screen.getAllByRole("listitem");
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row).toHaveAttribute("role", "listitem");
    });
  });
});
