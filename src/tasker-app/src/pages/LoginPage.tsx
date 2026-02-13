import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login-page.module.css';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassWidget } from '../components/common/GlassWidget';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiErrorMessage } from '../utils/parse-api-error';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuth } = useAuth();
  const { addError } = useToast();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = React.useState<string>('');
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [errorDetails, setErrorDetails] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const clearError = () => {
    setError(undefined);
    setErrorDetails(undefined);
  }

  useEffect(() => {
    if (isAuth) {
      navigate('/tasker', { replace: true });
    }
  }, [isAuth, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Введите имя (минимум 2 символа)');
      return;
    }
    if (isRegister) {
      if (password.trim().length < 8) {
        setError('Пароль слишком короткий (минимум 8 символов)');
        return;
      }
      if (password !== confirm) {
        setError('Пароли не совпадают');
        return;
      }
      if (!email.trim()) {
        setError('Введите email');
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        setError('Введите имя и фамилию');
        return;
      }
    }

    try {
      setLoading(true);
      clearError();
      if (isRegister) {
        await register({
          username: trimmed,
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password: password,
          confirmPassword: confirm,
        });
      } else {
        await login(trimmed, password);
      }
      navigate('/tasker');
    } catch (err) {
      setError('Серверная ошибка');
      setErrorDetails(err instanceof Error ? err.message : 'Ошибка входа');
      addError(parseApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.centerWrap}>
        <GlassWidget className={styles.card}>
          <div className={styles.toggleWrap}>
            <GlassButton
              toggleGroup
              value={isRegister ? 'register' : 'login'}
              onChange={(v) => { setIsRegister(v === 'register'); clearError(); }}
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
              label="Имя пользователя или email"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: alex@example.com"
              errorText={error}
              errorDetails={errorDetails}
              onFocus={() => clearError()}
              autoFocus
              autoComplete="username"
            />
            {isRegister && (
              <>
                <GlassInput
                  fullWidth
                  size="m"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  autoComplete="email"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  label="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введите имя"
                  autoComplete="given-name"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  label="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введите фамилию"
                  autoComplete="family-name"
                />
              </>
            )}
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
                disabled={loading}
            >
                    {loading ? 'Входим…' : isRegister ? 'Зарегистрироваться' : 'Войти'}
            </GlassButton>
          </form>
        </GlassWidget>
      </div>
    </div>
  );
};


