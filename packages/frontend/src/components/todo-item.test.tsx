import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoItem } from "./todo-item";
import type { Todo } from "@todo-bmad/shared";

const mockTodo: Todo = {
  id: "test-id-1",
  text: "Buy groceries",
  completed: false,
  createdAt: new Date().toISOString(),
};

describe("TodoItem", () => {
  it("displays the todo text", () => {
    render(<TodoItem todo={mockTodo} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("displays a formatted timestamp in DD/MM/YYYY HH:mm format", () => {
    render(<TodoItem todo={mockTodo} />);
    expect(screen.getByText(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)).toBeInTheDocument();
  });
});
