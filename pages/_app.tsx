import '../styles/globals.css'
import Layout from 'components/Layout'
import PrivateRoute from 'components/PrivateRoute'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const publicRoutes = ['/login']

  const isPublic = publicRoutes.includes(router.pathname)

  if (isPublic) {
    return <Component {...pageProps} />
  }

  return (
    <PrivateRoute>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PrivateRoute>
  )
}
