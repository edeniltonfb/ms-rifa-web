// Sidebar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Settings, ChevronDown, ChevronRight, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}) {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)
  const [userName, setUserName] = useState('')
  const [userProfile, setUserProfile] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    }

    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      setUserName(parsed.name || '')
      setUserProfile(parsed.profile || '')
    }
  }, [])

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    setDarkMode(isDark)
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  const hasAccess = (roles: string[]) => roles.includes(userProfile)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 bg-gray-900 text-white shadow-lg
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">MS-Admin</h2>
          <p className="text-sm text-gray-400 mt-1">Olá, {userName}</p>
        </div>

        <nav className="mt-4 space-y-1">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`
              flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors
              ${pathname === '/' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
            `}
          >
            <Home size={18} />
            Início
          </Link>

          {hasAccess(['ADMIN']) && (
            <Link
              href="/usuarios"
              onClick={handleLinkClick}
              className={`
                flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors
                ${pathname === '/usuarios' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <Users size={18} />
              Usuários
            </Link>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Configurações
            </span>
            {showSettings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <AnimatePresence initial={false}>
            {showSettings && (
              <motion.div
                className="pl-10 space-y-1"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/configuracoes/perfil"
                  onClick={handleLinkClick}
                  className={`
                    block text-sm py-1 text-gray-400 hover:text-white
                    ${pathname === '/configuracoes/perfil' ? 'text-white' : ''}
                  `}
                >
                  Perfil
                </Link>
                <Link
                  href="/configuracoes/sistema"
                  onClick={handleLinkClick}
                  className={`
                    block text-sm py-1 text-gray-400 hover:text-white
                    ${pathname === '/configuracoes/sistema' ? 'text-white' : ''}
                  `}
                >
                  Sistema
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-400">Tema</span>
          <button
            onClick={toggleDarkMode}
            className="text-gray-400 hover:text-white"
            title="Alternar tema"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </aside>
    </>
  )
}
