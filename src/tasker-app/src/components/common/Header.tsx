import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../../styles/header.module.css';
import { GlassButton } from '../ui/GlassButton';

export const Header: React.FC = () => {
  const [userName, setUserName] = React.useState<string>('Гость');
  const navigate = useNavigate();

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem('userName');
      if (stored && stored.trim().length > 0) {
        setUserName(stored);
      }
    } catch {}
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? styles.navLinkActive : styles.navLink;

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('userName');
    } catch {}
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
        </nav>
      </div>
      <div className={styles.right}>
        <div className={styles.user} title={userName}>
          <div className={styles.avatar} aria-hidden />
          <span className={styles.userName}>{userName}</span>
          {userName !== 'Гость' && (
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
