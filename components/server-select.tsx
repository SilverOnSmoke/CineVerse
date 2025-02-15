import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface ServerSelectProps {
  currentServer: keyof typeof PROVIDERS;
  onServerChange: (server: keyof typeof PROVIDERS) => void;
}

const PROVIDERS = {
  VIDEASY: 'Videasy (4K)',
  EMBED_SU: 'Server 1 (Embed SU)',
  VIDLINK: 'Server 2 (VidLink)',
  AUTOEMBED: 'Server 3 (AutoEmbed)',
  VIDSRC: 'Server 4 (VidSrc)',
} as const;

export function ServerSelect({ currentServer, onServerChange }: ServerSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Label>Server:</Label>
      <Select value={currentServer} onValueChange={onServerChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select server" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="VIDEASY">{PROVIDERS.VIDEASY}</SelectItem>
          <SelectItem value="EMBED_SU">{PROVIDERS.EMBED_SU}</SelectItem>
          <SelectItem value="VIDLINK">{PROVIDERS.VIDLINK}</SelectItem>
          <SelectItem value="AUTOEMBED">{PROVIDERS.AUTOEMBED}</SelectItem>
          <SelectItem value="VIDSRC">{PROVIDERS.VIDSRC}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}