export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold text-spark-indigo-900">
          You&apos;re offline
        </h1>
        <p className="mt-2 text-spark-indigo-700">
          Reconnect to continue your spark.
        </p>
      </div>
    </main>
  );
}