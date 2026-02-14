import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/login-page.module.css';
import { LoginForm } from './LoginForm';
import { useAuth } from '../context/AuthContext';
import { isSafeReturnUrl, DEFAULT_RETURN_URL } from '../utils/safe-return-url';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? undefined;
  const safeReturnUrl = isSafeReturnUrl(returnUrl) ? returnUrl : DEFAULT_RETURN_URL;
  const { isAuth } = useAuth();

  useEffect(() => {
    if (isAuth) {
      navigate(safeReturnUrl, { replace: true });
    }
  }, [isAuth, navigate, safeReturnUrl]);

  return (
    <div className={styles.root}>
      <div className={styles.centerWrap}>
        <LoginForm returnUrl={returnUrl} />
      </div>
    </div>
  );
};
