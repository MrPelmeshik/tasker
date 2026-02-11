import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../../styles/header.module.css';
import { GlassButton } from '../ui/GlassButton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '../icons';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { userName, isAuth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <NavLink to="/tasker" className={styles.brand}>
          Tasker
        </NavLink>
        <nav className={styles.nav}>
            <GlassButton 
              size="l"
              onClick={() => navigate('/tasker')}
            >
              Задачник
            </GlassButton>
            <GlassButton 
              size="l"
              onClick={() => navigate('/management')}
            >
              Управление
            </GlassButton>
        </nav>
      </div>
      <div className={styles.right}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
          aria-label="Переключить тему"
        >
          {theme === 'dark' ? <SunIcon className={styles.themeIcon} /> : <MoonIcon className={styles.themeIcon} />}
        </button>
        <div className={styles.user} title={userName ?? 'Гость'}>
          <div className={styles.avatar} aria-hidden />
          <span className={styles.userName}>{userName ?? 'Гость'}</span>
          {isAuth && (
            <GlassButton 
              size="s" 
              onClick={handleLogout}
            >
              Выйти
            </GlassButton>
          )}
        </div>
      </div>
    </header>
  );
};
