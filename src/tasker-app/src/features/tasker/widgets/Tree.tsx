import React, { useState, useEffect } from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassTag } from '../../../components/ui/GlassTag';
import { useModal } from '../../../context';
import type { 
  WidgetSizeProps, 
  AreaShortCard, 
  GroupSummary,
  AreaResponse, 
  GroupResponse, 
  AreaCreateRequest, 
  AreaUpdateRequest, 
  GroupCreateRequest, 
  GroupUpdateRequest 
} from '../../../types';
import { 
  fetchAreaShortCard, 
  fetchAreaById, 
  createArea, 
  updateArea,
  fetchGroupShortCardByAreaForTree, 
  fetchGroupById, 
  createGroup, 
  updateGroup 
} from '../../../services/api';
import css from '../../../styles/tree.module.css';
import { EyeIcon, PlusIcon } from '../../../components/icons';

export const Tree: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { openAreaModal, openGroupModal } = useModal();
  const [areas, setAreas] = useState<AreaShortCard[]>([]);
  const [groupsByArea, setGroupsByArea] = useState<Map<string, GroupSummary[]>>(new Map());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState<Set<string>>(new Set());


  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoading(true);
        const data = await fetchAreaShortCard();
        setAreas(data);
        console.log('Области загружены успешно:', data);
      } catch (error) {
        console.error('Ошибка загрузки областей:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const toggleArea = async (areaId: string) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
        // Загружаем группы для области, если их еще нет
        if (!groupsByArea.has(areaId)) {
          loadGroupsForArea(areaId);
        }
      }
      return newSet;
    });
  };

  const loadGroupsForArea = async (areaId: string) => {
    try {
      setLoadingGroups(prev => new Set(prev).add(areaId));
      const groups = await fetchGroupShortCardByAreaForTree(areaId);
      setGroupsByArea(prev => new Map(prev).set(areaId, groups));
      console.log(`Группы для области ${areaId} загружены:`, groups);
    } catch (error) {
      console.error(`Ошибка загрузки групп для области ${areaId}:`, error);
      setGroupsByArea(prev => new Map(prev).set(areaId, []));
    } finally {
      setLoadingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(areaId);
        return newSet;
      });
    }
  };

  // Обработчики для областей
  const handleCreateArea = () => {
    openAreaModal(null, 'create', handleAreaSave);
  };

  const handleViewAreaDetails = async (areaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const area = await fetchAreaById(areaId);
      if (area) {
        openAreaModal(area, 'edit', handleAreaSave);
      }
    } catch (error) {
      console.error('Ошибка загрузки области:', error);
    }
  };

  const handleCreateGroupForArea = (areaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const areasForModal = areas.map(area => ({
      id: area.id,
      title: area.title,
      description: area.description,
      creatorUserId: '',
      createdAt: '',
      updatedAt: '',
      isActive: true,
    }));
    openGroupModal(null, 'create', areasForModal, handleGroupSave, areaId);
  };

  // Обработчики для групп
  const handleViewGroupDetails = async (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const group = await fetchGroupById(groupId);
      if (group) {
        const areasForModal = areas.map(area => ({
          id: area.id,
          title: area.title,
          description: area.description,
          creatorUserId: '',
          createdAt: '',
          updatedAt: '',
          isActive: true,
        }));
        openGroupModal(group, 'edit', areasForModal, handleGroupSave);
      }
    } catch (error) {
      console.error('Ошибка загрузки группы:', error);
    }
  };

  // Обработчики сохранения
  const handleAreaSave = async (data: any) => {
    try {
      // Определяем режим по наличию ID в данных
      const isCreate = !data.id;
      
      if (isCreate) {
        await createArea(data as AreaCreateRequest);
      } else {
        await updateArea(data.id, data as AreaUpdateRequest);
      }
      
      // Перезагружаем список областей
      const updatedAreas = await fetchAreaShortCard();
      setAreas(updatedAreas);
    } catch (error) {
      console.error('Ошибка сохранения области:', error);
      throw error;
    }
  };

  const handleGroupSave = async (data: any) => {
    try {
      // Определяем режим по наличию ID в данных
      const isCreate = !data.id;
      
      if (isCreate) {
        await createGroup(data as GroupCreateRequest);
        // Перезагружаем группы для соответствующей области
        const areaId = data.areaId;
        if (areaId) {
          const updatedGroups = await fetchGroupShortCardByAreaForTree(areaId);
          setGroupsByArea(prev => new Map(prev).set(areaId, updatedGroups));
        }
      } else {
        await updateGroup(data.id, data as GroupUpdateRequest);
        // Перезагружаем группы для соответствующей области
        const areaId = data.areaId;
        if (areaId) {
          const updatedGroups = await fetchGroupShortCardByAreaForTree(areaId);
          setGroupsByArea(prev => new Map(prev).set(areaId, updatedGroups));
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения группы:', error);
      throw error;
    }
  };



  if (loading) {
    return (
      <GlassWidget title="Иерархия областей и групп" colSpan={colSpan} rowSpan={rowSpan}>
        <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
      </GlassWidget>
    );
  }

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.tree}>
        <div className={css.widgetHeader}>
          <h3 className={css.widgetTitle}>Дерево</h3>
          <GlassButton 
            variant="subtle"
            size="xs"
            onClick={handleCreateArea}
          >
            Cоздать область
          </GlassButton>
        </div>

        <div className={css.widgetContent}>
          {areas.length === 0 ? (
            <div className={glassWidgetStyles.placeholder}>
              Нет доступных областей
            </div>
          ) : (
            areas.map((area) => (
            <div key={area.id} className={css.areaSection}>
              <div 
                className={`${css.areaCard} ${expandedAreas.has(area.id) ? css.expanded : ''}`}
                onClick={() => toggleArea(area.id)}
              >
                <div className={css.areaContent}>
                  <div className={css.areaInfo}>
                    <div className={css.areaTitleRow}>
                      <GlassTag 
                        variant="subtle" 
                        size="xs"
                        className={css.areaGroupsCount}
                      >
                        {area.groupsCount}
                      </GlassTag>
                      <div className={css.areaTitle}>{area.title}</div>
                    </div>
                  </div>
                  <div className={css.areaActions}>
                    <GlassButton 
                      variant="subtle"
                      size="xs"
                      onClick={(e: React.MouseEvent) => handleViewAreaDetails(area.id, e)}
                    >
                      <EyeIcon />
                    </GlassButton>
                    <GlassButton 
                      variant="subtle"
                      size="xs"
                      onClick={(e: React.MouseEvent) => handleCreateGroupForArea(area.id, e)}
                    >
                      <PlusIcon />
                    </GlassButton>
                  </div>
                </div>
              </div>
              
              {expandedAreas.has(area.id) && (
                <div className={css.groupsSection}>
                  {loadingGroups.has(area.id) ? (
                    <div className={glassWidgetStyles.placeholder}>Загрузка групп...</div>
                  ) : (
                    (() => {
                      const groups = groupsByArea.get(area.id) || [];
                      return groups.length === 0 ? (
                        <div className={glassWidgetStyles.placeholder}>Нет групп в этой области</div>
                      ) : (
                        groups.map((group) => (
                          <div key={group.id} className={css.groupItem}>
                            <div className={css.groupCard}>
                              <div className={css.groupContent}>
                                <div className={css.groupInfo}>
                                  <div className={css.groupTitle}>{group.title}</div>
                                  {group.description && (
                                    <div className="text-sm text-gray-600 mt-1">{group.description}</div>
                                  )}
                                </div>
                                <div className={css.groupActions}>
                                  <GlassButton 
                                    variant="subtle"
                                    size="xs"
                                    onClick={(e: React.MouseEvent) => handleViewGroupDetails(group.id, e)}
                                  >
                                    <EyeIcon />
                                  </GlassButton>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          ))
          )}
        </div>
      </div>
    </GlassWidget>
  );
};
