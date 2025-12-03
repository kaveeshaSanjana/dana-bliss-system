import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { accessToken, user } = useUserRole();

  useEffect(() => {
    // Redirect to login if no access token or user
    if (!accessToken || !user) {
      navigate('/', { replace: true });
    }
  }, [accessToken, user, navigate]);

  // Show loading while checking authentication
  if (!accessToken || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
