'use client';

import { Collection } from '@/types/tmdb';
import { CollectionCard } from './collection-card';

interface CollectionGridProps {
  collections: Collection[];
}

export function CollectionGrid({ collections }: CollectionGridProps) {
  if (!collections?.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No collections found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6 p-2 xs:p-3 sm:p-6 md:p-8 lg:p-10 pb-16">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}