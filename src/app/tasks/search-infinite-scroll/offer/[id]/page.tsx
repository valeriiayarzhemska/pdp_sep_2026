import { Suspense } from 'react';
import BackToResultsButton from '../../BackToResultsButton';
import OfferDetail from './OfferDetail';

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <BackToResultsButton className="text-sm text-neutral-400 hover:text-neutral-200" />

      <div className="mt-4">
        <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
          <OfferDetail id={id} />
        </Suspense>
      </div>
    </main>
  );
}
