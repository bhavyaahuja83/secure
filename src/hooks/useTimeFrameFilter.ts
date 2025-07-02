import { useState, useMemo } from 'react';
import { TimeFrame } from '../components/TimeFrameFilter';

export const useTimeFrameFilter = (initialTimeFrame: TimeFrame = '30days') => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>(initialTimeFrame);
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedTimeFrame) {
      case '1day':
        return {
          from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          to: now
        };
      case '30days':
        return {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now
        };
      case '90days':
        return {
          from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          to: now
        };
      case '1year':
        return {
          from: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
          to: now
        };
      case 'alltime':
        return {
          from: new Date(2020, 0, 1), // Start from 2020
          to: now
        };
      case 'custom':
        return {
          from: customDateRange.from || new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: customDateRange.to || now
        };
      default:
        return {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now
        };
    }
  }, [selectedTimeFrame, customDateRange]);

  const isInDateRange = (dateStr: string) => {
    const date = new Date(dateStr);
    return date >= dateRange.from && date <= dateRange.to;
  };

  return {
    selectedTimeFrame,
    setSelectedTimeFrame,
    customDateRange,
    setCustomDateRange,
    dateRange,
    isInDateRange
  };
};