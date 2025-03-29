import { Film, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      {/* Hero Section Skeleton */}
      <div className="relative w-full bg-gradient-to-r from-primary/20 via-primary/10 to-background mb-8">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6 mb-6" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 px-3 sm:px-6 md:px-8 lg:px-10">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Collections grid skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6 p-2 xs:p-3 sm:p-6 md:p-8 lg:p-10 pb-16">
          {Array(12).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}