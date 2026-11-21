export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10" aria-busy="true">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    </main>
  );
}
