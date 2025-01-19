'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Film, Search, TrendingUp, Tv, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileMenu } from '@/components/mobile-menu';
import { useState, useEffect, useTransition, Suspense, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    href: '/movies', 
    label: 'Movies', 
    icon: Film,
    hoverAnimation: 'animate-film-reel' 
  },
  { 
    href: '/tv', 
    label: 'TV Shows', 
    icon: Tv,
    hoverAnimation: 'animate-tv-static' 
  },
  { 
    href: '/trending', 
    label: 'Trending', 
    icon: TrendingUp,
    hoverAnimation: 'animate-trend-up' 
  },
];

function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // Only update search results if on the search page
    if (debouncedSearch && pathname === '/search') {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(debouncedSearch)}`);
      });
    } else if (!debouncedSearch && pathname === '/search') {
      router.push('/');
    }
  }, [debouncedSearch, router, pathname]);

  const handleSearchClear = useCallback(() => {
    setSearch('');
    setIsSearchOpen(false);
    if (pathname === '/search') {
      router.push('/');
    }
  }, [pathname, router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSearchClear();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleSearchClear]); 

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }, 100);
    } else {
      handleSearchClear();
    }
  };

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-in-out',
          isSearchOpen ? 'w-96 opacity-100 pr-4' : 'w-0 opacity-0'
        )}
      >
        <div className="relative w-full">
          <Input
            id="search-input"
            type="text"
            placeholder="Search movies & TV shows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                startTransition(() => {
                  router.push(`/search?q=${encodeURIComponent(search.trim())}`);
                });
              }
            }}
            className={cn(
              'w-full pl-10 pr-8 transition-all duration-300 rounded-full border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md',
              !isSearchOpen && 'pointer-events-none',
              isPending && 'animate-pulse'
            )}
          />
          <Search 
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
              search ? "text-primary" : "text-muted-foreground"
            )} 
          />
          {search && isSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent group"
              onClick={handleSearchClear}
            >
              <X className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </Button>
          )}
        </div>
      </div>
      {!isSearchOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSearchToggle}
          className="relative z-10 hover:bg-primary/10 transition-colors duration-200 group"
        >
          <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
        </Button>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled 
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm" 
          : "bg-background/50"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Left section - Logo and mobile menu */}
        <div className="flex items-center">
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <Link 
            href="/" 
            className="flex items-center space-x-2 pl-10 md:pl-12 group"
          >
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
              CINEVERSE
            </span>
          </Link>
        </div>

        {/* Center section - Navigation */}
        <nav className="hidden md:flex items-center justify-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-all duration-200 group relative px-4 py-2 rounded-full",
                pathname === item.href 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon 
                className={cn(
                  "mr-2 h-4 w-4 transition-transform duration-200",
                  pathname === item.href 
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
                  "group-hover:" + item.hoverAnimation
                )} 
              />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right section - Search */}
        <div className="flex items-center space-x-4 pr-4">
          <Suspense fallback={<div className="w-8 h-8" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}