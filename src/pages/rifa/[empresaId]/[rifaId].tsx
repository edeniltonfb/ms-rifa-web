// RifaPage.tsx - Tela principal da Rifa
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card } from '@components/ui/card'
import { Button } from '@components/ui/button'
import instance from '@lib/axios'
import { toast } from 'react-toastify'
import CustomSelect from '@components/CustomCombobox'
import { Separator } from '@components/ui/separator'
import { useRouter } from 'next/router'
import { SingleValue } from 'react-select'
import { useAppContext } from 'src/contexts/AppContext'
import { useBilhetesFetcher } from '@hooks/useBilhetesFetcher'
import DynamicBilheteResult from '@components/DynamicBilheteResult'
import Link from 'next/link'
import { CheckCircle, Users } from 'lucide-react'
import { Premiacao } from '@common/data'
import Modal from '@components/Modal'
import DownloadConferenciaButton from '@components/DownloadConferenciaButton'
import { SimpleCheckbox } from '@components/ui/checkbox'

interface RifaInfo {
    id: number;
    empresa: string
    dataSorteio: string
    situacao: string
    tipo: string
    servas: number
    avulsos: number
    complemento: number
    total: number
    modalidadeVenda: string
    quantidadeDigitos?: number
    premiacaoList: Premiacao[]
}

interface IdLabel {
    id: number
    label: string
}

interface VendedorCheckboxListProps {
    vendedores: IdLabel[];
    /**
     * opcional: lista inicial (para preencher quando abre modal)
     */
    initialSelecionados?: IdLabel[];
    /**
     * chamado sempre que os selecionados mudarem
     */
    onChange?: (selecionados: IdLabel[]) => void;
}

/**
 * Componente VendedorCheckboxList (autônomo)
 * - gerencia filtro e selecionados internamente
 * - notifica o pai via onChange
 * - preserva foco e scroll corretamente
 */
const VendedorCheckboxList: React.FC<VendedorCheckboxListProps> = ({ vendedores, initialSelecionados = [], onChange }) => {
    const [filtro, setFiltro] = useState('');
    const [selecionados, setSelecionados] = useState<IdLabel[]>(initialSelecionados || []);

    // refs para scroll e input
    const listRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    // guarda posição do scroll enquanto a lista é renderizada
    const scrollPosRef = useRef<number>(0);

    // se o parent passar initialSelecionados diferente quando abrir, sincroniza
    useEffect(() => {
        setSelecionados(initialSelecionados || []);
    }, [initialSelecionados]);

    // notifica o pai quando selecionados mudam
    useEffect(() => {
        if (onChange) onChange(selecionados);
    }, [selecionados, onChange]);

    // salva a posição do scroll quando o usuário rolar
    useEffect(() => {
        const div = listRef.current;
        if (!div) return;
        const handler = () => {
            scrollPosRef.current = div.scrollTop;
        };
        div.addEventListener('scroll', handler);
        return () => div.removeEventListener('scroll', handler);
    }, []);

    // restaura a posição do scroll antes do repaint
    useLayoutEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = scrollPosRef.current;
        }
    });

    // mantém foco e posição do cursor no input quando o filtro muda
    useLayoutEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        // tenta manter a posição do cursor
        const pos = input.selectionStart ?? filtro.length;
        input.focus();
        try {
            input.setSelectionRange(pos, pos);
        } catch (e) {
            // alguns inputs customizados podem falhar nesse setSelectionRange — ignora
        }
    }, [filtro]);

    const vendedoresFiltrados = vendedores.filter(v => v.label.toLowerCase().includes(filtro.toLowerCase()));

    const isSelected = (v: IdLabel) => selecionados.some(s => s.id === v.id);

    const toggleVendedor = (vendedor: IdLabel) => {
        setSelecionados(prev => {
            const exists = prev.some(p => p.id === vendedor.id);
            if (exists) return prev.filter(p => p.id !== vendedor.id);
            return [...prev, vendedor];
        });
        // Não precisa fazer nada extra para o scroll, o useLayoutEffect acima restaura
    };

    return (
        <div className="space-y-3">
            <Input
                ref={inputRef}
                placeholder="Filtrar nome do vendedor..."
                value={filtro}
                onChange={(e) => setFiltro((e.target as HTMLInputElement).value)}
                className="w-full text-base dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <div
                ref={listRef}
                className="space-y-2 p-2 border rounded max-h-60 overflow-y-scroll bg-gray-50 shadow-inner dark:bg-gray-800 dark:border-gray-700"
            >
                <h4 className="text-sm font-bold sticky top-0 bg-gray-50 pb-1 border-b dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    Vendedores ({vendedoresFiltrados.length}/{vendedores.length}):
                </h4>

                {vendedoresFiltrados.map(vendedor => (
                    <div
                        key={vendedor.id}
                        className="flex items-center space-x-3 cursor-pointer p-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => toggleVendedor(vendedor)}
                    >
                        <div
                            className={`w-4 h-4 border-2 rounded shrink-0 ${isSelected(vendedor) ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-400 dark:bg-gray-600 dark:border-gray-500'}`}
                            role="checkbox"
                            aria-checked={isSelected(vendedor)}
                        >
                            {isSelected(vendedor) && (
                                <svg className="w-3 h-3 text-white m-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-200">{vendedor.label}</span>
                    </div>
                ))}

                {vendedoresFiltrados.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhum vendedor encontrado com o filtro '{filtro}'.
                    </p>
                )}
            </div>
        </div>
    );
};

// Interface retornos API /listarbilheteporvendedor
interface BilhetePorVendedorResult {
    nome: string
    quantidade: number
    numeros: string[]
}

interface BilhetePorVendedorDisplayProps {
    data: BilhetePorVendedorResult[]
    detalhar: boolean
}

const BilhetePorVendedorDisplay: React.FC<BilhetePorVendedorDisplayProps> = ({ data, detalhar }) => {
    if (data.length === 0) return null;

    const total = data.reduce((acc, b) => acc + Number(b.quantidade ?? 0), 0);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bilhetes por Vendedor:</h3>
            <div style={{ fontWeight: "bold", marginTop: 10 }}>
                Total: R$ {total}
            </div>
            {data.map((item, index) => (
                <Card key={index} className="p-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">{item.nome}</span>
                        <span className="text-xl font-extrabold text-blue-600">{item.quantidade} Bilhetes</span>
                    </div>
                    {detalhar && item.numeros && item.numeros.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                            **Números:** {item.numeros.join(', ')}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    )
}

export default function RifaPage() {
    const router = useRouter()
    const { empresaId, rifaId } = router.query

    const empresaIdStr = typeof empresaId === 'string' ? empresaId : ''
    const rifaIdStr = typeof rifaId === 'string' ? rifaId : ''

    const [info, setInfo] = useState<RifaInfo | null>(null)
    const [vendedores, setVendedores] = useState<IdLabel[]>([])
    const [taloes, setTaloes] = useState<IdLabel[]>([])
    const [vendedorSelecionado, setVendedorSelecionado] = useState<IdLabel | null>(null)
    const [talaoSelecionado, setTalaoSelecionado] = useState<IdLabel | null>(null)
    const [numero, setNumero] = useState('')
    const { showLoader, hideLoader } = useAppContext()
    const { mode, data, fetchBilhetes } = useBilhetesFetcher()
    const [openPremios, setOpenPremios] = useState(false)
    const [quantidadeDigitos, setQuantidadeDigitos] = useState(4)

    // --- Novos estados para Bilhetes Por Vendedor ---
    const [openBilhetesVendedor, setOpenBilhetesVendedor] = useState(false)
    const [vendedoresSelecionadosModal, setVendedoresSelecionadosModal] = useState<IdLabel[]>([])
    const [detalhar, setDetalhar] = useState(false)
    const [bilhetesVendedorResult, setBilhetesVendedorResult] = useState<BilhetePorVendedorResult[]>([])
    const [detalharResultado, setDetalharResultado] = useState(false)

    // Função para buscar bilhetes por vendedor
    const handleBilhetesPorVendedor = async () => {
        if (!rifaIdStr) {
            toast.error("ID da Rifa não encontrado.");
            return;
        }

        if (vendedoresSelecionadosModal.length === 0) {
            toast.error("Selecione pelo menos um vendedor.");
            return;
        }

        const vendedorIdList = vendedoresSelecionadosModal.map(v => v.id).join(',');

        showLoader();
        try {
            const url = `/listarbilheteporvendedor?rifaId=${rifaIdStr}&vendedorIdList=${vendedorIdList}&detalhar=${detalhar}`;
            const res = await instance.get(url);

            if (res.data.success) {
                setBilhetesVendedorResult(res.data.data || []);
                setDetalharResultado(detalhar);
                setOpenBilhetesVendedor(false);
            } else {
                toast.error(res.data.errorMessage || "Erro ao buscar bilhetes por vendedor.");
                setBilhetesVendedorResult([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro na comunicação com a API.");
            setBilhetesVendedorResult([]);
        } finally {
            hideLoader();
        }
    }

    useEffect(() => {
        if (rifaId && empresaId) {
            showLoader();
            instance.get(`/buscarrifa?empresaId=${empresaId}&rifaId=${rifaId}`).then(res => {
                if (res.data.success) {
                    setInfo(res.data.data)
                    if (res.data.data?.quantidadeDigitos) {
                        setQuantidadeDigitos(res.data.data.quantidadeDigitos)
                    }
                }
                else {
                    toast.error(res.data.errorMessage)
                }
            }).catch(err => {
                console.error(err)
            })

            instance.get('/listarvendedoridlabel').then(res => {
                if (res.data.success) setVendedores(res.data.data)
            }).catch(err => {
                console.error(err)
            })

            instance.get(`/listartalaoidlabel?rifaId=${rifaId}`).then(res => {
                if (res.data.success) setTaloes(res.data.data)
            }).catch(err => {
                console.error(err)
            })

            hideLoader();
        }
    }, [rifaId, empresaId])

    const handleVendedorChange = (v: SingleValue<IdLabel> | IdLabel[] | null) => {
        setVendedorSelecionado(v as SingleValue<IdLabel>)
        setTalaoSelecionado(null)
        setNumero('')
        if (v) {
            if (empresaIdStr && rifaIdStr) {
                fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, cambistaId: (v as IdLabel).id })
            }
        }
    }

    const handleTalaoChange = (v: SingleValue<IdLabel> | IdLabel[] | null) => {
        setTalaoSelecionado(v as SingleValue<IdLabel>)
        setVendedorSelecionado(null)
        setNumero('')
        if (v) {
            if (empresaIdStr && rifaIdStr) {
                fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, talaoId: (v as IdLabel).id })
            }
        }
    }

    return (
        <div className="p-0 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 text-black text-sm">
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Código</span>
                    <span className="text-lg font-semibold">{info?.id}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Empresa</span>
                    <span className="text-lg font-semibold">{info?.empresa}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Data</span>
                    <span className="text-lg font-semibold">{info?.dataSorteio}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Situação</span>
                    <span className="text-lg font-semibold">{info?.situacao}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <span className="text-lg font-semibold">{info?.tipo}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Modalidade de Venda</span>
                    <span className="text-lg font-semibold">{info?.modalidadeVenda}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Servas</span>
                    <span className="text-lg font-semibold">{info?.servas}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Avulsos</span>
                    <span className="text-lg font-semibold">{info?.avulsos}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Complemento</span>
                    <span className="text-lg font-semibold">{info?.complemento}</span>
                </Card>
                <Card className="p-2 flex flex-col gap-2 text-center items-start justify-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-semibold">{info?.total}</span>
                </Card>
            </div>

            <div className="flex flex-wrap gap-2">
                <DownloadConferenciaButton rifaId={rifaIdStr}></DownloadConferenciaButton>
                <Button className="bg-blue-600 text-white w-[120px]"><Link href={`/taloes/${rifaId}`}>Taloes</Link></Button>
                <Button
                    className="bg-blue-600 text-white w-[120px]"
                    onClick={() => setOpenPremios(true)}
                >
                    Prêmios...
                </Button>
                <Button className="bg-blue-600 text-white w-[120px]"><Link href={`/rifawhatsapp/${rifaId}`}>Venda Online</Link></Button>
                <Button
                    className="bg-green-600 text-white w-[180px] flex items-center gap-1"
                    onClick={() => {
                        setVendedoresSelecionadosModal([]);
                        setDetalhar(false);
                        setOpenBilhetesVendedor(true);
                    }}
                >
                    <Users size={20} />
                    Bilhetes Por Vendedor
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className='flex flex-row space-x-1'>
                    <Input
                        placeholder={`${quantidadeDigitos} dígitos`}
                        value={numero}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={quantidadeDigitos}
                        onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && empresaIdStr && rifaIdStr) {
                                fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, numero: numero })
                            }
                        }}
                        className="text-xl w-[100px] text-center font-bold p-1"
                    />

                    <Button
                        onClick={() => fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, numero: numero })}
                        className="sm:hidden bg-blue-600 text-white px-3 py-2 rounded w-[47px]"
                    >
                        <CheckCircle></CheckCircle>
                    </Button>
                </div>
                <CustomSelect<IdLabel>
                    options={vendedores}
                    value={vendedorSelecionado}
                    onChange={(v) => handleVendedorChange(v)}
                    isMulti={false}
                    placeholder="Vendedor"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => String(option.id)}
                />

                <CustomSelect<IdLabel>
                    options={taloes}
                    value={talaoSelecionado}
                    onChange={(t) => handleTalaoChange(t)}
                    isMulti={false}
                    placeholder="Talão"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => String(option.id)}
                />
            </div>

            <Separator></Separator>

            {/* Exibe os resultados dos bilhetes por vendedor, se existirem */}
            <BilhetePorVendedorDisplay data={bilhetesVendedorResult} detalhar={detalharResultado} />

            {/* Exibe o resultado padrão da busca por número/vendedor/talão */}
            <DynamicBilheteResult mode={mode} data={data} />

            {/* Modal de Prêmios */}
            {openPremios &&
                <Modal onClose={() => setOpenPremios(false)} title="Premiações">
                    <div className="space-y-2">
                        {info?.premiacaoList?.map((p) => (
                            <div key={p.ordem} className="border rounded p-2 flex flex-col gap-1">
                                <div className="font-semibold">{p.ordem}º Prêmio</div>
                                <div className="text-sm">{p.descricao}</div>
                                <div className="text-sm">Horário: {p.horario}</div>
                                <div className="text-sm font-bold">Valor: R$ {p.valor.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </Modal>
            }

            {/* Modal: Bilhetes Por Vendedor */}
            {openBilhetesVendedor &&
                <Modal onClose={() => {
                    setOpenBilhetesVendedor(false);
                    setVendedoresSelecionadosModal([]); // limpa seleção ao fechar
                }} title="Bilhetes Por Vendedor">
                    <div className="space-y-4">
                        <VendedorCheckboxList
                            vendedores={vendedores}
                            initialSelecionados={vendedoresSelecionadosModal}
                            onChange={(selecionados) => setVendedoresSelecionadosModal(selecionados)}
                        />

                        <div className="flex items-center space-x-2 p-2 border rounded">
                            <SimpleCheckbox
                                label='Detalhar Números (pode ser lento)'
                                id="detalhar-checkbox"
                                checked={detalhar}
                                onCheckedChange={(checked) => setDetalhar(checked as boolean)}
                            />
                        </div>

                        <Button
                            className="bg-blue-600 text-white w-full"
                            onClick={handleBilhetesPorVendedor}
                            disabled={vendedoresSelecionadosModal.length === 0}
                        >
                            Buscar Bilhetes
                        </Button>
                    </div>
                </Modal>
            }

            <div className='h-[150px]'></div>
        </div>
    )
}
