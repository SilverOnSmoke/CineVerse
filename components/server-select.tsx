'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

interface ServerSelectProps {
  currentServer: 'EMBED_SU' | 'VIDLINK';
  onServerChange: (server: 'EMBED_SU' | 'VIDLINK') => void;
}

export function ServerSelect({ currentServer, onServerChange }: ServerSelectProps) {
  const servers = {
    EMBED_SU: 'Server 1',
    VIDLINK: 'Server 2',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Change Server</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{servers[currentServer]}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {(Object.entries(servers) as Array<[keyof typeof servers, string]>).map(([key, label]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onServerChange(key as 'EMBED_SU' | 'VIDLINK')}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${currentServer === key ? 'bg-green-500' : 'bg-gray-400'}`} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 