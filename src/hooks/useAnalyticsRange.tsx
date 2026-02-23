import { useState, useMemo, useCallback, useEffect } from 'react';
import { startOfDay, subDays, parseISO, isAfter, isBefore, isEqual, format } from 'date-fns';

export type AnalyticsRangeType = 'today' | '7days' | '30days' | 'all' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsRangeState {
  rangeType: AnalyticsRangeType;
  customRange: DateRange | null;
}

export interface UseAnalyticsRangeReturn {
  rangeType: AnalyticsRangeType;
  customRange: DateRange | null;
  setRangeType: (type: AnalyticsRangeType) => void;
  setCustomRange: (range: DateRange) => void;
  filterByRange: <T extends { date: string }>(data: T[]) => T[];
  getDateRange: () => DateRange;
  getRangeLabel: () => string;
}

const getDateRangeForType = (type: AnalyticsRangeType, customRange: DateRange | null): DateRange => {
  const today = startOfDay(new Date());
  switch (type) {
    case 'today':
      return { from: today, to: today };
    case '7days':
      return { from: subDays(today, 6), to: today };
    case '30days':
      return { from: subDays(today, 29), to: today };
    case 'all':
      return { from: new Date(2020, 0, 1), to: today };
    case 'custom':
      return customRange || { from: today, to: today };
    default:
      return { from: subDays(today, 6), to: today };
  }
};

const filterDataByRange = <T extends { date: string }>(data: T[], range: DateRange): T[] => {
  const fromStart = startOfDay(range.from);
  const toEnd = startOfDay(range.to);
  return data.filter((item) => {
    const itemDate = startOfDay(parseISO(item.date));
    return (
      (isAfter(itemDate, fromStart) || isEqual(itemDate, fromStart)) &&
      (isBefore(itemDate, toEnd) || isEqual(itemDate, toEnd))
    );
  });
};

// Ordered fallback: today -> 7days -> 30days -> all
const FALLBACK_ORDER: AnalyticsRangeType[] = ['today', '7days', '30days', 'all'];

export const useAnalyticsRange = (
  hasData: boolean = true,
  dataCount: number = 0
): UseAnalyticsRangeReturn => {
  const defaultRange: AnalyticsRangeType = useMemo(() => {
    if (!hasData || dataCount <= 1) return 'today';
    return '7days';
  }, [hasData, dataCount]);

  const [rangeType, setRangeTypeRaw] = useState<AnalyticsRangeType>(defaultRange);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [userSelected, setUserSelected] = useState(false);
  const [initialFallbackDone, setInitialFallbackDone] = useState(false);

  // Store a reference to all data for fallback checks
  const [allData, setAllData] = useState<{ date: string }[]>([]);

  const setRangeType = useCallback((type: AnalyticsRangeType) => {
    setUserSelected(true);
    setRangeTypeRaw(type);
  }, []);

  const getDateRange = useCallback((): DateRange => {
    return getDateRangeForType(rangeType, customRange);
  }, [rangeType, customRange]);

  const filterByRange = useCallback(<T extends { date: string }>(data: T[]): T[] => {
    // Store data for fallback logic
    if (data.length > 0 && data !== allData) {
      setAllData(data);
    }
    return filterDataByRange(data, getDateRange());
  }, [getDateRange, allData]);

  // Auto-fallback: if current range yields no data and user hasn't manually selected, find the best range
  useEffect(() => {
    if (userSelected || initialFallbackDone || allData.length === 0) return;

    const currentRange = getDateRangeForType(rangeType, customRange);
    const currentResults = filterDataByRange(allData, currentRange);

    if (currentResults.length === 0) {
      // Find first range with data
      const currentIdx = FALLBACK_ORDER.indexOf(rangeType);
      for (let i = currentIdx + 1; i < FALLBACK_ORDER.length; i++) {
        const candidateRange = getDateRangeForType(FALLBACK_ORDER[i], null);
        const candidateResults = filterDataByRange(allData, candidateRange);
        if (candidateResults.length > 0) {
          setRangeTypeRaw(FALLBACK_ORDER[i]);
          setInitialFallbackDone(true);
          return;
        }
      }
    }
    setInitialFallbackDone(true);
  }, [allData, rangeType, customRange, userSelected, initialFallbackDone]);

  const getRangeLabel = useCallback((): string => {
    switch (rangeType) {
      case 'today':
        return 'Today';
      case '7days':
        return 'Last 7 days';
      case '30days':
        return 'Last 30 days';
      case 'all':
        return 'All time';
      case 'custom':
        if (customRange) {
          return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`;
        }
        return 'Custom range';
      default:
        return 'Last 7 days';
    }
  }, [rangeType, customRange]);

  return {
    rangeType,
    customRange,
    setRangeType,
    setCustomRange,
    filterByRange,
    getDateRange,
    getRangeLabel,
  };
};
