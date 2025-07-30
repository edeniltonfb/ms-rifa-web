// pages/rifamodelo/[rifaModeloId].tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import instance from '@lib/axios'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Card, CardContent } from '@components/ui/card'
import { Input } from '@components/ui/input'
import Select, { ActionMeta, SingleValue, StylesConfig } from 'react-select'
import { toast } from 'react-toastify'
import { cn } from 'src/utils/cn'
import { useAppContext } from 'src/contexts/AppContext'


interface RifaModelo {
    id: number
    tipo: string
    descricao: string
    quantidadeServas: number
    quantidadeDigitos: number
}

interface ConsultaResponse {
    numero: string
    cadastrada: boolean
    vendedor: string
}

interface Serva {
    rifaModeloId: number
    numero: string
}

interface IdLabel {
    id: number
    label: string
}

export default function RifaModeloPage() {
    const router = useRouter()
    const { empresaId, rifaModeloId } = router.query

    const [rifaModelo, setRifaModelo] = useState<RifaModelo | null>(null)
    const [numero, setNumero] = useState('')
    const [resultadoConsulta, setResultadoConsulta] = useState<ConsultaResponse | null>(null)
    const [vendedores, setVendedores] = useState<IdLabel[]>([])
    const [vendedorSelecionado, setVendedorSelecionado] = useState<IdLabel | null>(null)
    const [servas, setServas] = useState<Serva[]>([])
    const [activeTab, setActiveTab] = useState<string>('consulta')
    const { showLoader, hideLoader } = useAppContext();

    useEffect(() => {
        if (!rifaModeloId) return
        showLoader();
        instance.get(`/buscarrifamodelo?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}`)
            .then(res => {
                if (res.data.success) setRifaModelo(res.data.data)
                else toast.error(res.data.errorMessage)
            }).finally(() => hideLoader())
    }, [rifaModeloId])

    useEffect(() => {
        showLoader();
        instance.get('/listarvendedoridlabel')
            .then(res => {
                if (res.data.success) setVendedores(res.data.data)
                else toast.error(res.data.errorMessage)
            }).finally(() => hideLoader())
    }, [])

    const handleNumeroChange = (value: string) => {
        const clean = value.replace(/\D/g, '').slice(0, rifaModelo?.quantidadeDigitos || 4)
        setNumero(clean)
    }

    const consultarNumero = async () => {
        const quantidadeDigitos = rifaModelo?.quantidadeDigitos ?? 4;

        if (rifaModelo && numero.length === quantidadeDigitos) {
            showLoader();
            setServas([]);
            setVendedorSelecionado(null);
            await instance.get(`/consultarserva?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&numero=${numero}`)
                .then(res => {
                    if (res.data.success) setResultadoConsulta(res.data.data)
                    else toast.error(res.data.errorMessage)
                }).finally(() => hideLoader())
        } else {
            setResultadoConsulta(null)
            toast.error('Número inválido')
        }
    }

    const handleVendedorChange = (v: IdLabel | null) => {
        setVendedorSelecionado(v)
        setServas([])
        if (v) {
            fetchServasByVendedor(v.id);
        }
    }

    const fetchServasByVendedor = async (cambistaId: number) => {
        showLoader();
        setResultadoConsulta(null);
        setNumero('')
        instance.get(`/listarservas?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&cambistaId=${cambistaId}`)
            .then(res => {
                if (res.data.success) setServas(res.data.data)
                else toast.error(res.data.errorMessage)
            }).finally(() => hideLoader())
    }

    const handleRemoverNumero = async (numero: string) => {
        if (!vendedorSelecionado) return;

        try {
            const response = await instance.delete('/removerserva', {
                params: {
                    empresaId: 1,
                    rifaModeloId,
                    numero,
                },
            });

            if (response.data.success) {
                toast.success(`Número ${numero} removido com sucesso`);
                // Recarrega a lista de números
                await fetchServasByVendedor(vendedorSelecionado?.id);
            } else {
                toast.error(response.data.errorMessage || 'Erro ao remover número');
            }
        } catch (error) {
            toast.error('Erro na exclusão');
            console.error(error);
        }
    };


    return (
        <div >
            {rifaModelo && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">

                    <Card className="p-4 flex flex-col gap-2 text-center items-start justify-center">
                        <span className="text-sm text-muted-foreground">Tipo</span>
                        <span className="text-lg font-semibold">{rifaModelo.tipo}</span>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2 text-center items-start justify-center">
                        <span className="text-sm text-muted-foreground">Descrição</span>
                        <span className="text-lg font-semibold">{rifaModelo.descricao}</span>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2 text-center items-start justify-center">
                        <span className="text-sm text-muted-foreground">Servas</span>
                        <span className="text-lg font-semibold">{rifaModelo.quantidadeServas}</span>
                    </Card>

                </div>
            )}

            <Tabs defaultValue="consulta" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex flex-wrap">
                    <TabsTrigger className={cn(
                        'px-2 py-2 text-sm font-medium border-b-2 transition-all',
                        activeTab === 'consulta'
                            ? 'border-primary text-primary bg-white dark:bg-gray-800'
                            : 'border-transparent text-muted-foreground hover:text-primary hover:border-gray-300'
                    )}
                        value="consulta">Consulta</TabsTrigger>
                    <TabsTrigger className={cn(
                        'px-2 py-2 text-sm font-medium border-b-2 transition-all',
                        activeTab === 'cadastro'
                            ? 'border-primary text-primary bg-white dark:bg-gray-800'
                            : 'border-transparent text-muted-foreground hover:text-primary hover:border-gray-300'
                    )}
                        value="cadastro">Serva</TabsTrigger>
                    <TabsTrigger className={cn(
                        'px-2 py-2 text-sm font-medium border-b-2 transition-all',
                        activeTab === 'lote'
                            ? 'border-primary text-primary bg-white dark:bg-gray-800'
                            : 'border-transparent text-muted-foreground hover:text-primary hover:border-gray-300'
                    )}
                        value="lote">Lote</TabsTrigger>
                    <TabsTrigger className={cn(
                        'px-2 py-2 text-sm font-medium border-b-2 transition-all',
                        activeTab === 'naoCadastradas'
                            ? 'border-primary text-primary bg-white dark:bg-gray-800'
                            : 'border-transparent text-muted-foreground hover:text-primary hover:border-gray-300'
                    )}
                        value="naoCadastradas">Não cadastradas</TabsTrigger>
                </TabsList>

                <TabsContent className='border-2 border-[#6C5FFC] rounded-md p-4 mt-[-1px]' value="consulta">
                    <div className="flex flex-wrap gap-4">
                        <Input
                            className='text-xl w-[100px] text-center text-bold p-1'
                            placeholder={`${rifaModelo?.quantidadeDigitos || 4} dígitos`}
                            value={numero}
                            onChange={(e) => handleNumeroChange(e.target.value)}
                            maxLength={rifaModelo?.quantidadeDigitos || 4}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    consultarNumero()
                                }
                            }}
                        />

                        <Select<IdLabel, false>
                            placeholder="Selecione um vendedor"
                            options={vendedores}
                            value={vendedorSelecionado}
                            onChange={(v: SingleValue<IdLabel>, actionMeta: ActionMeta<IdLabel>) =>
                                handleVendedorChange(v as IdLabel)
                            }
                            isClearable
                            classNames={{
                                control: () => 'dark:bg-gray-900',
                                menu: () => 'z-50 max-h-48 overflow-y-auto',
                                singleValue: () => 'dark:text-white',
                                input: () => 'dark:text-white',
                                placeholder: () => 'dark:text-white',
                            }}
                        />
                    </div>

                    {resultadoConsulta && (
                        <div className="mt-4 p-4 border rounded shadow bg-white dark:bg-gray-900">
                            <p><strong>Número:</strong> {resultadoConsulta.numero}</p>
                            <p><strong>Status:</strong> {resultadoConsulta.cadastrada ? 'Cadastrado' : 'Disponível'}</p>
                            <p><strong>Vendedor:</strong> {resultadoConsulta.vendedor}</p>
                        </div>
                    )}

                    {servas.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Números do vendedor</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {servas.map((s, idx) => (
                                    <Card
                                        key={idx}
                                        className="relative flex flex-col w-[100px] h-[60px] items-center justify-center"
                                    >
                                        {/* Botão de excluir */}
                                        <button
                                            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                                            onClick={() => handleRemoverNumero(s.numero)}
                                            title="Remover número"
                                        >
                                            ×
                                        </button>

                                        <CardContent className="text-center font-mono font-bold text-xl">
                                            {s.numero}
                                        </CardContent>
                                    </Card>

                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent className='border-2 border-[#6C5FFC] rounded-md p-4 mt-[-1px]' value="cadastro">
                    <p>Cadastro individual (a implementar)</p>
                </TabsContent>

                <TabsContent className='border-2 border-[#6C5FFC] rounded-md p-4 mt-[-1px]' value="lote">
                    <p>Cadastro em lote (a implementar)</p>
                </TabsContent>

                <TabsContent className='border-2 border-[#6C5FFC] rounded-md p-4 mt-[-1px]' value="naoCadastradas">
                    <p>Números não cadastrados (a implementar)</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}
