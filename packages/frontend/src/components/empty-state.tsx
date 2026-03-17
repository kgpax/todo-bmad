export const EMPTY_STATE_MESSAGES = [
  "Your list is empty. That's either very zen, or you haven't started yet.",
  "Nothing here yet. The input above is waiting.",
  "A blank slate — the best kind.",
  "All clear. Time to think of something new.",
  "No todos? Sounds peaceful.",
];

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="bg-surface rounded-xl p-6 text-center"
      style={{ boxShadow: "var(--shadow-resting)" }}
    >
      <p className="text-text-secondary">{message}</p>
    </div>
  );
}
