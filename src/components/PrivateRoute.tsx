// components/PrivateRoute.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppContext } from 'src/contexts/AppContext'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { loading, hideLoader } = useAppContext();

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
    } else {
      hideLoader()
    }
  }, [router])

  if (loading) return null

  return <>{children}</>
}
