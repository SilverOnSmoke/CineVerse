import Link from 'next/link';
import Image from 'next/image';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import type { Movie, TVShow } from '@/types/tmdb';

interface MovieGridProps {
  items: Array<
    | (Movie & { media_type: 'movie' })
    | (TVShow & { media_type: 'tv' })
  >;
}

export function MovieGrid({ items }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div key={item.id} className="relative group">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
            <Image
              src={getTMDBImageUrl(item.poster_path, 'w500')}
              alt={item.media_type === 'movie' ? item.title : item.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex flex-col sm:flex-row gap-2 p-2">
                <Button size="sm" asChild>
                  <Link 
                    href={`/${item.media_type}/${item.id}${
                      item.media_type === 'tv' ? '?season=1&episode=1' : ''
                    }`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/${item.media_type}/${item.id}/details`}>
                    <Info className="h-4 w-4 mr-2" />
                    Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <h3 className="mt-2 text-sm font-medium line-clamp-1">
            {item.media_type === 'movie' ? item.title : item.name}
          </h3>
        </div>
      ))}
    </div>
  );
}