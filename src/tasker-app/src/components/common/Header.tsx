import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../../styles/header.module.css';
import { GlassButton } from '../ui/GlassButton';
import { Tooltip } from '../ui/Tooltip';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '../icons';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { userName, isAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <NavLink to="/tasker" className={styles.brand}>
          Tasker
        </NavLink>
        <nav className={styles.nav}>
            <GlassButton
              variant="subtle"
              size="s"
              onClick={() => navigate('/tasker')}
            >
              Задачник
            </GlassButton>
            <GlassButton
              variant="subtle"
              size="s"
              onClick={() => navigate('/management')}
            >
              Управление
            </GlassButton>
        </nav>
      </div>
      <div className={styles.right}>
        <Tooltip content={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'} placement="bottom" size="s">
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <SunIcon className={styles.themeIcon} /> : <MoonIcon className={styles.themeIcon} />}
          </button>
        </Tooltip>
        {isAuth ? (
          <UserMenu userName={userName} />
        ) : (
          <Tooltip content={userName ?? 'Гость'} placement="bottom" size="s">
            <div className={styles.user}>
              <div className={styles.avatar} aria-hidden />
              <span className={styles.userName}>{userName ?? 'Гость'}</span>
            </div>
          </Tooltip>
        )}
      </div>
    </header>
  );
};
