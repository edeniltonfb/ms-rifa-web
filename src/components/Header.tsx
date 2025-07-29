// Header.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation' // Importe usePathname
import { useAuth } from 'src/contexts/AuthContext'

interface HeaderProps {
  toggleSidebar: () => void;
  // A prop 'title' não é mais necessária se o título for determinado pela rota
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter(); // Mantenha se o botão de sair usa router.push
  const { logout } = useAuth(); // Mantenha se ainda for relevante
  const pathname = usePathname(); // Obtenha o caminho da URL atual

  // Defina um mapeamento de rotas para títulos
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/cobradores':
        return 'Lista de Cobradores';
      case '/cobradores/edit':
        return 'Manter Cobrador';
      case '/clientes':
        return 'Lista de Clientes';
      default:
        return 'Página'; // Título padrão para rotas não mapeadas
    }
  };

  const currentTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="text-gray-700 dark:text-white"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        {/* Use o título dinâmico aqui */}
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{currentTitle}</h1>
      </div>

      {/* Exemplo de botão de Sair, ajuste conforme sua necessidade */}
      <button
        onClick={logout}
        className="text-sm text-red-500 hover:underline"
      >
        Sair
      </button>
    </header>
  );
}
