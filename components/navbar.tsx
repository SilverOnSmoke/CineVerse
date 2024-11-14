'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Film, Search, TrendingUp, Tv, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileMenu } from '@/components/mobile-menu';
import { useState, useEffect, useTransition } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const navItems = [
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tv', label: 'TV Shows', icon: Tv },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 300);

  // Update search results when debounced search value changes
  useEffect(() => {
    if (debouncedSearch) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(debouncedSearch)}`);
      });
    }
  }, [debouncedSearch, router]);

  const handleSearchClear = () => {
    setSearch('');
    setIsSearchOpen(false);
    if (pathname === '/search') {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-14 items-center">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/" className="font-semibold">
              CINEVERSE
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Button
                  key={href}
                  variant={pathname === href ? 'secondary' : 'ghost'}
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Right Section - Search */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-[56px] border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
              <div className="relative py-4">
                <Input
                  type="text"
                  placeholder="Search movies & TV shows..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-8"
                  autoFocus
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                    onClick={handleSearchClear}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}