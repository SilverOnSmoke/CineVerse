import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      {/* Hero Banner Skeleton */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        {/* Content Overlay Skeleton */}
        <div className="container relative z-10 h-full flex flex-col justify-end pb-8 px-4 sm:px-6">
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full max-w-3xl mb-2" />
          <Skeleton className="h-4 w-full max-w-2xl mb-6" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="container px-4 sm:px-6 py-8 space-y-10">
        {/* Collection Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        
        {/* Timeline Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-20 w-full" />
        </div>
        
        {/* Movies Grid Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mx-4 sm:mx-6 md:mx-8 lg:mx-10" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-6 md:p-8 lg:p-10">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}