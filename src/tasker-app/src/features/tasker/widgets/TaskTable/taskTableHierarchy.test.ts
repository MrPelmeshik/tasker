import type { FolderResponse } from '../../../../types/api';
import { buildFolderIndex } from './taskTableFolderIndex';
import type { TaskRow } from './taskTableUtils';
import { aggregateTaskRows, buildTaskTableDisplayRows } from './taskTableHierarchy';

function mkDays(counts: number[]) {
  return counts.map((count, i) => ({
    date: `2025-06-${String(9 + i).padStart(2, '0')}`,
    count,
    events: count > 0 ? [{ id: `e-${i}`, eventType: 4 }] : undefined,
  }));
}

function mkTaskRow(p: {
  taskId: string;
  areaId: string;
  folderId?: string | null;
  taskName?: string;
  days?: ReturnType<typeof mkDays>;
}): TaskRow {
  const days = p.days ?? mkDays([0, 0, 0, 0, 0, 0, 0]);
  return {
    taskId: p.taskId,
    taskName: p.taskName ?? p.taskId,
    areaId: p.areaId,
    areaTitle: 'Область',
    carryWeeks: 0,
    hasFutureActivities: false,
    pastEventTypes: [],
    futureEventTypes: [],
    days,
    task: {
      id: p.taskId,
      areaId: p.areaId,
      folderId: p.folderId ?? null,
      title: p.taskName ?? p.taskId,
      status: 1,
    },
  };
}

describe('aggregateTaskRows', () => {
  it('суммирует count по дням и объединяет events', () => {
    const a = mkTaskRow({
      taskId: '1',
      areaId: 'A',
      days: mkDays([1, 0, 2, 0, 0, 0, 0]),
    });
    const b = mkTaskRow({
      taskId: '2',
      areaId: 'A',
      days: mkDays([0, 1, 1, 0, 0, 0, 0]),
    });
    const m = aggregateTaskRows([a, b]);
    expect(m.days[0].count).toBe(1);
    expect(m.days[1].count).toBe(1);
    expect(m.days[2].count).toBe(3);
    expect(m.days[2].events?.length).toBe(2);
  });
});

describe('buildTaskTableDisplayRows', () => {
  const folderF1: FolderResponse = {
    id: 'f1',
    title: 'Папка',
    areaId: 'a1',
    parentFolderId: null,
    ownerUserId: 'u1',
    ownerUserName: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    customColor: '#112233',
  };

  it('при свёрнутой области — одна строка area_collapsed', () => {
    const rows = [mkTaskRow({ taskId: 't1', areaId: 'a1' })];
    const folderIndex = buildFolderIndex([]);
    const out = buildTaskTableDisplayRows(
      [{ areaId: 'a1', areaTitle: 'A', rows }],
      folderIndex,
      new Set(),
      new Set(),
      'alpha',
      false
    );
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe('area_collapsed');
    if (out[0].kind === 'area_collapsed') {
      expect(out[0].metrics.days[0].count).toBe(0);
    }
  });

  it('раскрытая область: свёрнутая папка даёт одну строку folder с агрегатом', () => {
    const rows = [mkTaskRow({ taskId: 't1', areaId: 'a1', folderId: 'f1', days: mkDays([2, 0, 0, 0, 0, 0, 0]) })];
    const folderIndex = buildFolderIndex([folderF1]);
    const out = buildTaskTableDisplayRows(
      [{ areaId: 'a1', areaTitle: 'A', rows }],
      folderIndex,
      new Set(['a1']),
      new Set(),
      'alpha',
      false
    );
    const folderRows = out.filter((r) => r.kind === 'folder');
    expect(folderRows).toHaveLength(1);
    const fr = folderRows[0];
    expect(fr.kind).toBe('folder');
    if (fr.kind === 'folder') {
      expect(fr.collapsed).toBe(true);
      expect(fr.metrics?.days[0].count).toBe(2);
      expect(fr.tasksCount).toBe(1);
    }
    expect(out.some((r) => r.kind === 'task')).toBe(false);
  });

  it('раскрытая папка показывает задачу-лист', () => {
    const rows = [mkTaskRow({ taskId: 't1', areaId: 'a1', folderId: 'f1' })];
    const folderIndex = buildFolderIndex([folderF1]);
    const out = buildTaskTableDisplayRows(
      [{ areaId: 'a1', areaTitle: 'A', rows }],
      folderIndex,
      new Set(['a1']),
      new Set(['f1']),
      'alpha',
      false
    );
    expect(out.some((r) => r.kind === 'folder' && !r.collapsed)).toBe(true);
    expect(out.some((r) => r.kind === 'task')).toBe(true);
  });
});
