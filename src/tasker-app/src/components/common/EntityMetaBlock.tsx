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
  <div className={formCss.inlineMeta}>
    {ownerUserName && (
      <div className={formCss.inlineMetaItem}>
        <span>Владелец</span>
        <UserMention userName={ownerUserName} className={formCss.inlineMetaValue}>
          {ownerUserName}
        </UserMention>
      </div>
    )}
    {createdAt != null && (
      <div className={formCss.inlineMetaItem}>
        <span>Создано</span>
        <span className={formCss.inlineMetaValue}>{formatDateTime(createdAt)}</span>
      </div>
    )}
    {updatedAt != null && (
      <div className={formCss.inlineMetaItem}>
        <span>Обновлено</span>
        <span className={formCss.inlineMetaValue}>{formatDateTime(updatedAt)}</span>
      </div>
    )}
  </div>
);
