// Segunda aba: Cadastro individual de número serva

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card, CardContent } from '@components/ui/card'
import { toast } from 'react-toastify'
import { SingleValue } from 'react-select'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'
import { IdLabel, Serva } from '@common/data'
import CustomSelect from '@components/CustomCombobox'
import { Button } from '@headlessui/react'
import { CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2';

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

    const handleVendedorChange = (v: SingleValue<IdLabel> | IdLabel[] | null) => {
        setVendedorSelecionado(v as SingleValue<IdLabel>)
        setServas([])
        setResultado(null)
        setShowResultPanel(false)
        if (v) fetchServas((v as SingleValue<IdLabel>)!.id)
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

    const handleRemoverTodos = async () => {
        const result = await Swal.fire({
            title: 'Tem certeza que deseja apagar todas as servas do vendedor ' + vendedorSelecionado?.label + '?',
            text: 'Você não poderá desfazer essa ação!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, apagar!',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'bg-[#F00] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
                cancelButton: 'bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 ml-1',
            },
            buttonsStyling: false,
        });

        if (result.isConfirmed) {
            showLoader()
            try {
                const res = await instance.delete(
                    `/removertodasservas?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&vendedorId=${vendedorSelecionado}`
                )
                if (res.data.success) {
                    toast.success('Número removido com sucesso')
                    setShowResultPanel(false)
                    if (vendedorSelecionado) fetchServas(vendedorSelecionado.id)
                } else {
                    toast.error(res.data.errorMessage)
                }
            } catch {
                toast.error('Erro ao remover servas')
            } finally {
                hideLoader()
            }
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
                <div className='flex flex-row space-x-1'>
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={`${quantidadeDigitos} dígitos`}
                        value={numero}
                        onChange={(e: any) => handleChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // evita submit ou quebra de linha
                                handleKeyDown(e);   // chama sua função
                            }
                        }}
                        maxLength={quantidadeDigitos}
                        className="text-xl w-[100px] text-center font-bold p-1"
                    />

                    {/* Botão visível só no mobile */}
                    <Button
                        onClick={handleSubmit}
                        className="sm:hidden bg-blue-600 text-white px-3 py-2 rounded w-[47px]"
                    >
                        <CheckCircle></CheckCircle>
                    </Button>
                </div>
                <CustomSelect<IdLabel>
                    options={vendedores}
                    value={vendedorSelecionado}
                    onChange={handleVendedorChange}
                    isMulti={false}
                    placeholder="Selecione um vendedor"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => String(option.id)}
                />

            </div>

            {
                showResultPanel && (
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
                )
            }

            {
                servas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        <div className='w-full'>
                        <Button 
                            className='w-auto p-2 bg-blue-600 text-white rounded-md'
                            onClick={() => handleRemoverTodos()}>Remover Todos...</Button>
                        </div>
                        {servas.map((s, idx) => (
                            <Card
                                key={idx}
                                className="relative flex flex-col w-min h-min items-center justify-center"
                            >
                                {/* Botão de excluir */}
                                <button
                                    className="absolute top-0 right-0 text-red-500 hover:text-red-700"
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
                )
            }
        </div >
    )
}
