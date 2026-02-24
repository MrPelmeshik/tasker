import React from 'react';
import type { UserInfo } from '../../types';
import styles from '../../styles/user-card.module.css';

/**
 * Возвращает инициалы для аватара (первые буквы слов или первые 2 символа).
 */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export type UserCardProps = {
  /** Отображаемое имя пользователя (обязательно) */
  userName: string;
  /** Полные данные пользователя — если есть, показываются email, имя и фамилия */
  user?: UserInfo | null;
};

/**
 * Карточка пользователя для отображения во всплывающей подсказке.
 * Показывает аватар с инициалами, имя и при наличии — email, имя и фамилию.
 */
export const UserCard: React.FC<UserCardProps> = React.memo(({ userName, user }) => {
  const displayName = userName.trim() || '—';
  const initials = getInitials(displayName);

  const hasDetails = user && (user.email || user.firstName || user.lastName);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden>
          {initials}
        </div>
        <span className={styles.name}>{displayName}</span>
      </div>
      {hasDetails && (
        <div className={styles.details}>
          {user!.firstName && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Имя</span>
              <span className={styles.detailValue}>{user!.firstName}</span>
            </div>
          )}
          {user!.lastName && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Фамилия</span>
              <span className={styles.detailValue}>{user!.lastName}</span>
            </div>
          )}
          {user!.email && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{user!.email}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
