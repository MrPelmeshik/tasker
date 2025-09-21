import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login-page.module.css';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassWidget } from '../components/common/GlassWidget';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<string | undefined>();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Введите имя (минимум 2 символа)');
      return;
    }
    try {
      window.localStorage.setItem('userName', trimmed);
    } catch {}
    navigate('/tasker');
  };

  return (
    <div className={styles.root}>
      <div className={styles.centerWrap}>
        <GlassWidget title="Вход" className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            <GlassInput
              fullWidth
              size="m"
              label="Имя пользователя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Алексей"
              errorText={error}
              onFocus={() => setError(undefined)}
              autoFocus
              autoComplete="username"
            />
            <GlassInput
              fullWidth
              size="m"
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
            <GlassButton size="m" className={styles.submit}>Войти</GlassButton>
          </form>
        </GlassWidget>
      </div>
    </div>
  );
};


