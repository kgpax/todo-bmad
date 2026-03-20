const SKELETON_ROWS = [
  { width: "70%" },
  { width: "55%" },
  { width: "80%" },
  { width: "60%" },
] as const;

export function SkeletonLoader() {
  return (
    <ul role="list" aria-busy="true" aria-label="Loading todos" className="flex flex-col gap-3">
      {SKELETON_ROWS.map((row, i) => (
        <li
          key={i}
          role="listitem"
          className="bg-surface rounded-xl p-4 [box-shadow:var(--shadow-resting)] flex items-center gap-3"
        >
          <div
            data-skeleton-part="checkbox"
            className="skeleton-pulse w-5 h-5 rounded-[var(--radius-checkbox)] bg-text-placeholder shrink-0"
          />
          <div className="flex flex-col flex-1 gap-1.5">
            <div
              data-skeleton-part="text"
              className="skeleton-pulse h-4 rounded-md bg-text-placeholder"
              style={{ maxWidth: row.width }}
            />
            <div className="skeleton-pulse h-3 w-16 rounded-md bg-text-placeholder" />
          </div>
        </li>
      ))}
    </ul>
  );
}
