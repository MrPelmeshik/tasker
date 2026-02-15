import React from 'react';
import { Popover } from '../ui/Popover';
import { UserCard } from './UserCard';
import type { UserInfo } from '../../types';
import styles from '../../styles/user-mention.module.css';

export type UserMentionProps = {
  /** Имя пользователя для отображения и карточки */
  userName: string;
  /** Полные данные пользователя (если есть) */
  user?: UserInfo | null;
  /** Позиция всплывающей карточки */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Дочерние элементы — текст/разметка упоминания (по умолчанию userName) */
  children?: React.ReactNode;
  /** Дополнительный класс для обёртки упоминания */
  className?: string;
};

/**
 * Упоминание пользователя с всплывающей карточкой при наведении.
 * Оборачивает переданный контент (или имя) в триггер Popover с UserCard.
 */
export const UserMention: React.FC<UserMentionProps> = ({
  userName,
  user,
  placement = 'top',
  children,
  className,
}) => {
  const triggerContent = children ?? userName;
  const displayName = userName.trim() || '—';

  return (
    <Popover
      placement={placement}
      content={<UserCard userName={displayName} user={user} />}
      className={styles.popoverPanel}
    >
      <span className={`${styles.mention} ${className ?? ''}`.trim()}>
        {triggerContent}
      </span>
    </Popover>
  );
};
