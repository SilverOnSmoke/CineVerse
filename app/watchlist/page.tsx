'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Info, 
  Trash2, 
  ListX, 
  Loader2, 
  Film, 
  Tv, 
  Filter, 
  Grid3X3, 
  List, 
  Film as MovieIcon, 
  RotateCcw, 
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: { 
      duration: 0.2,
      ease: "easeOut" 
    } 
  }
};

function EmptyWatchlist() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-4 max-w-3xl mx-auto mt-8 rounded-2xl bg-gradient-to-b from-background/80 to-background border border-border/30"
    >
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ListX className="h-12 w-12 text-primary" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-4 text-center">Your Watchlist is Empty</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Start adding movies and TV shows to your watchlist by clicking the bookmark icon on any poster.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" asChild className="gap-2">
          <Link href="/movies">
            <MovieIcon className="h-5 w-5" />
            Browse Movies
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="gap-2">
          <Link href="/tv">
            <Tv className="h-5 w-5" />
            Browse TV Shows
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function WatchlistContent() {
  const { savedItems, loadedItems, removeFromWatchlist, clearWatchlist, isLoading, error } = useWatchlist();
  const router = useRouter();
  
  // State for UI controls
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Filtered items based on current filter and search
  const filteredItems = useMemo(() => {
    return loadedItems
      .filter(item => {
        if (filter === 'all') return true;
        if (filter === 'movies') return item.media_type === 'movie';
        if (filter === 'tv') return item.media_type === 'tv';
        return true;
      })
      .filter(item => {
        if (!searchQuery) return true;
        const title = (item.title || item.name || '').toLowerCase();
        return title.includes(searchQuery.toLowerCase());
      });
  }, [loadedItems, filter, searchQuery]);

  // Show loading state when initially loading saved items
  if (isLoading && savedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
          <Loader2 className="h-10 w-10 absolute inset-0 m-auto animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your watchlist...</p>
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 max-w-3xl mx-auto mt-8 rounded-2xl bg-destructive/5 border border-destructive/20">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-destructive/10 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <RotateCcw className="h-10 w-10 text-destructive" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-center">Failed to load watchlist items</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          There was an error loading your watchlist items. Please try again later.
        </p>
        <Button 
          onClick={() => router.refresh()} 
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
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

  // Stats for the header
  const movieCount = loadedItems.filter(item => item.media_type === 'movie').length;
  const tvCount = loadedItems.filter(item => item.media_type === 'tv').length;

  // Get a nice gradient based on media type
  const getCardGradient = (mediaType: 'movie' | 'tv') => {
    return mediaType === 'movie' 
      ? 'from-blue-500/20 to-violet-600/20' 
      : 'from-rose-500/20 to-orange-600/20';
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 shadow-xl">
        {/* Background Poster Collage - Conditionally rendered if we have enough items */}
        {loadedItems.length > 0 && (
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-6 md:grid-cols-10 h-full">
              {[...loadedItems].slice(0, 20).map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="relative aspect-[2/3] overflow-hidden opacity-60">
                  {item.poster_path && (
                    <Image
                      src={getTMDBImageUrl(item.poster_path, 'w185')}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="10vw"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent z-10"></div>
        
        {/* Hero Content */}
        <div className="relative z-20 px-6 py-14 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="relative mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  My Watchlist
                </span>
              </h1>
              <div className="w-20 h-1.5 bg-primary rounded-full opacity-80 mt-2 mb-5"></div>
              <p className="text-lg text-muted-foreground md:text-xl mb-6 max-w-2xl">
                Your personal collection of movies and shows, ready to watch anytime.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center gap-3 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Film className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Movies</p>
                  <p className="text-2xl font-bold">{movieCount}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center gap-3 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TV Shows</p>
                  <p className="text-2xl font-bold">{tvCount}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex items-center gap-3 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ListX className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{loadedItems.length}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-12 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path 
              fill="hsl(var(--background))" 
              fillOpacity="1" 
              d="M0,224L60,229.3C120,235,240,245,360,224C480,203,600,149,720,144C840,139,960,181,1080,181.3C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setFilter(value as 'all' | 'movies' | 'tv')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="tv">TV Shows</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your watchlist..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Delete All Button */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 h-9 hidden sm:flex mr-2 bg-destructive/5 border-destructive/20 text-destructive hover:text-white hover:bg-destructive hover:border-destructive transition-colors duration-200 font-medium shadow-sm"
              >
                <motion.div
                  whileHover={{ rotate: [0, -20, 20, -15, 15, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.div>
                Delete All
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </div>
                  Delete Entire Watchlist?
                </DialogTitle>
                <DialogDescription>
                  This will permanently remove all {loadedItems.length} items from your watchlist. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 text-sm">
                  <p className="font-medium mb-2">You are about to delete:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Film className="h-3 w-3 text-blue-500" />
                      </div>
                      <span>{movieCount} Movies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <Tv className="h-3 w-3 text-rose-500" />
                      </div>
                      <span>{tvCount} TV Shows</span>
                    </li>
                  </ul>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 gap-2 relative overflow-hidden group"
                    onClick={async () => {
                      const success = await clearWatchlist();
                      if (success) {
                        setIsDeleteDialogOpen(false);
                      }
                    }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                    <Trash2 className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Delete All</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="h-9 w-9"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="h-9 w-9"
          >
            <List className="h-4 w-4" />
          </Button>

          {/* Mobile Delete All Button */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9 sm:hidden ml-2 bg-destructive/5 border-destructive/20 text-destructive hover:text-white hover:bg-destructive hover:border-destructive transition-colors duration-200 shadow-sm"
              >
                <motion.div
                  whileHover={{ rotate: [0, -20, 20, -15, 15, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.div>
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* No results after filtering */}
      {!isLoading && filteredItems.length === 0 && loadedItems.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No matching items found</h2>
          <p className="text-muted-foreground text-center mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button onClick={() => { setSearchQuery(''); setFilter('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* Show loading skeleton while fetching details */}
      {isLoading && savedItems.length > 0 && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          : "flex flex-col gap-4"
        }>
          {savedItems.map((item) => (
            viewMode === 'grid' ? (
              <div key={item.id} className="flex flex-col space-y-3">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <Skeleton key={item.id} className="h-24 w-full rounded-xl" />
            )
          ))}
        </div>
      )}
      
      {/* Show loaded items - Grid View */}
      {!isLoading && filteredItems.length > 0 && viewMode === 'grid' && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                exit="exit"
                className="group relative flex flex-col rounded-xl overflow-hidden bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Media Type Badge */}
                <Badge 
                  className={cn(
                    "absolute top-2 left-2 z-20",
                    item.media_type === 'movie' ? "bg-blue-500/90" : "bg-rose-500/90",
                    "backdrop-blur-sm"
                  )}
                >
                  {item.media_type === 'movie' ? (
                    <><Film className="h-3 w-3 mr-1" /> Movie</>
                  ) : (
                    <><Tv className="h-3 w-3 mr-1" /> TV</>
                  )}
                </Badge>
                
                <div className="aspect-[2/3] relative overflow-hidden rounded-t-xl">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    getCardGradient(item.media_type),
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )}></div>
                  
                  <Image
                    src={getTMDBImageUrl(item.poster_path, 'w500')}
                    alt={item.title || item.name || ''}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <Dialog>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/${item.media_type}/${item.id}${
                            item.media_type === 'tv' ? '?season=1&episode=1' : ''
                          }`}>
                            <Play className="h-4 w-4 mr-1.5" />
                            Watch
                          </Link>
                        </Button>
                        <Button size="sm" variant="secondary" className="w-full" asChild>
                          <Link href={`/${item.media_type}/${item.id}/details`}>
                            <Info className="h-4 w-4 mr-1.5" />
                            Details
                          </Link>
                        </Button>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="w-full col-span-2 mt-1 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                            <motion.span 
                              whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                              className="flex items-center justify-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1.5 relative z-10" />
                              <span className="relative z-10">Remove</span>
                            </motion.span>
                          </Button>
                        </DialogTrigger>
                      </div>
                      
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Remove from watchlist?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove "{item.title || item.name}" from your watchlist?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3 mt-4">
                          <Button variant="outline" className="flex-1">Cancel</Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1 gap-2"
                            onClick={async () => {
                              await handleRemove(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title || item.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Show loaded items - List View */}
      {!isLoading && filteredItems.length > 0 && viewMode === 'list' && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                exit="exit"
                className="group relative flex border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/30 bg-card"
              >
                <div className="relative w-[100px] sm:w-[140px]">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    getCardGradient(item.media_type),
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )}></div>
                  <Image
                    src={getTMDBImageUrl(item.poster_path, 'w500')}
                    alt={item.title || item.name || ''}
                    width={140}
                    height={210}
                    className="object-cover h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                        {item.title || item.name}
                      </h3>
                      <Badge 
                        className={cn(
                          item.media_type === 'movie' ? "bg-blue-500/90" : "bg-rose-500/90",
                          "backdrop-blur-sm"
                        )}
                      >
                        {item.media_type === 'movie' ? (
                          <><Film className="h-3 w-3 mr-1" /> Movie</>
                        ) : (
                          <><Tv className="h-3 w-3 mr-1" /> TV</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" className="gap-1" asChild>
                      <Link href={`/${item.media_type}/${item.id}${
                        item.media_type === 'tv' ? '?season=1&episode=1' : ''
                      }`}>
                        <Play className="h-4 w-4" />
                        Watch Now
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" asChild>
                      <Link href={`/${item.media_type}/${item.id}/details`}>
                        <Info className="h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="gap-1 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                          <motion.span 
                            whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                            className="flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1 relative z-10" />
                            <span className="relative z-10">Remove</span>
                          </motion.span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Remove from watchlist?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove "{item.title || item.name}" from your watchlist?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3 mt-4">
                          <Button variant="outline" className="flex-1">Cancel</Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1 gap-2"
                            onClick={async () => {
                              await handleRemove(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default function WatchlistPage() {
  return <WatchlistContent />;
}
