import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../../utils/auth';

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = getAccessToken();

  // 如果当前在登录页面，且有token，则重定向到首页
  if (location.pathname === '/login' && token) {
    return <Navigate to="/" replace />;
  }

  // 如果不在登录页面，且没有token，则重定向到登录页
  if (location.pathname !== '/login' && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute; 