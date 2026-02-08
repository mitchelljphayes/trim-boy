import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--gb-lightest))]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--gb-darkest))] mb-2">
            LOADING...
          </div>
          <div className="w-32 h-2 bg-[hsl(var(--gb-dark))] mx-auto">
            <div className="h-full bg-[hsl(var(--gb-darkest))] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
