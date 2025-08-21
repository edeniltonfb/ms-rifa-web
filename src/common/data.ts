export interface ApiResult {
    success: boolean;
    errorMessage?: string;
    data?: any;
}

export const horarios = [
  { label: 'Federal', value: 'FED' },
  { label: '19hs Bahia', value: '19B' }
]

export const faixas = [
    { label: '1º ao 5º', value: '1-5', quantidade: 5, inicial: 1 },
    { label: '6º ao 10º', value: '6-10', quantidade: 5, inicial: 6 }
]

export const situacoes = [
    { label: 'Indefinido', value: 'IND' },
    { label: 'Vendido', value: 'VDD' },
    { label: 'Não Vendido', value: 'NVD' },
    { label: 'Não Pago', value: 'NPG' }
]

export interface RifaModelo {
    id: number
    tipo: string
    descricao: string
    quantidadeServas: number
    quantidadeDigitos: number
}

export interface Serva {
    rifaModeloId: number
    numero: string
}

export interface IdLabel {
    id: number
    label: string
}

export interface AppContextType {

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

export interface Rifa {
    rifaId: number
    empresa: string
    data: string
    horario: string
    itemPremiacaoList: {
        numero: string
        talao: string
        vendedor: string
        ordem: number
        descricao: string
        cidadeApostador:string
        cidadeVendedor:string
        situacao:string
    }[]
}

export interface CadastroResultado {
    data: string
    horario: string
    [key: string]: string | number
}


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