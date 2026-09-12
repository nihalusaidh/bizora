export default function AppLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg shimmer-loading" />
        <div className="h-4 w-72 rounded-lg shimmer-loading" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 space-y-3"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded shimmer-loading" />
              <div className="h-8 w-8 rounded-lg shimmer-loading" />
            </div>
            <div className="h-7 w-32 rounded shimmer-loading" />
            <div className="h-3 w-20 rounded shimmer-loading" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 space-y-3"
            style={{ animationDelay: `${200 + i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg shimmer-loading" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded shimmer-loading" />
                <div className="h-3 w-20 rounded shimmer-loading" />
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded shimmer-loading" />
              <div className="h-3 w-3/4 rounded shimmer-loading" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
