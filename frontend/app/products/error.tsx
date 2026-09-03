"use client";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
          Something went wrong
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          We couldn't load the products.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-neutral-600">
          Please try again. If the problem continues, the store may be
          temporarily unavailable.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}