import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Film,
  Tv,
  TrendingUp,
  Bookmark
} from 'lucide-react';

const iconComponents = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Film, label: 'Movies', href: '/movies' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Tv, label: 'TV Shows', href: '/tv' },
  { icon: TrendingUp, label: 'Trending', href: '/trending' }
];

const Dock = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-lg border-t safe-bottom md:hidden">
      <motion.div
        className="flex items-center justify-evenly xs:justify-between w-full max-w-screen-sm px-1 xs:px-4 py-1"
      >
        {iconComponents.map(({ icon: Icon, label, href }) => (
          <IconButton 
            key={label} 
            Icon={Icon} 
            label={label} 
            href={href}
            isActive={pathname === href}
          />
        ))}
      </motion.div>
    </div>
  );
};

const IconButton = ({ 
  Icon, 
  label, 
  href,
  isActive 
}: { 
  Icon: any;
  label: string;
  href: string;
  isActive: boolean;
}) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group p-2 rounded-lg transition-colors touch-manipulation ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
      }`}
      style={{
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0.5rem))'
      }}
    >
      <Icon className="w-[18px] h-[18px] xs:w-5 xs:h-5" />
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5
        bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover:opacity-100
        transition-opacity whitespace-nowrap pointer-events-none border shadow-sm">
        {label}
      </span>
    </motion.div>
  </Link>
);

export default Dock;