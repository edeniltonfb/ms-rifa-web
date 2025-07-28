// components/PrivateRoute.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) return null // ou loading spinner

  return <>{children}</>
}
