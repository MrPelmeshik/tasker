import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import styles from '../../styles/user-menu.module.css';

type UserMenuProps = {
  userName: string | null;
};

/**
 * Выпадающее меню пользователя с пунктами «Личный кабинет» и «Выход».
 */
export const UserMenu: React.FC<UserMenuProps> = ({ userName }) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const { openCabinetModal } = useModal();
  const navigate = useNavigate();

  const handleCabinet = () => {
    openCabinetModal();
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const trigger = (
    <div className={styles.user}>
      <div className={styles.avatar} aria-hidden />
      <span className={styles.userName}>{userName ?? 'Гость'}</span>
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      placement="bottom"
    >
      <div className={styles.menu}>
        <button
          type="button"
          className={styles.item}
          onClick={handleCabinet}
          role="menuitem"
        >
          Личный кабинет
        </button>
        <button
          type="button"
          className={`${styles.item} ${styles.itemDanger}`}
          onClick={handleLogout}
          role="menuitem"
        >
          Выход
        </button>
      </div>
    </Dropdown>
  );
};
