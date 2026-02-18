import React from 'react';
import formCss from '../../styles/modal-form.module.css';
import { UserMention } from './UserMention';
import { MetaInfoItem } from './MetaInfoItem';

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
      <MetaInfoItem
        label="Владелец"
        value={
          <UserMention userName={ownerUserName}>
            {ownerUserName}
          </UserMention>
        }
      />
    )}
    {createdAt != null && (
      <MetaInfoItem
        label="Создано"
        value={formatDateTime(createdAt)}
      />
    )}
    {updatedAt != null && (
      <MetaInfoItem
        label="Обновлено"
        value={formatDateTime(updatedAt)}
      />
    )}
  </div>
);
