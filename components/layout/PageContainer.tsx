import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}