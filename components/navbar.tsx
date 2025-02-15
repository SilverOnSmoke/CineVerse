'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Search, TrendingUp, Tv, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import Dock from './ui/dock';

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
  {
    href: '/watchlist',
    label: 'Watchlist',
    icon: Bookmark,
    hoverAnimation: 'animate-bookmark'
  },
];

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
    <>
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          isScrolled 
            ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm" 
            : "bg-background/50"
        )}
      >
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 flex items-center justify-between h-16">
          {/* Mobile Navigation */}
          <div className="flex md:hidden flex-1 items-center justify-between px-2">
            {/* Watchlist Icon */}
            <Link
              href="/watchlist"
              className={cn(
                "flex items-center p-2 rounded-full transition-all duration-200",
                pathname === '/watchlist'
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Bookmark
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  pathname === '/watchlist' && "animate-bookmark"
                )}
              />
            </Link>

            {/* Logo */}
            <Link href="/" className="group">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                CINEVERSE
              </span>
            </Link>

            {/* Empty div for spacing */}
            <div className="w-9" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-between">
            {/* Desktop Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
            >
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                CINEVERSE
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="flex items-center justify-center space-x-2 lg:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-all duration-200 group relative px-2 lg:px-4 py-2 rounded-full whitespace-nowrap",
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

            {/* Desktop Search */}
            <div className="flex items-center">
              <Link 
                href="/search" 
                className="flex items-center px-2 sm:px-3 lg:px-4 py-2 rounded-lg border border-muted transition-all duration-200 hover:bg-primary/5 hover:border-primary text-sm font-bold text-muted-foreground hover:text-primary whitespace-nowrap"
              >
                <Search className="h-4 w-4 transition-colors text-muted-foreground mr-2" />
                Search
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dock Navigation */}
      <Dock />
    </>
  );
}
