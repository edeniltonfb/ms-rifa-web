// src/contexts/EmpresaContext.tsx (Novo arquivo)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Novo tipo (usando o mesmo que você já tem ou criando aqui)
interface SelectedTabInfo {
    id: string;
    nome: string;
}

interface EmpresaContextType {
    selectedEmpresa: SelectedTabInfo | null;
    setSelectedEmpresa: (info: SelectedTabInfo) => void;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

const SELECTED_TAB_KEY = 'selectedEmpresaInfo';

export const EmpresaProvider = ({ children }: { children: ReactNode }) => {
    // Inicializa o estado lendo do localStorage na montagem inicial
    const [selectedEmpresa, setSelectedEmpresaState] = useState<SelectedTabInfo | null>(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedItem = localStorage.getItem(SELECTED_TAB_KEY);
                return storedItem ? JSON.parse(storedItem) : null;
            } catch (error) {
                return null;
            }
        }
        return null;
    });

    // Função para atualizar o estado e o localStorage
    const updateSelectedEmpresa = (info: SelectedTabInfo) => {
        setSelectedEmpresaState(info);
        localStorage.setItem(SELECTED_TAB_KEY, JSON.stringify(info));
    };

    const contextValue = {
        selectedEmpresa,
        setSelectedEmpresa: updateSelectedEmpresa,
    };

    return (
        <EmpresaContext.Provider value={contextValue}>
            {children}
        </EmpresaContext.Provider>
    );
};

export const useEmpresaContext = () => {
    const context = useContext(EmpresaContext);
    if (!context) {
        throw new Error('useEmpresaContext deve ser usado dentro de um EmpresaProvider');
    }
    return context;
};