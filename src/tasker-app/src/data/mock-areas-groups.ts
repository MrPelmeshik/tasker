import type { Area, Group, AreaWithGroups } from '../types/area-group';

// Моковые данные для областей
export const mockAreas: Area[] = [
  {
    id: 'area-1',
    title: 'Разработка',
    description: 'Область разработки программного обеспечения',
    creatorUserId: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
    isActive: true,
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'area-2',
    title: 'Дизайн',
    description: 'UI/UX дизайн и визуальное оформление',
    creatorUserId: 'user-1',
    createdAt: '2024-01-16T11:00:00Z',
    isActive: true,
    updatedAt: '2024-01-16T11:00:00Z',
  },
  {
    id: 'area-3',
    title: 'Тестирование',
    description: 'QA и тестирование приложений',
    creatorUserId: 'user-2',
    createdAt: '2024-01-17T12:00:00Z',
    isActive: true,
    updatedAt: '2024-01-17T12:00:00Z',
  },
  {
    id: 'area-4',
    title: 'Документация',
    description: 'Техническая документация и руководства',
    creatorUserId: 'user-1',
    createdAt: '2024-01-18T13:00:00Z',
    isActive: true,
    updatedAt: '2024-01-18T13:00:00Z',
  },
];

// Моковые данные для групп
export const mockGroups: Group[] = [
  // Группы для области "Разработка"
  {
    id: 'group-1',
    title: 'Frontend',
    description: 'Клиентская часть приложения',
    areaId: 'area-1',
    creatorUserId: 'user-1',
    createdAt: '2024-01-15T10:30:00Z',
    isActive: true,
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'group-2',
    title: 'Backend',
    description: 'Серверная часть приложения',
    areaId: 'area-1',
    creatorUserId: 'user-1',
    createdAt: '2024-01-15T11:00:00Z',
    isActive: true,
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'group-3',
    title: 'DevOps',
    description: 'Развертывание и инфраструктура',
    areaId: 'area-1',
    creatorUserId: 'user-1',
    createdAt: '2024-01-15T11:30:00Z',
    isActive: true,
    updatedAt: '2024-01-15T11:30:00Z',
  },
  {
    id: 'group-4',
    title: 'Mobile',
    description: 'Мобильные приложения',
    areaId: 'area-1',
    creatorUserId: 'user-1',
    createdAt: '2024-01-15T12:00:00Z',
    isActive: true,
    updatedAt: '2024-01-15T12:00:00Z',
  },

  // Группы для области "Дизайн"
  {
    id: 'group-5',
    title: 'UI Design',
    description: 'Пользовательский интерфейс',
    areaId: 'area-2',
    creatorUserId: 'user-2',
    createdAt: '2024-01-16T11:30:00Z',
    isActive: true,
    updatedAt: '2024-01-16T11:30:00Z',
  },
  {
    id: 'group-6',
    title: 'UX Research',
    description: 'Исследование пользовательского опыта',
    areaId: 'area-2',
    creatorUserId: 'user-2',
    createdAt: '2024-01-16T12:00:00Z',
    isActive: true,
    updatedAt: '2024-01-16T12:00:00Z',
  },
  {
    id: 'group-7',
    title: 'Branding',
    description: 'Фирменный стиль и брендинг',
    areaId: 'area-2',
    creatorUserId: 'user-2',
    createdAt: '2024-01-16T12:30:00Z',
    isActive: true,
    updatedAt: '2024-01-16T12:30:00Z',
  },

  // Группы для области "Тестирование"
  {
    id: 'group-8',
    title: 'Unit Tests',
    description: 'Модульное тестирование',
    areaId: 'area-3',
    creatorUserId: 'user-3',
    createdAt: '2024-01-17T12:30:00Z',
    isActive: true,
    updatedAt: '2024-01-17T12:30:00Z',
  },
  {
    id: 'group-9',
    title: 'Integration Tests',
    description: 'Интеграционное тестирование',
    areaId: 'area-3',
    creatorUserId: 'user-3',
    createdAt: '2024-01-17T13:00:00Z',
    isActive: true,
    updatedAt: '2024-01-17T13:00:00Z',
  },
  {
    id: 'group-10',
    title: 'E2E Tests',
    description: 'End-to-end тестирование',
    areaId: 'area-3',
    creatorUserId: 'user-3',
    createdAt: '2024-01-17T13:30:00Z',
    isActive: true,
    updatedAt: '2024-01-17T13:30:00Z',
  },

  // Группы для области "Документация"
  {
    id: 'group-11',
    title: 'API Docs',
    description: 'Документация API',
    areaId: 'area-4',
    creatorUserId: 'user-1',
    createdAt: '2024-01-18T13:30:00Z',
    isActive: true,
    updatedAt: '2024-01-18T13:30:00Z',
  },
  {
    id: 'group-12',
    title: 'User Guides',
    description: 'Руководства пользователя',
    areaId: 'area-4',
    creatorUserId: 'user-1',
    createdAt: '2024-01-18T14:00:00Z',
    isActive: true,
    updatedAt: '2024-01-18T14:00:00Z',
  },
];

// Функция для получения областей с группами
export function getAreasWithGroups(): AreaWithGroups[] {
  return mockAreas.map(area => ({
    ...area,
    groups: mockGroups.filter(group => group.areaId === area.id),
  }));
}
