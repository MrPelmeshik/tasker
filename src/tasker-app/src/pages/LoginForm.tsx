import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login-page.module.css';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassWidget } from '../components/common/GlassWidget';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isSafeReturnUrl, DEFAULT_RETURN_URL } from '../utils/safe-return-url';

export interface LoginFormProps {
  returnUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ returnUrl }) => {
  const navigate = useNavigate();
  const safeReturnUrl = isSafeReturnUrl(returnUrl) ? returnUrl : DEFAULT_RETURN_URL;
  const { login, register } = useAuth();
  const { showError, addInfo } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [errorDetails, setErrorDetails] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const clearError = () => {
    setError(undefined);
    setErrorDetails(undefined);
  };

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

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    clearError();
    try {
      if (isRegister) {
        await register({
          username: trimmed,
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          confirmPassword: confirm,
        });
      } else {
        await login(trimmed, password);
      }
      if (returnUrl && !isSafeReturnUrl(returnUrl)) {
        addInfo('Некорректная ссылка возврата. Вы перенаправлены на главную.');
      }
      navigate(safeReturnUrl);
    } catch (err) {
      setError('Серверная ошибка');
      setErrorDetails(err instanceof Error ? err.message : 'Ошибка входа');
      showError(err);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <GlassWidget className={styles.card}>
      <div className={styles.toggleWrap}>
        <GlassButton
          toggleGroup
          variant="subtle"
          value={isRegister ? 'register' : 'login'}
          onChange={(v) => {
            setIsRegister(v === 'register');
            clearError();
          }}
          options={[
            { key: 'login', label: 'Вход' },
            { key: 'register', label: 'Регистрация' },
          ]}
          size="s"
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
          onFocus={clearError}
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
          fullWidth
          type="submit"
          disabled={loading}
        >
          {loading ? 'Входим…' : isRegister ? 'Зарегистрироваться' : 'Войти'}
        </GlassButton>
      </form>
    </GlassWidget>
  );
};
