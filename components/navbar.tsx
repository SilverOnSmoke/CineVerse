'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Search, TrendingUp, Tv } from 'lucide-react';
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
        <div className="container flex h-16 items-center">
          {/* Mobile Logo - Centered */}
          <div className="w-full flex justify-center md:hidden">
            <Link href="/" className="group">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                CINEVERSE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex w-full items-center">
            {/* Desktop Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 pl-12 group flex-none"
            >
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
                CINEVERSE
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="flex items-center justify-center space-x-1 flex-1">
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

            {/* Desktop Search */}
            <div className="flex items-center space-x-4 pr-6 md:pr-8 lg:pr-12">
              <Link href="/search" className="flex items-center">
                <Search className="h-4 w-4 transition-colors hover:text-primary" />
                <span className="sr-only">Search</span>
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