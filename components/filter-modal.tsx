'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Filter, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Genre } from '@/types/tmdb';

// Ratings options from TMDB (vote_average)
const ratingOptions = [
  { value: '9', label: '9+ ★★★★★' },
  { value: '8', label: '8+ ★★★★☆' },
  { value: '7', label: '7+ ★★★☆☆' },
  { value: '6', label: '6+ ★★☆☆☆' },
  { value: '5', label: '5+ ★☆☆☆☆' },
  { value: '0', label: 'All Ratings' },
];

// Years array for filter
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

interface FilterModalProps {
  genres: Genre[];
  selectedGenre: string;
  onGenreChange: string; // This will store the serializable event name
  selectedYear: string;
  onYearChange: string; // This will store the serializable event name
  selectedRating: string;
  onRatingChange: string; // This will store the serializable event name
  includeAdult: boolean;
  onAdultChange: string; // This will store the serializable event name
  isAdultVerified: boolean;
  onAdultVerifiedChange: string; // This will store the serializable event name
  onResetFilters: string; // This will store the serializable event name
}

export function FilterModal({
  genres,
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  selectedRating,
  onRatingChange,
  includeAdult,
  onAdultChange,
  isAdultVerified,
  onAdultVerifiedChange,
  onResetFilters,
}: FilterModalProps) {
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Create handler functions that dispatch custom events
  const handleGenreChange = (value: string) => {
    const event = new CustomEvent(onGenreChange, { detail: value });
    window.dispatchEvent(event);
  };

  const handleYearChange = (value: string) => {
    const event = new CustomEvent(onYearChange, { detail: value });
    window.dispatchEvent(event);
  };

  const handleRatingChange = (value: string) => {
    const event = new CustomEvent(onRatingChange, { detail: value });
    window.dispatchEvent(event);
  };

  const handleAdultChange = (value: boolean) => {
    const event = new CustomEvent(onAdultChange, { detail: value });
    window.dispatchEvent(event);
  };

  const handleAdultVerifiedChange = (value: boolean) => {
    const event = new CustomEvent(onAdultVerifiedChange, { detail: value });
    window.dispatchEvent(event);
  };

  const handleResetFilters = () => {
    const event = new CustomEvent(onResetFilters);
    window.dispatchEvent(event);
  };
  
  // Handle adult content toggle with age verification
  const handleAdultContentToggle = () => {
    if (includeAdult) {
      // If already enabled, just turn it off
      handleAdultChange(false);
    } else {
      // Always show age verification dialog when enabling adult content
      setShowAgeDialog(true);
    }
  };

  // Handle age verification response
  const handleAgeVerification = (isConfirmed: boolean) => {
    setShowAgeDialog(false);
    handleAdultVerifiedChange(isConfirmed);
    
    if (isConfirmed) {
      handleAdultChange(true);
    } else {
      handleAdultChange(false);
    }
  };

  const hasActiveFilters = selectedGenre || selectedYear || selectedRating !== '0' || includeAdult;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            aria-label="Advanced Filters"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {countActiveFilters(selectedGenre, selectedYear, selectedRating, includeAdult)}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Filter movies and TV shows by genre, year, rating, and more.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={selectedGenre} onValueChange={handleGenreChange}>
                <SelectTrigger id="genre" className="w-full">
                  <SelectValue placeholder="Select Genre" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {ratingOptions.map((option) => (
                  <Badge 
                    key={option.value} 
                    variant={selectedRating === option.value ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-primary/80",
                      selectedRating === option.value ? "bg-primary text-primary-foreground" : ""
                    )}
                    onClick={() => handleRatingChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between space-x-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="adult-content"
                  checked={includeAdult}
                  onCheckedChange={handleAdultContentToggle}
                />
                <Label htmlFor="adult-content" className="cursor-pointer">Adult Content</Label>
              </div>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <p className="text-sm text-muted-foreground hidden sm:block">
              {hasActiveFilters ? `${countActiveFilters(selectedGenre, selectedYear, selectedRating, includeAdult)} filters applied` : 'No filters applied'}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                className="flex-1"
                variant="default" 
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Age Verification Dialog */}
      <AlertDialog open={showAgeDialog} onOpenChange={setShowAgeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Age Verification Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              This filter will show adult content that may not be suitable for all audiences.
              Please confirm you are at least 18 years old.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleAgeVerification(false)}>
              I'm Under 18
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAgeVerification(true)}>
              I'm 18 or Older
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to count active filters
function countActiveFilters(
  selectedGenre: string, 
  selectedYear: string, 
  selectedRating: string, 
  includeAdult: boolean
): number {
  let count = 0;
  if (selectedGenre && selectedGenre !== "all") count++;
  if (selectedYear && selectedYear !== "all") count++;
  if (selectedRating !== '0') count++;
  if (includeAdult) count++;
  return count;
}