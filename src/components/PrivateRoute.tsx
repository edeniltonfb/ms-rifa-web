// components/PrivateRoute.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAppContext } from 'src/contexts/AppContext'
import { useAuth } from 'src/contexts/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { hideLoader } = useAppContext();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else {
      hideLoader()
    }
  }, [router])

  return <>{children}</>
}
