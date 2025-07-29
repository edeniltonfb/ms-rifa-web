import '../styles/globals.css'
import Layout from 'src/components/Layout'
import PrivateRoute from 'src/components/PrivateRoute'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider } from 'src/contexts/AuthContext'
import { UIProvider } from 'src/contexts/UIProvider'
import { ToastContainer } from 'react-toastify';
import GlobalLoader from '@components/Loading'
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from 'src/contexts/AppContext'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const publicRoutes = ['/login']

  const isPublic = publicRoutes.includes(router.pathname)

  if (isPublic) {
    return (
      <AppProvider>
        <UIProvider>
          <ToastContainer position='bottom-center' />
          <GlobalLoader />
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </UIProvider>
      </AppProvider>
    )
  }

  return (
    <AppProvider>
      <UIProvider>
        <ToastContainer position='bottom-center' />
        <GlobalLoader />
        <AuthProvider>
          <PrivateRoute>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </PrivateRoute>
        </AuthProvider>
      </UIProvider>
    </AppProvider>
  )
}
