export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-8"
      style={{
        paddingTop: "max(24px, var(--safe-area-top))",
        paddingBottom: "max(24px, var(--safe-area-bottom))",
      }}
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
