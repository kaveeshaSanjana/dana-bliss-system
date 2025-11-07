import React, { useEffect } from 'react';
import Login from '@/components/Login';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, user } = useAuth();

  // If already authenticated, redirect away from /login
  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('login_redirect');
      if (redirectPath && redirectPath !== '/login') {
        sessionStorage.removeItem('login_redirect');
        window.history.pushState({}, '', redirectPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  }, [user]);

  return (
    <Login
      onLogin={() => {
        const redirectPath = sessionStorage.getItem('login_redirect');
        if (redirectPath && redirectPath !== '/login') {
          sessionStorage.removeItem('login_redirect');
          window.history.pushState({}, '', redirectPath);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
          // Default to dashboard after login
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }}
      loginFunction={login}
    />
  );
};

export default LoginPage;
