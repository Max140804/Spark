export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6">{children}</div>
      <div className="hidden spark-gradient lg:block" />
    </div>
  );
}