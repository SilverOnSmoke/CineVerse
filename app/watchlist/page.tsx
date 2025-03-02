'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import { Play, Info, Trash2, ListX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <ListX className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-4">Your Watchlist is Empty</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Start adding movies and TV shows to your watchlist by clicking the bookmark icon on any poster.
      </p>
      <Button asChild>
        <Link href="/">Browse Content</Link>
      </Button>
    </div>
  );
}

function WatchlistContent() {
  const { savedItems, loadedItems, removeFromWatchlist, isLoading, error } = useWatchlist();
  const router = useRouter();

  console.log('[WatchlistPage] Current saved items:', savedItems);
  console.log('[WatchlistPage] Current loaded items:', loadedItems);

  // Show loading state when initially loading saved items
  if (isLoading && savedItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show empty state if no saved items
  if (savedItems.length === 0) {
    return <EmptyWatchlist />;
  }

  // Show error state if we failed to load details
  if (error && loadedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h2 className="text-xl font-semibold mb-4">Failed to load watchlist items</h2>
        <p className="text-muted-foreground text-center mb-4">
          There was an error loading your watchlist items. Please try again later.
        </p>
        <Button onClick={() => router.refresh()}>Retry</Button>
      </div>
    );
  }

  const handleRemove = async (id: number) => {
    try {
      const success = await removeFromWatchlist(id);
      if (!success) {
        toast.error('Failed to remove item', {
          description: 'The item could not be removed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item', {
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-8">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      
      {/* Show loading skeleton while fetching details */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {savedItems.map((item) => (
            <div key={item.id} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      
      {/* Show loaded items */}
      {!isLoading && loadedItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {loadedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden group">
                <Image
                  src={getTMDBImageUrl(item.poster_path, 'w500')}
                  alt={item.title || item.name || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 sm:p-3 w-full max-w-[85%] mx-auto">
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link href={`/${item.media_type}/${item.id}${
                        item.media_type === 'tv' ? '?season=1&episode=1' : ''
                      }`}>
                        <Play className="h-4 w-4 mr-2" />
                        Watch
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" className="w-full sm:w-auto" asChild>
                      <Link href={`/${item.media_type}/${item.id}/details`}>
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full sm:w-auto col-span-1 sm:col-span-2"
                      onClick={async () => {
                        const button = document.activeElement as HTMLButtonElement;
                        button.disabled = true;
                        try {
                          await handleRemove(item.id);
                        } finally {
                          button.disabled = false;
                        }
                      }}
                    >
                      <Trash2 className={cn(
                        "h-4 w-4 mr-2",
                        "group-disabled:animate-spin"
                      )} />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              <h3 className="mt-3 px-2 text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 md:line-clamp-1 hover:text-primary transition-colors">
                {item.title || item.name}
              </h3>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function WatchlistPage() {
  return <WatchlistContent />;
}
