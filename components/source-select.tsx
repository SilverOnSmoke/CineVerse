import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from '@/components/ui/select';
  
  interface SourceSelectProps {
    currentSource: string;
    onSourceChange: (source: string) => void;
  }
  
  const SOURCES = {
    Poseidon: 'Poseidon',
    Goliath: 'Goliath',
    Hercules: 'Hercules',
  } as const;
  
  export function SourceSelect({ currentSource, onSourceChange }: SourceSelectProps) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Source:</span>
        <Select value={currentSource} onValueChange={onSourceChange}>
          <SelectTrigger className="w-[140px] bg-transparent border-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SOURCES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }