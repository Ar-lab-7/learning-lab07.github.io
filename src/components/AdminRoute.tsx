
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import LoginForm from './LoginForm';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const isLoggedIn = AuthService.isAdminLoggedIn();

  if (!isLoggedIn) {
    // Show the login form directly instead of redirecting
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="w-full max-w-md">
          <LoginForm redirectPath={window.location.pathname} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
