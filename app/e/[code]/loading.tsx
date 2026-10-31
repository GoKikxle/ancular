import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageSkeleton } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container-page pb-16 pt-10">
        <PageSkeleton grid />
      </main>
    </div>
  );
}
