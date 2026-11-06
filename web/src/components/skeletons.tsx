export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Memuat">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="h-4 w-80 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
