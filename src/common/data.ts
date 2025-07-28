export interface ApiResult {
    success: boolean;
    errorMessage?: string;
    data?: any;
}

export interface Sorteio {
    id: number;
    dataSorteio: string;
    situacaoId: number;
    situacao: string;
    valorBilhete: number;
    titulo: string;
    tipo: string;
    subtipo: string;
    horario: string;
    imageUrl: string;
    premiacaoList: Premiacao[];
    sorteio?: number;
}

export interface ApostaPremiada {
    bilheteId: number;
    bolaoId: number;
    sequencial: number;
    valorPremio: string;
    tipo: string;
    nome: string;
    telefone: string;
    cidade: string;
    rota: string;
    cambista: string;
    dataHoraCompra: string;
}

export interface ClienteData {
    nome: string;
    telefone: string;
    cidade: string;
}

export interface Arquivo {
    sequencial: number;
    descricao: string;
    tipo: string;
    link: string;
    linkClassificacao: string;
    atualizacaoDataHora: string;
}

export interface Aposta {
    bilheteId: number;
    nome: string;
    telefone?:string;
    cidade?:string;
    dataHora: string;
    quantidade: number;
    valor: number;
    link?: string;
    numeros: string[];
}

export interface Extrato {
    vendasRealizadas: number;
    apostasRegistradas: number;
    arrecadacao: number;
    comissao: number;
    valorLiquido: number;
    apostas: Aposta[];
}

export interface Importacao {
    id: number;
    cambista: string;
    quantidade: number;
    atualizacaoDataHora: string;
    apostas: Aposta[];
}

export interface AppContextType {
    sorteio: Sorteio | null;
    setSorteio: (sorteio: Sorteio | null) => void;

    loading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
}

export interface Premiacao {
    ordem: number;
    descricao: string;
}

export type Resultado = {
    horario: string;
    _1Premio: string;
    _2Premio: string;
    _3Premio: string;
    _4Premio: string;
    _5Premio: string;
    bolaoId: number;
    resultadoId: number;
    tmAtu: number;
    processado: boolean;
    data: string;
};

export interface Cambista {
    id: number;
    nome: string;
    ativo: boolean;
    comissao: number;
    email: string;
    whatsapp: string;
    rotaId: number;
}

export interface Rota {
    id: number;
    nome: string;
}

export type ExtratoVendaCambistaTO = {
    cambista: string;
    vendasRealizadas: number;
    apostasRegistradas: number;
    arrecadacao: number;
    comissao: number;
    valorLiquido: number;
};

export type ExtratoVendaRotaTO = {
    rota: string;
    vendasRealizadas: number;
    apostasRegistradas: number;
    arrecadacao: number;
    comissaoRota: number;
    comissaoCambista: number;
    valorLiquido: number;
    extratoCambistaList: ExtratoVendaCambistaTO[];
};

export type ExtratoVendaAdminTO = {
    vendasRealizadas: number;
    apostasRegistradas: number;
    arrecadacao: number;
    comissaoRota: number;
    comissaoCambista: number;
    valorLiquido: number;
    extratoRotaList: ExtratoVendaRotaTO[];
};



export interface User {
    login: string;
    name: string;
    token: string;
    profile: string;
    userId: number;
    senhaAlterada: boolean;
}

export interface AuthResponse {
    data?: AuthData;
    success: boolean;
    errorMessage?: string;
}

export interface AuthData {
    login: string;
    name: string;
    token: string;
    profile: string;
    userId: number;
    senhaAlterada: boolean;
}

export interface EmptyResponse {
    success: boolean;
    errorMessage?: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    profile?: string;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    validateToken: () => Promise<boolean>;
    isLoading: boolean;
    senhaAlterada: boolean;
}

export interface OptionType {
    value: string; // nome da cidade
    label: string; // nome + UF
}

export type CidadeIBGE = {
    id: number;
    nome: string;
    microrregiao: {
        mesorregiao: {
            UF: {
                sigla: string;
            };
        };
    };
};