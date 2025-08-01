// Terceira aba: Cadastro em lote de números serva

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card, CardContent } from '@components/ui/card'
import { toast } from 'react-toastify'
import { SingleValue } from 'react-select'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'
import { IdLabel } from '@common/data'
import CustomSelect from '@components/CustomCombobox'


interface CadastroLoteResultado {
    qtdSucessos: number
    sucessos: string[]
    qtdFalhas: number
    falhas: string[]
}

interface CadastroLoteTabProps {
    empresaId: number
    rifaModeloId: number
    quantidadeDigitos: number
}

export default function CadastroLoteTab({ empresaId, rifaModeloId, quantidadeDigitos }: CadastroLoteTabProps) {
    const [vendedorSelecionado, setVendedorSelecionado] = useState<IdLabel | null>(null)
    const [vendedores, setVendedores] = useState<IdLabel[]>([])
    const [numeros, setNumeros] = useState<string[]>([])
    const [inverter, setInverter] = useState(false)
    const [resultado, setResultado] = useState<CadastroLoteResultado | null>(null)
    const { showLoader, hideLoader } = useAppContext()

    useEffect(() => {
        const fetchVendedores = async () => {
            const res = await instance.get('/listarvendedoridlabel')
            if (res.data.success) setVendedores(res.data.data)
            else toast.error(res.data.errorMessage)
        }
        fetchVendedores()
    }, [])

    const handleAddNumero = (valor: string) => {
        const limpo = valor.replace(/\D/g, '').slice(0, quantidadeDigitos)
        if (limpo.length === quantidadeDigitos && !numeros.includes(limpo)) {
            setNumeros([...numeros, limpo])
        }
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            const partes = text.split(/[\n,;\-\s]+/)
            const novos = partes.map(p => p.replace(/\D/g, '')).filter(p => p.length === quantidadeDigitos)
            setNumeros(prev => Array.from(new Set([...prev, ...novos])))
        } catch {
            toast.error('Erro ao colar texto')
        }
    }

    const handleRemoverInvalidos = () => {
        setNumeros(numeros.filter(n => n.length === quantidadeDigitos))
    }

    const handleLimpar = () => {
        limparCampos();
        setResultado(null)
    }

    const limparCampos = () => {
        setNumeros([])
        setVendedorSelecionado(null)
        setInverter(false)

    }

    const handleSubmit = async () => {
        if (!vendedorSelecionado || numeros.length === 0) return toast.error('Preencha os campos obrigatórios')
        showLoader()
        try {
            const res = await instance.post('/cadastrarservalote', {
                empresaId,
                rifaModeloId,
                cambistaId: vendedorSelecionado.id,
                numeros,
                inverter
            })
            if (res.data.success) {
                const resultData = res.data.data
                setResultado(resultData)
                limparCampos();
            } else {
                toast.error(res.data.errorMessage)
            }
        } catch {
            toast.error('Erro ao cadastrar lote')
        } finally {
            hideLoader()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 w-[250px]">
                <CustomSelect<IdLabel>
                    options={vendedores}
                    value={vendedorSelecionado}
                    onChange={(v: any) => setVendedorSelecionado(v as SingleValue<IdLabel>)}
                    isMulti={false}
                    placeholder="Selecione um vendedor"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => String(option.id)}
                />
                


                    <Input
                        placeholder={`Digite e <Enter>`}
                        className="text-xl font-mono w-full sm:w-auto"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddNumero((e.target as HTMLInputElement).value)
                                    ; (e.target as HTMLInputElement).value = ''
                            }
                        }}
                    />
            </div>
            <div className="flex flex-wrap gap-2">
                {numeros.map((n, i) => (
                    <span
                        key={i}
                        className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-white px-2 py-1 rounded text-sm cursor-pointer"
                        onClick={() => setNumeros(numeros.filter((_, idx) => idx !== i))}
                    >
                        {n} ✕
                    </span>
                ))}
            </div>

            

            <div className="flex gap-2 flex-wrap">
                <button onClick={handleRemoverInvalidos} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Remover inválidos
                </button>
                <button onClick={handlePaste} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Colar Texto...
                </button>
                <button onClick={handleLimpar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Limpar
                </button>
            </div>

            <div className="flex gap-2 flex-wrap">
                <select
                    value={inverter ? 'true' : 'false'}
                    onChange={(e) => setInverter(e.target.value === 'true')}
                    className="p-2 rounded border bg-white dark:bg-gray-800 dark:text-white"
                >
                    <option value="false">Não Inverter</option>
                    <option value="true">Inverter</option>
                </select>

                <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Inserir Lote
                </button>
            </div>

            {resultado && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border border-green-500">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-green-700 dark:text-green-400">Sucessos ({resultado.qtdSucessos})</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {resultado.sucessos.map((n, idx) => (
                                    <span key={idx} className="text-sm font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                                        {n}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-red-500">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-red-700 dark:text-red-400">Falhas ({resultado.qtdFalhas})</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {resultado.falhas.map((n, idx) => (
                                    <span key={idx} className="text-sm font-mono bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                                        {n}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}