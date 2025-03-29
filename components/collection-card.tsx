'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Film } from 'lucide-react';
import { Collection } from '@/types/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine the number of movies if available
  const movieCount = collection.parts?.length || 0;

  return (
    <Link href={`/collections/${collection.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-lg">
            {collection.poster_path ? (
              <Image
                src={getTMDBImageUrl(collection.poster_path)}
                alt={collection.name}
                fill
                className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Film className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
              <h3 className="font-bold text-white line-clamp-2 text-sm xs:text-base sm:text-lg">{collection.name}</h3>
              
              {movieCount > 0 && (
                <Badge variant="secondary" className="mt-2 opacity-80">
                  {movieCount} {movieCount === 1 ? 'Movie' : 'Movies'}
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-3 xs:p-4 sm:p-5 space-y-2 xs:space-y-3">
            <div className="flex flex-col space-y-2">
              <p className="text-xs xs:text-sm sm:text-base text-muted-foreground line-clamp-3 mt-2">{collection.overview || 'No overview available'}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}