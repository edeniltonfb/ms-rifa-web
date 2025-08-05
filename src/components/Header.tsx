// Header.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation' // Importe usePathname

interface HeaderProps {
  toggleSidebar: () => void;
  // A prop 'title' não é mais necessária se o título for determinado pela rota
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const pathname = usePathname(); // Obtenha o caminho da URL atual

  // Defina um mapeamento de rotas para títulos
  const getPageTitle = (path: string) => {

    if(path?.startsWith('/rifamodelo/')){
        return 'Modelo';
    }

    if(path?.startsWith('/rifa/')){
        return 'Rifa';
    }

    switch (path) {
      case '/':
        return 'Dashboard';
      case '/cobradores':
        return 'Lista de Cobradores';
      case '/cobradores/edit':
        return 'Manter Cobrador';
      case '/clientes':
        return 'Lista de Clientes';
      case '/EnvioParaImpressao':
        return 'Enviar para Impressão'; 
        case '/resultado':
        return 'Resultado';
      default:
        return 'Páginas'; // Título padrão para rotas não mapeadas
    }
  };

  const currentTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[#03163f] text-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="text-white"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        {/* Use o título dinâmico aqui */}
        <h1 className="text-lg font-semibold text-white">{currentTitle}</h1>
      </div>


    </header>
  );
}
