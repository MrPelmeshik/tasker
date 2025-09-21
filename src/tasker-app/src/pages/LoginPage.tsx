import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login-page.module.css';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassWidget } from '../components/common/GlassWidget';
import { GlassToggle } from '../components/ui/GlassToggle';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuth } = useAuth();
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = React.useState<string>('');
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isAuth) {
      navigate('/tasker', { replace: true });
    }
  }, [isAuth, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Введите имя (минимум 2 символа)');
      return;
    }
    if (isRegister) {
      if (password.trim().length < 4) {
        setError('Пароль слишком короткий (минимум 4 символа)');
        return;
      }
      if (password !== confirm) {
        setError('Пароли не совпадают');
        return;
      }
    }
    login(trimmed);
    navigate('/tasker');
  };

  return (
    <div className={styles.root}>
      <div className={styles.centerWrap}>
        <GlassWidget className={styles.card}>
          <div className={styles.toggleWrap}>
            <GlassToggle
              value={isRegister ? 'register' : 'login'}
              onChange={(v) => { setIsRegister(v === 'register'); setError(undefined); }}
              options={[
                { key: 'login', label: 'Вход' },
                { key: 'register', label: 'Регистрация' },
              ]}
              size="m"
              equalWidth
            />
          </div>
          <form className={styles.form} onSubmit={onSubmit}>
            <GlassInput
              fullWidth
              size="l"
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
              size="l"
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
            {isRegister && (
              <GlassInput
                fullWidth
                size="m"
                type="password"
                label="Повторите пароль"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Повторите пароль"
                autoComplete="new-password"
              />
            )}
            <GlassButton 
                size="m" 
                className={styles.submit}
                fullWidth={true}
                type="submit"
            >
                    {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </GlassButton>
          </form>
        </GlassWidget>
      </div>
    </div>
  );
};


