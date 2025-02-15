'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { fetchTMDBApi } from '@/lib/tmdb';

// Interface for minimal data stored in localStorage
export interface SavedWatchlistItem {
  id: number;
  media_type: 'movie' | 'tv';
}

// Interface for full item details from TMDB
export interface WatchlistItem {
  id: number;
  title?: string;
  name?: string; // For TV shows
  poster_path: string;
  media_type: 'movie' | 'tv';
}

const STORAGE_KEY = 'watchlist';

// Helper function to get watchlist from localStorage
const getStoredWatchlist = (): SavedWatchlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    console.log('[Watchlist] Retrieved from localStorage:', parsed);
    return parsed;
  } catch (error) {
    console.error('[Watchlist] Failed to parse watchlist:', error);
    return [];
  }
};

// Helper function to save watchlist to localStorage
const saveWatchlist = (items: SavedWatchlistItem[]): boolean => {
  try {
    // Get existing items first
    const existingItems = getStoredWatchlist();
    console.log('[Watchlist] Existing items in localStorage:', existingItems);

    // Create new array with unique items
    const mergedItems = [...existingItems];
    items.forEach(newItem => {
      if (!mergedItems.some(existing => existing.id === newItem.id)) {
        mergedItems.push(newItem);
      }
    });

    console.log('[Watchlist] Saving merged items to localStorage:', mergedItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedItems));
    
    const verification = getStoredWatchlist(); // Verify save
    console.log('[Watchlist] Verified saved data:', verification);
    return true;
  } catch (error) {
    console.error('[Watchlist] Failed to save watchlist:', error);
    return false;
  }
};

// Helper function to fetch full item details from TMDB
const fetchItemDetails = async (item: SavedWatchlistItem): Promise<WatchlistItem> => {
  try {
    console.log(`[Watchlist] Fetching details for ${item.media_type} ${item.id}`);
    const endpoint = `/${item.media_type}/${item.id}`;
    const data = await fetchTMDBApi<any>(endpoint);
    
    return {
      id: item.id,
      title: data.title || data.name,
      name: data.name,
      poster_path: data.poster_path,
      media_type: item.media_type,
    };
  } catch (error) {
    console.error(`[Watchlist] Failed to fetch details for ${item.media_type} ${item.id}:`, error);
    throw error;
  }
};

export const useWatchlist = () => {
  // State for saved IDs and media types
  const [savedItems, setSavedItems] = useState<SavedWatchlistItem[]>([]);
  // State for full item details
  const [loadedItems, setLoadedItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const operationsInProgress = useRef<Set<number>>(new Set());

  // Load saved items from localStorage
  useEffect(() => {
    const loadSavedItems = () => {
      try {
        const stored = getStoredWatchlist();
        console.log('[Watchlist] Initial load from storage:', stored);
        setSavedItems(stored);
      } catch (error) {
        console.error('[Watchlist] Failed to load watchlist:', error);
        setError(error as Error);
        toast.error('Failed to load watchlist');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedItems();
  }, []);

  // Fetch full details when saved items change
  useEffect(() => {
    const fetchDetails = async () => {
      if (savedItems.length === 0) {
        setLoadedItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[Watchlist] Fetching details for items:', savedItems);
        const details = await Promise.all(
          savedItems.map(item => fetchItemDetails(item))
        );
        console.log('[Watchlist] Loaded item details:', details);
        setLoadedItems(details);
      } catch (error) {
        console.error('[Watchlist] Failed to fetch item details:', error);
        setError(error as Error);
        toast.error('Failed to load some watchlist items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [savedItems]);

  const addToWatchlist = useCallback(async (item: SavedWatchlistItem): Promise<void> => {
    console.log('[Watchlist] Adding item:', item);
    
    if (operationsInProgress.current.has(item.id)) {
      console.log('[Watchlist] Operation already in progress for item:', item.id);
      return;
    }

    operationsInProgress.current.add(item.id);
    try {
      // Check for duplicates
      if (savedItems.some(i => i.id === item.id)) {
        console.log('[Watchlist] Item already exists, skipping add');
        return;
      }

      // Save only the new item - saveWatchlist will handle merging with existing items
      console.log('[Watchlist] Saving new item:', item);
      const saved = saveWatchlist([item]);
      if (!saved) {
        throw new Error('Failed to save to storage');
      }

      // Update state with all items from storage
      const updatedItems = getStoredWatchlist();
      console.log('[Watchlist] Updated items from storage:', updatedItems);
      setSavedItems(updatedItems);
      
      toast.success('Added to Watchlist', {
        description: 'Item added to your watchlist',
        style: { background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' },
        duration: 2000,
      });
    } catch (error) {
      console.error('[Watchlist] Failed to add to watchlist:', error);
      toast.error('Failed to add to watchlist', {
        description: 'Please try again',
      });
      throw error;
    } finally {
      operationsInProgress.current.delete(item.id);
    }
  }, [savedItems]);

  const removeFromWatchlist = useCallback(async (id: number): Promise<boolean> => {
    console.log('[Watchlist] Removing item with id:', id);
    
    if (operationsInProgress.current.has(id)) {
      console.log('[Watchlist] Operation already in progress for item:', id);
      return false;
    }

    operationsInProgress.current.add(id);
    try {
      // Find the item before removing it
      const itemToRemove = loadedItems.find(item => item.id === id);
      // Get current items and remove the specified one
      const currentItems = getStoredWatchlist();
      const filteredItems = currentItems.filter(item => item.id !== id);
      console.log('[Watchlist] Filtered items after removal:', filteredItems);
      
      // Save the filtered list directly to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
      console.log('[Watchlist] Saved filtered items to storage');
      
      // Update state with the new list
      setSavedItems(filteredItems);
      
      toast.success('Removed from Watchlist', {
        description: itemToRemove
          ? `${itemToRemove.title || itemToRemove.name} has been removed from your watchlist`
          : 'Item removed from your watchlist',
        style: { background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' },
        duration: 2000,
      });

      return true;
    } catch (error) {
      console.error('[Watchlist] Failed to remove from watchlist:', error);
      toast.error('Failed to remove from watchlist', {
        description: 'Please try again',
      });
      return false;
    } finally {
      operationsInProgress.current.delete(id);
    }
  }, [loadedItems]);

  const isInWatchlist = useCallback((id: number): boolean => {
    return savedItems.some(item => item.id === id);
  }, [savedItems]);

  return {
    savedItems,
    loadedItems,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
};