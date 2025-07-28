import '../styles/globals.css'
import Layout from 'src/components/Layout'
import PrivateRoute from 'src/components/PrivateRoute'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider } from 'src/contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const publicRoutes = ['/login']

  const isPublic = publicRoutes.includes(router.pathname)

  if (isPublic) {
    return
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  }

  return (
    <AuthProvider>
      <PrivateRoute>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PrivateRoute>
    </AuthProvider>
  )
}
