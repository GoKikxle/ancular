import { createTripAction } from "@/app/(app)/trips/actions";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackButton } from "@/components/layout/BackButton";
import { TripForm } from "@/components/trips/TripForm";
import { screenEyebrowLight } from "@/lib/screen-styles";

export default function NewTripPage() {
  return (
    <main className="min-h-full bg-[#F8F8F8] pb-28 text-[#111111] dark:bg-neutral-950 dark:text-white">
      <PageContainer className="pb-8 pt-1">
        <div className="mb-6">
          <BackButton href="/" label="Back to trips" variant="light" />
        </div>

        <header className="mb-8">
          <p className={screenEyebrowLight}>Create a trip</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white">
            New Trip
          </h1>
        </header>

        <TripForm action={createTripAction} />
      </PageContainer>
    </main>
  );
}
