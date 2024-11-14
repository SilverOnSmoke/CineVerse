import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

interface ServerSelectProps {
  currentServer: keyof typeof PROVIDERS;
  onServerChange: (server: keyof typeof PROVIDERS) => void;
}

const PROVIDERS = {
  EMBED_SU: 'Server 1',
  VIDLINK: 'Server 2',
  VIDBINGE: 'Server 3',
  AUTOEMBED: 'Server 4',
} as const;

export function ServerSelect({ currentServer, onServerChange }: ServerSelectProps) {
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
            <span>{PROVIDERS[currentServer]}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {(Object.entries(PROVIDERS) as Array<[keyof typeof PROVIDERS, string]>).map(([key, label]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onServerChange(key)}
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