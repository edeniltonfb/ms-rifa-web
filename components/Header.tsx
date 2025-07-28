'use client'

import { useRouter } from 'next/router'

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="text-gray-700 dark:text-white"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard</h1>
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-red-500 hover:underline"
      >
        Sair
      </button>
    </header>
  )
}
