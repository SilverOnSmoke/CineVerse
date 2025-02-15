'use client';

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface WatchlistErrorProps {
  error: Error;
  reset: () => void;
}

export function WatchlistError({ error, reset }: WatchlistErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-4">Failed to Load Watchlist</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {error.message || "An error occurred while loading your watchlist"}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
        <Button variant="outline" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}