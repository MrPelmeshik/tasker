import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { GlassButton } from '../ui/GlassButton';
import { XIcon } from '../icons';
import { getCurrentUser } from '../../services/api/client';
import { areaApi } from '../../services/api/areas';
import { useAuth } from '../../context/AuthContext';
import css from '../../styles/modal.module.css';
import cabinetCss from './cabinet.module.css';
import type { UserInfo, AreaResponse } from '../../types';

/** Подписи ролей для отображения */
const ROLE_LABELS: Record<string, string> = {
  user: 'Пользователь',
  admin: 'Администратор',
};

export interface CabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CabinetModal: React.FC<CabinetModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [userRes, areasData] = await Promise.all([
          getCurrentUser(),
          areaApi.getAll(),
        ]);

        if (cancelled) return;

        if (userRes.success && userRes.data) {
          setUser(userRes.data);
        } else {
          setError(userRes.message || 'Ошибка загрузки профиля');
        }

        setAreas(Array.isArray(areasData) ? areasData : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    logout();
    /** Редирект на /login произойдёт автоматически через ProtectedRoute при isAuth=false */
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>Личный кабинет</h3>
          <div className={css.modalActions}>
            <GlassButton variant="subtle" size="xs" onClick={onClose} aria-label="Закрыть">
              <XIcon />
            </GlassButton>
          </div>
        </div>

        <div className={css.modalBody}>
          {loading ? (
            <div className={cabinetCss.loading}>Загрузка…</div>
          ) : error ? (
            <div className={cabinetCss.loading} style={{ color: 'var(--color-error, #e53e3e)' }}>{error}</div>
          ) : (
            <>
              <section className={cabinetCss.section}>
                <h4 className={cabinetCss.sectionTitle}>Профиль</h4>
                <div className={cabinetCss.profileBlock}>
                  <div className={cabinetCss.avatar} aria-hidden />
                  <div className={cabinetCss.profileFields}>
                    {user && (
                      <>
                        <div className={cabinetCss.profileRow}>
                          <span className={cabinetCss.profileLabel}>Логин</span>
                          <span className={cabinetCss.profileValue}>{user.username || '—'}</span>
                        </div>
                        <div className={cabinetCss.profileRow}>
                          <span className={cabinetCss.profileLabel}>Email</span>
                          <span className={cabinetCss.profileValue}>{user.email || '—'}</span>
                        </div>
                        <div className={cabinetCss.profileRow}>
                          <span className={cabinetCss.profileLabel}>Имя</span>
                          <span className={cabinetCss.profileValue}>{user.firstName || '—'}</span>
                        </div>
                        <div className={cabinetCss.profileRow}>
                          <span className={cabinetCss.profileLabel}>Фамилия</span>
                          <span className={cabinetCss.profileValue}>{user.lastName || '—'}</span>
                        </div>
                        {user.roles?.length ? (
                          <div className={cabinetCss.profileRow}>
                            <span className={cabinetCss.profileLabel}>Роли</span>
                            <span className={cabinetCss.profileValue}>
                              {user.roles.map(r => ROLE_LABELS[r] ?? r).join(', ')}
                            </span>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </section>

              <section className={cabinetCss.section}>
                <h4 className={cabinetCss.sectionTitle}>Мои области</h4>
                {areas.length === 0 ? (
                  <div className={cabinetCss.areaEmpty}>Нет доступных областей</div>
                ) : (
                  <ul className={cabinetCss.areasList}>
                    {areas.filter(a => a.isActive).map(area => (
                      <li key={area.id} className={cabinetCss.areaItem}>
                        {area.title}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className={cabinetCss.footer}>
                <GlassButton variant="danger" size="m" onClick={handleLogout}>
                  Выйти
                </GlassButton>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
