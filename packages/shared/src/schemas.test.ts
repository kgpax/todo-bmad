import { createTodoSchema, updateTodoSchema, todoSchema } from "./schemas";

describe("createTodoSchema", () => {
  it("fails on empty string", () => {
    const result = createTodoSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("fails on whitespace-only string", () => {
    const result = createTodoSchema.safeParse({ text: "   " });
    expect(result.success).toBe(false);
  });

  it("fails on string exceeding 128 characters", () => {
    const result = createTodoSchema.safeParse({ text: "a".repeat(129) });
    expect(result.success).toBe(false);
  });

  it("succeeds with valid 1-character string", () => {
    const result = createTodoSchema.safeParse({ text: "a" });
    expect(result.success).toBe(true);
  });

  it("succeeds with valid 128-character string", () => {
    const result = createTodoSchema.safeParse({ text: "a".repeat(128) });
    expect(result.success).toBe(true);
  });

  it("trims leading and trailing whitespace on success", () => {
    const result = createTodoSchema.safeParse({ text: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("hello");
    }
  });

  it("passes HTML content through without sanitization", () => {
    const result = createTodoSchema.safeParse({ text: "<script>alert('xss')</script>" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("<script>alert('xss')</script>");
    }
  });
});

describe("updateTodoSchema", () => {
  it("succeeds with completed=true", () => {
    const result = updateTodoSchema.safeParse({ completed: true });
    expect(result.success).toBe(true);
  });

  it("succeeds with completed=false", () => {
    const result = updateTodoSchema.safeParse({ completed: false });
    expect(result.success).toBe(true);
  });

  it("fails when completed is a string", () => {
    const result = updateTodoSchema.safeParse({ completed: "true" });
    expect(result.success).toBe(false);
  });

  it("fails when completed is a number", () => {
    const result = updateTodoSchema.safeParse({ completed: 1 });
    expect(result.success).toBe(false);
  });

  it("fails when completed is missing", () => {
    const result = updateTodoSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("todoSchema", () => {
  const validTodo = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    text: "Buy groceries",
    completed: false,
    createdAt: "2026-03-17T12:00:00.000Z",
  };

  it("validates a complete Todo shape", () => {
    const result = todoSchema.safeParse(validTodo);
    expect(result.success).toBe(true);
  });

  it("fails with invalid UUID", () => {
    const result = todoSchema.safeParse({ ...validTodo, id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("fails with non-boolean completed", () => {
    const result = todoSchema.safeParse({ ...validTodo, completed: "false" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid datetime createdAt", () => {
    const result = todoSchema.safeParse({ ...validTodo, createdAt: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("fails when text is missing", () => {
    const { text: _text, ...rest } = validTodo;
    const result = todoSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
