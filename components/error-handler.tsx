'use client';

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useCallback } from "react";

interface ErrorHandlerProps {
  error: Error;
  reset: () => void;
}

export function ErrorHandler({ error, reset }: ErrorHandlerProps) {
  const handleReset = useCallback(() => {
    // Clear any error-related state/storage if needed
    reset();
  }, [reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {error.message || "An error occurred while loading the content"}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}