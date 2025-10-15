'use client'

import Sidebar from './Sidebar'
import Header from './Header'
import { useState } from 'react'
import { EmpresaProvider } from 'src/contexts/EmpresaContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <EmpresaProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className={`flex flex-col flex-1 transition-all ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <Header toggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </EmpresaProvider>
  )
}
