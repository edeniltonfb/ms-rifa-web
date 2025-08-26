// components/PrivateRoute.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from 'src/contexts/AuthContext';
import GlobalLoader from './Loading';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth();

 useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <GlobalLoader />
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
