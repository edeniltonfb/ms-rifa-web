import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'src/lib/axios'

interface Empresa {
  id: number
  nome: string
  grupoEmpresaId: number
  ativa: string
}

interface User {
  userId: number
  login: string
  name: string
  token: string
  profile: string
  senhaAlterada: boolean
  empresaList: Empresa[]
}

interface AuthContextType {
  user: User | null
  login: (login: string, password: string) => Promise<boolean>
  logout: () => void
  validateToken: () => Promise<boolean>
  changePassword: (senhaAtual: string, novaSenha: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/login', { login, password })
      if (response.data.success) {
        const userData = response.data.data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.token)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = () => {
    axios.post('/logout', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).catch(() => {})
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      const response = await axios.post('/validar', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data.success
    } catch {
      return false
    }
  }

  const changePassword = async (senhaAtual: string, novaSenha: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/alterarSenha', {
        senhaAtual,
        novaSenha,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data.success
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, validateToken, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}