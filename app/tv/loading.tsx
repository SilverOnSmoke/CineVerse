import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4 mt-4 md:mt-6 lg:mt-8 pl-4 sm:pl-6 md:pl-8 lg:pl-10">TV Shows</h1>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}