import React from 'react';
import cabinetCss from './cabinet.module.css';
import { AREA_ROLE_LABELS } from '../../utils/area-role';
import type { AreaWithRole } from './useCabinetData';

/**
 * Блок «Мои области»: список областей с ролями пользователя.
 */
export interface AreasSectionProps {
  areasWithRoles: AreaWithRole[];
}

export const AreasSection: React.FC<AreasSectionProps> = ({ areasWithRoles }) => (
  <section className={cabinetCss.section}>
    <h4 className={cabinetCss.sectionTitle}>Мои области</h4>
    {areasWithRoles.length === 0 ? (
      <div className={cabinetCss.areaEmpty}>Нет доступных областей</div>
    ) : (
      <ul className={cabinetCss.areasList}>
        {areasWithRoles.map(({ area, role }) => (
          <li key={area.id} className={cabinetCss.areaItem}>
            <span className={cabinetCss.areaTitle}>{area.title}</span>
            {role && (
              <span className={cabinetCss.areaRole}>{AREA_ROLE_LABELS[role] ?? role}</span>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);
