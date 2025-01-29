import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen pt-4 md:pt-8 pb-24 md:pb-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}