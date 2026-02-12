import { useState } from 'react';
import { getMondayIso } from '../services/api';

export type WeekNav = 'prev' | 'next' | 'current' | 'latest';

/**
 * Хук навигации по неделям (понедельник — старт недели)
 */
export function useWeek(): {
  weekStartIso: string;
  go: (nav: WeekNav) => void;
  set: (iso: string) => void;
} {
  const [weekStartIso, setWeekStartIso] = useState(() => getMondayIso(new Date()));

  const go = (nav: WeekNav) => {
    if (nav === 'current' || nav === 'latest') {
      return setWeekStartIso(getMondayIso(new Date()));
    }
    const base = new Date(weekStartIso + 'T12:00:00');
    base.setDate(base.getDate() + (nav === 'prev' ? -7 : 7));
    setWeekStartIso(getMondayIso(base));
  };

  return { weekStartIso, go, set: setWeekStartIso };
}
