// Segunda aba: Cadastro individual de número serva

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card, CardContent } from '@components/ui/card'
import { toast } from 'react-toastify'
import Select from 'react-select'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'
import { IdLabel, Serva } from '@common/data'

interface ResultadoCadastro {
    numero: string
    cadastrada: boolean
    vendedor: string
}

interface CadastroTabProps {
    empresaId: number
    rifaModeloId: number
    quantidadeDigitos: number
}

export default function CadastroTab({ empresaId, rifaModeloId, quantidadeDigitos }: CadastroTabProps) {
    const [numero, setNumero] = useState('')
    const [vendedorSelecionado, setVendedorSelecionado] = useState<IdLabel | null>(null)
    const [vendedores, setVendedores] = useState<IdLabel[]>([])
    const [servas, setServas] = useState<Serva[]>([])
    const [resultado, setResultado] = useState<ResultadoCadastro | null>(null)
    const { showLoader, hideLoader } = useAppContext()
    const [showResultPanel, setShowResultPanel] = useState(false)
    const [sucesso, setSucesso] = useState(false)

    useEffect(() => {
        const fetchVendedores = async () => {
            const res = await instance.get('/listarvendedoridlabel')
            if (res.data.success) setVendedores(res.data.data)
            else toast.error(res.data.errorMessage)
        }
        fetchVendedores()
    }, [])

    const fetchServas = async (cambistaId: number) => {
        showLoader()
        try {
            const res = await instance.get('/listarservas', {
                params: { empresaId, rifaModeloId, cambistaId },
            })
            if (res.data.success) {
                setServas(res.data.data)
            } else {
                toast.error(res.data.errorMessage)
            }
        } catch {
            toast.error('Erro ao buscar servas')
        } finally {
            hideLoader()
        }
    }

    const handleVendedorChange = (v: IdLabel | null) => {
        setVendedorSelecionado(v)
        setServas([])
        setResultado(null)
        setShowResultPanel(false)
        if (v) fetchServas(v.id)
    }

    const handleSubmit = async () => {
        if (numero.length !== quantidadeDigitos || !vendedorSelecionado) return

        showLoader()
        try {
            const res = await instance.post(
                `/cadastrarserva?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&numero=${numero}&cambistaId=${vendedorSelecionado.id}`
            )
            setResultado(res.data.data)
            setShowResultPanel(true)
            if (res.data.data.sucesso) {
                setSucesso(true)
                fetchServas(vendedorSelecionado.id)
            } else {
                setSucesso(false)
                toast.error(res.data.data.mensagem)
            }
        } catch {
            toast.error('Erro ao cadastrar número')
        } finally {
            hideLoader()
            setNumero('')
        }
    }

    const handleRemoverNumero = async (numeroRemover: string) => {
        showLoader()
        try {
            const res = await instance.delete(
                `/removerserva?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&numero=${numeroRemover}`
            )
            if (res.data.success) {
                toast.success('Número removido com sucesso')
                setShowResultPanel(false)
                if (vendedorSelecionado) fetchServas(vendedorSelecionado.id)
            } else {
                toast.error(res.data.errorMessage)
            }
        } catch {
            toast.error('Erro ao remover número')
        } finally {
            hideLoader()
        }
    }

    const handleChange = (val: string) => {
        const onlyDigits = val.replace(/\D/g, '').slice(0, quantidadeDigitos)
        setNumero(onlyDigits)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && numero.length === quantidadeDigitos && vendedorSelecionado) {
            handleSubmit()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
                <Input
                    placeholder={`Digite ${quantidadeDigitos} dígitos`}
                    value={numero}
                    onChange={(e: any) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={quantidadeDigitos}
                    className='text-xl w-[100px] text-center text-bold p-1'
                />

                <Select
                    placeholder="Selecione um vendedor"
                    options={vendedores}
                    value={vendedorSelecionado}
                    onChange={(v: IdLabel) => handleVendedorChange(v as IdLabel)}
                    classNames={{
                        control: () => 'dark:bg-gray-900',
                        menu: () => 'z-50 max-h-48 overflow-y-auto',
                        singleValue: () => 'dark:text-white',
                        input: () => 'dark:text-white',
                    }}
                    isClearable
                />
            </div>

            {showResultPanel && (
                <Card className={sucesso ? 'relative flex flex-col border border-green-300 bg-green-200 w-[300px]' : 'relative flex flex-col border border-red-300 bg-red-200 w-[300px]'}>
                    {/* Botão de excluir */}
                    <button
                        className="absolute top-0 right-1 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoverNumero(resultado?.numero!)}
                        title="Remover número"
                    >
                        ×
                    </button>
                    <CardContent className="p-4">
                        <p className="text-lg font-medium">Número: <span className="font-mono text-xl">{resultado?.numero}</span></p>
                        <p>Vendedor: {resultado?.vendedor}</p>
                    </CardContent>
                </Card>
            )}

            {servas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {servas.map((s, idx) => (
                        <Card
                            key={idx}
                            className="relative flex flex-col w-min h-[50px] items-center justify-center"
                        >
                            {/* Botão de excluir */}
                            <button
                                className="absolute top-0 right-1 text-red-500 hover:text-red-700"
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
            )}
        </div>
    )
}
