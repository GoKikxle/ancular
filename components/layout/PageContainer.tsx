import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
      {children}
    </div>
  );
}