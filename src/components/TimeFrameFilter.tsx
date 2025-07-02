import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type TimeFrame = '1day' | '30days' | '90days' | '1year' | 'alltime' | 'custom';

interface TimeFrameFilterProps {
  selectedTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  onCustomDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
}

const TimeFrameFilter: React.FC<TimeFrameFilterProps> = ({
  selectedTimeFrame,
  onTimeFrameChange,
  customDateRange,
  onCustomDateRangeChange,
  className
}) => {
  const timeFrameOptions = [
    { value: '1day', label: 'Last 24 Hours' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'alltime', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Select value={selectedTimeFrame} onValueChange={(value: TimeFrame) => onTimeFrameChange(value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select time frame" />
        </SelectTrigger>
        <SelectContent>
          {timeFrameOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedTimeFrame === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-40 justify-start text-left font-normal",
                  !customDateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange.from ? (
                  format(customDateRange.from, "dd/MM/yyyy")
                ) : (
                  <span>From date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDateRange.from}
                onSelect={(date) => onCustomDateRangeChange({ ...customDateRange, from: date })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-40 justify-start text-left font-normal",
                  !customDateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange.to ? (
                  format(customDateRange.to, "dd/MM/yyyy")
                ) : (
                  <span>To date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDateRange.to}
                onSelect={(date) => onCustomDateRangeChange({ ...customDateRange, to: date })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default TimeFrameFilter;