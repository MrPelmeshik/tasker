import React from 'react';
import formCss from '../../styles/modal-form.module.css';
import { UserMention } from './UserMention';

export interface EntityMetaBlockProps {
  ownerUserName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  formatDateTime: (value: string | Date) => string;
}

export const EntityMetaBlock: React.FC<EntityMetaBlockProps> = ({
  ownerUserName,
  createdAt,
  updatedAt,
  formatDateTime,
}) => (
  <div className={formCss.readonlyMeta}>
    <div className={formCss.readonlyMetaTitle}>Информация</div>
    {ownerUserName && (
      <div className={formCss.readonlyMetaRow}>
        <span className={formCss.readonlyMetaLabel}>Владелец</span>
        <UserMention userName={ownerUserName} className={formCss.readonlyMetaValue}>
          {ownerUserName}
        </UserMention>
      </div>
    )}
    {createdAt != null && (
      <div className={formCss.readonlyMetaRow}>
        <span className={formCss.readonlyMetaLabel}>Дата создания</span>
        <span className={formCss.readonlyMetaValue}>{formatDateTime(createdAt)}</span>
      </div>
    )}
    {updatedAt != null && (
      <div className={formCss.readonlyMetaRow}>
        <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
        <span className={formCss.readonlyMetaValue}>{formatDateTime(updatedAt)}</span>
      </div>
    )}
  </div>
);
