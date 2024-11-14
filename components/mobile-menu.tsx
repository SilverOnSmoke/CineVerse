'use client';

import { Film, TrendingUp, Tv, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tv', label: 'TV Shows', icon: Tv },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
];

export function MobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer 
      direction="left" 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-3/4 max-w-sm">
        <div className="flex flex-col gap-2 p-4">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  pathname === href && 'bg-accent'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
} 