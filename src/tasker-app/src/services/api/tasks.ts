export type TaskActivityDay = {
  date: string; // ISO date for the day
  count: number; // number of events on this day
};

export type TaskWeeklyActivity = {
  taskId: number;
  taskName: string;
  carryWeeks: number; // how many weeks task has been carried over
  days: TaskActivityDay[]; // 7 items, Monday..Sunday
  hasFutureActivities: boolean; // any activities after this week
};

export type GetWeekParams = {
  weekStartIso: string; // Monday ISO date string
};

function addDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export async function fetchWeeklyTasks(params: GetWeekParams): Promise<TaskWeeklyActivity[]> {
  // Mock: deterministic pseudo-random based on weekStartIso for consistent UI
  const seed = Array.from(params.weekStartIso).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const monday = new Date(params.weekStartIso + 'T00:00:00Z');
  const days = Array.from({ length: 7 }, (_, i) => toIsoDate(addDays(monday, i)));

  const tasks = Array.from({ length: 12 }, (_, t) => {
    const base = Math.floor(rng() * 4);
    const activityDays: TaskActivityDay[] = days.map((d, i) => ({
      date: d,
      count: Math.max(0, Math.floor(base + rng() * 6 - 2)),
    }));
    const carryWeeks = Math.floor(rng() * 8);
    const hasFutureActivities = rng() > 0.6;
    return {
      taskId: t + 1,
      taskName: `Task #${t + 1}`,
      carryWeeks,
      days: activityDays,
      hasFutureActivities,
    } as TaskWeeklyActivity;
  });

  // Simulate latency
  await new Promise(r => setTimeout(r, 200));
  return tasks;
}

// Simple deterministic PRNG for mock data
function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


