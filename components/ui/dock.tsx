import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Film,
  Tv,
  TrendingUp
} from 'lucide-react';

const iconComponents = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Film, label: 'Movies', href: '/movies' },
  { icon: Tv, label: 'TV Shows', href: '/tv' },
  { icon: TrendingUp, label: 'Trending', href: '/trending' }
];

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Dock = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-background/80 backdrop-blur-lg border-t md:hidden">
      <motion.div
        initial="initial"
        animate="animate"
        variants={floatingAnimation}
        className="flex items-center gap-1 p-2 rounded-2xl"
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
      className={`relative group p-3 rounded-lg transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 
        bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 
        transition-opacity whitespace-nowrap pointer-events-none border">
        {label}
      </span>
    </motion.div>
  </Link>
);

export default Dock;