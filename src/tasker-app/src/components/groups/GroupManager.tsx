import React, { useState, useEffect } from 'react';
import { useAreasAndGroups } from '../../hooks/useAreasAndGroups';
import type { GroupCreateRequest, GroupUpdateRequest } from '../../types/api';

interface GroupManagerProps {
  className?: string;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ className }) => {
  const { 
    areas, 
    groups, 
    groupsLoading, 
    groupsError, 
    createGroup, 
    updateGroup,
    getGroupsByArea 
  } = useAreasAndGroups();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [formData, setFormData] = useState<GroupCreateRequest>({
    title: '',
    description: '',
    areaId: '',
  });

  // Фильтруем группы по выбранной области
  const filteredGroups = selectedAreaId ? getGroupsByArea(selectedAreaId) : groups;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.areaId) return;

    try {
      await createGroup(formData);
      setFormData({ title: '', description: '', areaId: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Ошибка создания группы:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const updateData: GroupUpdateRequest = {
        title: formData.title,
        description: formData.description,
      };
      await updateGroup(id, updateData);
      setFormData({ title: '', description: '', areaId: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Ошибка обновления группы:', error);
    }
  };

  const startEdit = (group: { id: string; title: string; description?: string; areaId: string }) => {
    setEditingId(group.id);
    setFormData({
      title: group.title,
      description: group.description || '',
      areaId: group.areaId,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', areaId: '' });
  };

  // Устанавливаем первую область по умолчанию
  useEffect(() => {
    if (areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].id);
    }
  }, [areas, selectedAreaId]);

  if (groupsLoading) {
    return <div className="p-4">Загрузка групп...</div>;
  }

  if (groupsError) {
    return <div className="p-4 text-red-600">Ошибка: {groupsError}</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Управление группами</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Создать группу
        </button>
      </div>

      {/* Фильтр по области */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Область:</label>
        <select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все области</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.title}
            </option>
          ))}
        </select>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingId) && (
        <form
          onSubmit={editingId ? (e) => handleUpdate(e, editingId) : handleCreate}
          className="p-4 border rounded-lg bg-gray-50"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Название группы *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название группы"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите описание группы"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Область *
              </label>
              <select
                value={formData.areaId}
                onChange={(e) => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingId} // Нельзя менять область при редактировании
              >
                <option value="">Выберите область</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={editingId ? cancelEdit : () => setIsCreating(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Список групп */}
      <div className="space-y-2">
        {filteredGroups.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {selectedAreaId ? 'Группы в выбранной области не найдены' : 'Группы не найдены'}
          </div>
        ) : (
          filteredGroups.map((group) => {
            const area = areas.find(a => a.id === group.areaId);
            return (
              <div
                key={group.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{group.title}</h3>
                    {group.description && (
                      <p className="text-gray-600 mt-1">{group.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Область: {area?.title || 'Неизвестно'}</span>
                      <span>Создана: {new Date(group.createdAt).toLocaleDateString()}</span>
                      <span>Обновлена: {new Date(group.updatedAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {group.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(group)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
