import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6 mb-16">
      <div className="relative min-h-[80vh] flex items-center pt-20">
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}