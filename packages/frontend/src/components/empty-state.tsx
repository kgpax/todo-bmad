const EMPTY_STATE_MESSAGES = [
  "Your list is empty. That's either very zen, or you haven't started yet.",
  "Nothing here yet. The input above is waiting.",
  "A blank slate — the best kind.",
  "All clear. Time to think of something new.",
  "No todos? Sounds peaceful.",
];

export function EmptyState() {
  const message =
    EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)];

  return (
    <div
      role="status"
      className="bg-surface rounded-xl p-6 text-center"
      style={{ boxShadow: "var(--shadow-resting)" }}
    >
      {/* suppressHydrationWarning: Math.random() intentionally differs between SSR and client */}
      <p className="text-text-secondary" suppressHydrationWarning>
        {message}
      </p>
    </div>
  );
}
