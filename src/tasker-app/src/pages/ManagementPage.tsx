import React, { useState } from 'react';
import { AreaManager } from '../components/areas';
import { GroupManager } from '../components/groups';

export const ManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'areas' | 'groups'>('areas');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление областями и группами
          </h1>
          <p className="text-gray-600">
            Создавайте и управляйте областями и группами для организации ваших задач
          </p>
        </div>

        {/* Табы */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('areas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'areas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Области
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'groups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Группы
              </button>
            </nav>
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'areas' && <AreaManager className="p-6" />}
          {activeTab === 'groups' && <GroupManager className="p-6" />}
        </div>
      </div>
    </div>
  );
};
