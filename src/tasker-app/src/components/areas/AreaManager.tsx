import React, { useState } from 'react';
import { useAreas } from '../../hooks/useAreasAndGroups';
import type { AreaCreateRequest, AreaUpdateRequest } from '../../types/api';

interface AreaManagerProps {
  className?: string;
}

export const AreaManager: React.FC<AreaManagerProps> = ({ className }) => {
  const { areas, loading, error, createArea, updateArea } = useAreas();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AreaCreateRequest>({
    title: '',
    description: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await createArea(formData);
      setFormData({ title: '', description: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Ошибка создания области:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await updateArea(id, formData);
      setFormData({ title: '', description: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Ошибка обновления области:', error);
    }
  };

  const startEdit = (area: { id: string; title: string; description?: string }) => {
    setEditingId(area.id);
    setFormData({
      title: area.title,
      description: area.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
  };

  if (loading) {
    return <div className="p-4">Загрузка областей...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Ошибка: {error}</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Управление областями</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Создать область
        </button>
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
                Название области *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название области"
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
                placeholder="Введите описание области"
                rows={3}
              />
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

      {/* Список областей */}
      <div className="space-y-2">
        {areas.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Области не найдены
          </div>
        ) : (
          areas.map((area) => (
            <div
              key={area.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{area.title}</h3>
                  {area.description && (
                    <p className="text-gray-600 mt-1">{area.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Создана: {new Date(area.createdAt).toLocaleDateString()}</span>
                    <span>Обновлена: {new Date(area.updatedAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      area.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {area.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(area)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
