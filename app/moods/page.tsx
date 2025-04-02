'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Zap, Coffee, Skull, Glasses, CloudRain, Baby, Laugh, Moon, Film, Wand2, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoodGrid } from '@/components/mood-grid';

// Define mood categories with their icons, colors, and parameters
const moodsData = [
  {
    id: 'romantic',
    name: 'Romantic',
    icon: Heart,
    color: 'bg-gradient-to-br from-pink-500 to-rose-500',
    textColor: 'text-pink-500',
    description: 'Fall in love with these heartwarming stories',
    genres: [10749], // Romance genre ID
    minRating: 6,
    params: { with_genres: '10749', 'vote_average.gte': '6.0' }
  },
  {
    id: 'magical',
    name: 'Magical',
    icon: Wand2,
    color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
    textColor: 'text-purple-500',
    description: 'Experience the wonder of magical stories',
    genres: [14], // Fantasy genre ID
    minRating: 6,
    params: { with_genres: '14', 'vote_average.gte': '6.0' }
  },
  {
    id: 'thrilling',
    name: 'Thrilling',
    icon: Zap,
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    textColor: 'text-amber-500',
    description: 'Edge-of-your-seat excitement awaits',
    genres: [53, 28], // Thriller and Action genre IDs
    minRating: 6.5,
    params: { with_genres: '53,28', 'vote_average.gte': '6.5' }
  },
  {
    id: 'relaxing',
    name: 'Relaxing',
    icon: Coffee,
    color: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    textColor: 'text-teal-500',
    description: 'Unwind with these calming stories',
    genres: [35, 18], // Comedy and Drama genre IDs
    sort: 'vote_average.desc',
    params: { with_genres: '35,18', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }
  },
  {
    id: 'scary',
    name: 'Scary',
    icon: Skull,
    color: 'bg-gradient-to-br from-red-500 to-red-800',
    textColor: 'text-red-500',
    description: 'Spine-chilling tales of terror',
    genres: [27, 53], // Horror and Thriller genre IDs
    minRating: 6,
    params: { with_genres: '27', 'vote_average.gte': '6.0' }
  },
  {
    id: 'thoughtful',
    name: 'Thoughtful',
    icon: Glasses,
    color: 'bg-gradient-to-br from-slate-600 to-slate-800',
    textColor: 'text-slate-500',
    description: 'Ponder life with these thought-provoking films',
    genres: [18], // Drama genre ID
    minRating: 7.5,
    params: { with_genres: '18', 'vote_average.gte': '7.5', 'vote_count.gte': '500' }
  },
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    icon: CloudRain,
    color: 'bg-gradient-to-br from-blue-500 to-blue-700',
    textColor: 'text-blue-500',
    description: 'Perfect companions for a stormy day',
    genres: [18, 10751], // Drama and Family genre IDs
    minRating: 6.5,
    params: { with_genres: '18,10751', 'vote_average.gte': '6.5' }
  },
  {
    id: 'family',
    name: 'Family',
    icon: Baby,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-green-500',
    description: 'Fun for the whole family',
    genres: [10751, 16], // Family and Animation genre IDs
    minRating: 6,
    params: { with_genres: '10751,16', 'vote_average.gte': '6.0' }
  },
  {
    id: 'funny',
    name: 'Funny',
    icon: Laugh,
    color: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    textColor: 'text-yellow-500',
    description: 'Laugh your heart out',
    genres: [35], // Comedy genre ID
    minRating: 6,
    params: { with_genres: '35', 'vote_average.gte': '6.0' }
  },
  {
    id: 'late-night',
    name: 'Late Night',
    icon: Moon,
    color: 'bg-gradient-to-br from-indigo-600 to-purple-800',
    textColor: 'text-indigo-500',
    description: 'Perfect for those midnight viewing sessions',
    genres: [53, 9648], // Thriller and Mystery genre IDs
    minRating: 6.5,
    params: { with_genres: '53,9648', 'vote_average.gte': '6.5' }
  },
  {
    id: 'classic',
    name: 'Classic',
    icon: Film,
    color: 'bg-gradient-to-br from-neutral-600 to-neutral-800',
    textColor: 'text-neutral-500',
    description: 'Timeless films from years gone by',
    release_date: '1950,1990',
    minRating: 7,
    params: { 'primary_release_date.gte': '1950-01-01', 'primary_release_date.lte': '1990-12-31', 'vote_average.gte': '7.0' }
  },
  {
    id: 'feel-good',
    name: 'Feel Good',
    icon: Sparkles,
    color: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    textColor: 'text-cyan-500',
    description: 'Uplifting movies to brighten your day',
    genres: [35, 10751], // Comedy and Family genre IDs
    minRating: 6.5,
    params: { with_genres: '35,10751', 'vote_average.gte': '6.5', sort_by: 'popularity.desc' }
  }
] as const;

// Create a type from the moods array for better type safety
export type Mood = typeof moodsData[number];

export default function MoodsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moodParam = searchParams.get('mood');
  const typeParam = searchParams.get('type');
  const [selectedMood, setSelectedMood] = useState(moodParam || 'all');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>((typeParam === 'tv' ? 'tv' : 'movie'));
  
  // Ref for results section to scroll to
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Handle mood selection with auto-scrolling
  const handleMoodSelection = (moodId: string) => {
    setSelectedMood(moodId);
    
    // Small delay to ensure state update before scrolling
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };
  
  // Handle media type change with proper typing
  const handleMediaTypeChange = (value: string) => {
    // Validate that value is either 'movie' or 'tv' before setting state
    if (value === 'movie' || value === 'tv') {
      setMediaType(value);
    }
  };

  // Update URL parameters when selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedMood && selectedMood !== 'all') {
      params.append('mood', selectedMood);
    }
    
    params.append('type', mediaType);
    router.push(`/moods?${params.toString()}`, { scroll: false });
  }, [selectedMood, mediaType, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Mood-Based Recommendations
              </h1>
              <div className="w-20 h-1.5 bg-primary rounded-full opacity-80 mt-2 mb-5 mx-auto"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover content that perfectly matches your current mood. Select a mood below to find your next favorite watch.
              </p>
            </div>

            {/* Media Type Selection */}
            <div className="mb-8 flex justify-center">
              <Tabs 
                defaultValue={mediaType} 
                value={mediaType}
                onValueChange={handleMediaTypeChange} 
                className="w-full max-w-md"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="movie">Movies</TabsTrigger>
                  <TabsTrigger value="tv">TV Shows</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Mood Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelection('all')}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-300 border hover:shadow-md",
                  selectedMood === 'all' ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <span className="font-medium">All Moods</span>
              </motion.button>

              {moodsData.map((mood) => (
                <motion.button
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  key={mood.id}
                  onClick={() => handleMoodSelection(mood.id)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-300 border hover:shadow-md",
                    selectedMood === mood.id ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-3", mood.color)}>
                    <mood.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-medium text-sm">{mood.name}</span>
                </motion.button>
              ))}
            </div>
            
            {/* Scroll indicator */}
            <div className="flex justify-center mt-12">
              <motion.div 
                initial={{ opacity: 0.5 }}
                animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="cursor-pointer"
              >
                <ChevronDown className="h-6 w-6 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Results Section */}
      <div ref={resultsRef} className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Results Grid */}
          <MoodGrid 
            mood={selectedMood === 'all' ? null : moodsData.find(m => m.id === selectedMood) || null} 
            mediaType={mediaType}
          />
        </div>
      </div>
    </div>
  );
}