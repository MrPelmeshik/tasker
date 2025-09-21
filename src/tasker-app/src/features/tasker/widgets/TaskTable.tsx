import React, { useEffect, useMemo, useState } from 'react';
import { GlassWidget } from '../../../components/common/GlassWidget';
import { GlassButton } from '../../../components/ui/GlassButton';
import type { WidgetSizeProps } from '../../../types/widget-size';
import css from './task-table.module.css';
import { fetchWeeklyTasks, getMonday, type TaskWeeklyActivity } from '../../../services/api/tasks';

type WeekNav = 'prev' | 'next' | 'current' | 'latest';

function useWeek(): { weekStartIso: string; go: (nav: WeekNav) => void; set: (iso: string) => void } {
  const monday = useMemo(() => getMonday(new Date()), []);
  const [weekStartIso, setWeekStartIso] = useState(() => monday.toISOString().slice(0, 10));

  const go = (nav: WeekNav) => {
    if (nav === 'current') return setWeekStartIso(monday.toISOString().slice(0, 10));
    if (nav === 'latest') return setWeekStartIso(monday.toISOString().slice(0, 10));
    const base = new Date(weekStartIso + 'T00:00:00Z');
    const delta = nav === 'prev' ? -7 : 7;
    base.setUTCDate(base.getUTCDate() + delta);
    setWeekStartIso(base.toISOString().slice(0, 10));
  };

  return { weekStartIso, go, set: setWeekStartIso };
}

function buildWeekDays(isoMonday: string): { label: string; title: string }[] {
  const base = new Date(isoMonday + 'T00:00:00Z');
  const weekdayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
  const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const weekday = weekdayFmt.format(d);
    const date = dateFmt.format(d);
    return { label: weekday, title: `${weekday}, ${date}` };
  });
}

function intensityClass(count: number): string {
  if (count <= 0) return css.intensity0;
  if (count <= 2) return css.intensity1;
  if (count <= 4) return css.intensity2;
  if (count <= 6) return css.intensity3;
  if (count <= 9) return css.intensity4;
  return css.intensity5;
}

export const TaskTable: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { weekStartIso, go } = useWeek();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TaskWeeklyActivity[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchWeeklyTasks({ weekStartIso })
      .then(res => { if (alive) setData(res); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [weekStartIso]);

  const daysHeader = useMemo(() => buildWeekDays(weekStartIso), [weekStartIso]);

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.container}>
        <div className={css.toolbar}>
          <GlassButton size="s" onClick={() => go('prev')}>Пред. неделя</GlassButton>
          <GlassButton size="s" onClick={() => go('current')}>Текущая</GlassButton>
          <GlassButton size="s" onClick={() => go('next')}>След. неделя</GlassButton>
          <div className={css.spacer} />
          <span className={css.muted}>{weekStartIso}</span>
        </div>
        {/* Static header table to prevent body text from sliding under header */}
        <table className={css.table}>
          <thead className={css.thead}>
            <tr>
              <th className={`${css.th} ${css.colCarry}`} title="Количество недель переноса"></th>
              {daysHeader.map((d, i) => (
                <th key={i} className={`${css.th} ${css.colDay}`} title={d.title}>{d.label}</th>
              ))}
              <th className={`${css.th} ${css.colFuture}`} title="Активности после этой недели"></th>
              <th className={`${css.th} ${css.colTask}`}>Задача</th>
            </tr>
          </thead>
        </table>
        <div className={css.gridWrapper}>
          <table className={css.table}>
            <tbody>
              {loading && (
                <tr>
                  <td className={css.td} colSpan={10}>Загрузка…</td>
                </tr>
              )}
              {!loading && data.map(task => (
                <tr key={task.taskId}>
                  <td className={`${css.td} ${css.colCarry}`} title={`Перенос: ${task.carryWeeks}`}>{task.carryWeeks}</td>
                  {task.days.map((day) => (
                    <td key={day.date} className={`${css.td} ${css.colDay}`}>
                      {day.count > 0 ? (
                        <span title={String(day.count)} className={`${css.heatCell} ${intensityClass(day.count)}`} />
                      ) : null}
                    </td>
                  ))}
                  <td className={`${css.td} ${css.colFuture}`} title={task.hasFutureActivities ? 'Есть активности в будущих неделях' : 'Нет активностей в будущих неделях'}>{task.hasFutureActivities ? '→' : ''}</td>
                  <td className={`${css.td} ${css.colTask}`}><GlassButton size="xxs" onClick={() => {}} style={{ marginRight: '4px' }}>+</GlassButton>{task.taskName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassWidget>
  );
};


