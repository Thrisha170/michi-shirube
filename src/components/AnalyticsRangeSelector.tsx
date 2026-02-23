import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { AnalyticsRangeType, DateRange } from '@/hooks/useAnalyticsRange';

interface AnalyticsRangeSelectorProps {
  rangeType: AnalyticsRangeType;
  customRange: DateRange | null;
  onRangeTypeChange: (type: AnalyticsRangeType) => void;
  onCustomRangeChange: (range: DateRange) => void;
  className?: string;
}

export const AnalyticsRangeSelector = ({
  rangeType,
  customRange,
  onRangeTypeChange,
  onCustomRangeChange,
  className,
}: AnalyticsRangeSelectorProps) => {
  const [customOpen, setCustomOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({});

  const handleRangeChange = (value: string) => {
    if (value === 'custom') {
      setCustomOpen(true);
    } else {
      onRangeTypeChange(value as AnalyticsRangeType);
    }
  };

  const handleCustomApply = () => {
    if (tempRange.from && tempRange.to) {
      onCustomRangeChange({ from: tempRange.from, to: tempRange.to });
      onRangeTypeChange('custom');
      setCustomOpen(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={rangeType} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {rangeType === 'custom' && customRange && (
        <Popover open={customOpen} onOpenChange={setCustomOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              {format(customRange.from, 'MMM d')} - {format(customRange.to, 'MMM d')}
              <ChevronDown className="ml-1 w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{ from: tempRange.from, to: tempRange.to }}
              onSelect={(range) => setTempRange({ from: range?.from, to: range?.to })}
              numberOfMonths={1}
              className="p-3 pointer-events-auto"
            />
            <div className="p-3 border-t flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCustomOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCustomApply}
                disabled={!tempRange.from || !tempRange.to}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
