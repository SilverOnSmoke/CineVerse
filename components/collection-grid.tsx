'use client';

import { useState, useEffect } from 'react';
import { Collection } from '@/types/tmdb';
import { CollectionCard } from './collection-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './ui/skeleton';

interface CollectionGridProps {
  collections: Collection[];
}

export function CollectionGrid({ collections }: CollectionGridProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!collections?.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No collections found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {isLoaded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6 p-2 xs:p-3 sm:p-6 md:p-8 lg:p-10 pb-16"
          >
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: "easeOut" 
                }}
              >
                <CollectionCard collection={collection} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
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
        )}
      </AnimatePresence>
    </div>
  );
}