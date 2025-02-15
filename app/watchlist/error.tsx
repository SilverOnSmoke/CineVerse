'use client';

import { ErrorHandler } from '@/components/error-handler';

export default function WatchlistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorHandler error={error} reset={reset} />;
}