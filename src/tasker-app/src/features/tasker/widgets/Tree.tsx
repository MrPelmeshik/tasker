import React, { useState, useEffect } from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassTag } from '../../../components/ui/GlassTag';
import type { WidgetSizeProps } from '../../../types/widget-size';
import type { AreaWithGroups } from '../../../types/area-group';
import { fetchAreasWithGroups } from '../../../services/api/areas-groups';
import css from '../../../styles/tree.module.css';
import { EyeIcon } from '../../../components/icons/EyeIcon';
import { PlusIcon } from '../../../components/icons/PlusIcon';

export const Tree: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const [areasWithGroups, setAreasWithGroups] = useState<AreaWithGroups[]>([]);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchAreasWithGroups();
        setAreasWithGroups(data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleArea = (areaId: string) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
      }
      return newSet;
    });
  };

  // Обработчики для областей
  const handleCreateArea = () => {
    console.log('Создание новой области');
    // TODO: Открыть модальное окно создания области
  };

  const handleViewAreaDetails = (areaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Просмотр деталей области:', areaId);
    // TODO: Открыть модальное окно просмотра деталей области
  };

  const handleCreateGroupForArea = (areaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Создание новой группы для области:', areaId);
    // TODO: Открыть модальное окно создания группы
  };

  // Обработчики для групп
  const handleViewGroupDetails = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Просмотр деталей группы:', groupId);
    // TODO: Открыть модальное окно просмотра деталей группы
  };

  if (loading) {
    return (
      <GlassWidget title="Иерархия областей и групп" colSpan={colSpan} rowSpan={rowSpan}>
        <div className={styles.placeholder}>Загрузка...</div>
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
          {areasWithGroups.map((area) => (
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
                        {area.groups.length}
                      </GlassTag>
                      <div className={css.areaTitle}>{area.title}</div>
                    </div>
                  </div>
                  <div className={css.areaActions}>
                    <GlassButton 
                      variant="subtle"
                      size="xs"
                      onClick={(e) => handleViewAreaDetails(area.id, e)}
                    >
                      <EyeIcon />
                    </GlassButton>
                    <GlassButton 
                      variant="subtle"
                      size="xs"
                      onClick={(e) => handleCreateGroupForArea(area.id, e)}
                    >
                      <PlusIcon />
                    </GlassButton>
                  </div>
                </div>
              </div>
              
              {expandedAreas.has(area.id) && (
                <div className={css.groupsSection}>
                  {area.groups.map((group) => (
                    <div key={group.id} className={css.groupItem}>
                      <div className={css.groupCard}>
                      <div className={css.groupContent}>
                        <div className={css.groupInfo}>
                          <div className={css.groupTitle}>{group.title}</div>
                        </div>
                        <div className={css.groupActions}>
                          <GlassButton 
                            variant="subtle"
                            size="xs"
                            onClick={(e) => handleViewGroupDetails(group.id, e)}
                          >
                            <EyeIcon />
                          </GlassButton>
                        </div>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassWidget>
  );
};
