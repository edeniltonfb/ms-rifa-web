import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { toast } from 'react-toastify'
import Select from 'react-select'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'
import { Button } from '@components/ui/button'
import CustomSelect from '@components/CustomCombobox'
import { NumericFormat } from 'react-number-format'
import Link from 'next/link'

interface IdLabel {
    id: number
    label: string
}

interface Premiacao {
    ordem: number
    valor: string
    descricao: string
}

interface CadastrarRifaTabProps {
    empresaId: number
    rifaModeloId: number
}

const modalidadeOptions = [
    { label: 'Impressa', value: 'IMP' },
    { label: 'Híbrida', value: 'HIB' },
    { label: 'Plataforma', value: 'PLA' }
]

export default function CadastrarRifaTab({ empresaId, rifaModeloId }: CadastrarRifaTabProps) {
    const [modalidadeVenda, setModalidadeVenda] = useState<any>(null)
    const [dataSorteio, setDataSorteio] = useState('')
    const [descricao, setDescricao] = useState('')
    const [quantidadeNumeros, setQuantidadeNumeros] = useState('')
    const [quantidadeBilhetesTalao, setQuantidadeBilhetesTalao] = useState('')
    const [quantidadeNumerosPorBilhete, setQuantidadeNumerosPorBilhete] = useState('')
    const [cambistaList, setCambistaList] = useState<IdLabel[]>([])
    const [cambistasSelecionados, setCambistasSelecionados] = useState<IdLabel[]>([])
    const [premiacaoList, setPremiacaoList] = useState<Premiacao[]>([{ ordem: 1, valor: '', descricao: '' }])
    const { showLoader, hideLoader } = useAppContext()
    const [rifaIdCriada, setRifaIdCriada] = useState<number | null>(null)

    useEffect(() => {
        const fetchVendedores = async () => {
            const res = await instance.get('/listarvendedoridlabel')
            if (res.data.success) {
                setCambistaList(res.data.data)
            } else {
                toast.error(res.data.errorMessage)
            }
        }
        fetchVendedores()
    }, [])

    const adicionarPremiacao = () => {
        if (premiacaoList.length >= 10) return toast.error('Máximo de 10 premiações')
        setPremiacaoList([...premiacaoList, { ordem: premiacaoList.length + 1, valor: '', descricao: '' }])
    }

    const removerPremiacao = (index: number) => {
        if (premiacaoList.length <= 1) return toast.error('Deve haver pelo menos uma premiação')
        const filtradas = premiacaoList.filter((_, i) => i !== index)
        // reordena
        setPremiacaoList(filtradas.map((p, idx) => ({ ...p, ordem: idx + 1 })))
    }

    // <<< Fix do TS: restringe o campo para 'valor' | 'descricao' >>>
    const atualizarPremiacao = (index: number, campo: 'valor' | 'descricao', valor: string) => {
        setPremiacaoList(prev =>
            prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p))
        )
    }

    const validarPremiacoes = () => {
        for (let i = 0; i < premiacaoList.length; i++) {
            if (!premiacaoList[i].valor || !premiacaoList[i].descricao) {
                toast.error(`Preencha todos os campos da premiação ${i + 1}`)
                return false
            }
            if (i > 0) {
                const valorAtual = parseFloat(premiacaoList[i].valor) || 0
                const valorAnterior = parseFloat(premiacaoList[i - 1].valor) || 0
                if (valorAtual > valorAnterior) {
                    toast.error(`O valor do ${i + 1}º prêmio não pode ser maior que o do ${i}º prêmio`)
                    return false
                }
            }
        }
        return true
    }

    const handleSubmit = async () => {
        if (!modalidadeVenda || !dataSorteio || !descricao || !quantidadeNumeros || !quantidadeBilhetesTalao || !quantidadeNumerosPorBilhete) {
            return toast.error('Preencha todos os campos obrigatórios')
        }
        if (descricao.length > 120) {
            return toast.error('Descrição deve ter no máximo 120 caracteres')
        }
        if (!validarPremiacoes()) return

        showLoader()
        try {
            const body = {
                empresaId,
                rifaModeloId,
                modalidadeVenda: modalidadeVenda.value,
                dataSorteio,
                descricao,
                quantidadeNumeros: parseInt(quantidadeNumeros),
                quantidadeBilhetesTalao: parseInt(quantidadeBilhetesTalao),
                quantidadeNumerosPorBilhete: parseInt(quantidadeNumerosPorBilhete),
                cambistaList: cambistasSelecionados.map(c => c.id),
                premiacaoList: premiacaoList.map((p, idx) => ({ ...p, ordem: idx + 1 }))
            }

            const res = await instance.post('/cadastrarrifa', body)
            if (res.data.success) {
                toast.success('Rifa cadastrada com sucesso')
                setRifaIdCriada(res.data.data) // id retornado pelo backend

                // Limpa o ID após 30 segundos
                setTimeout(() => {
                    setRifaIdCriada(null)
                }, 30000)

                limparCampos()
            } else {
                toast.error(res.data.errorMessage)
            }
        } catch {
            toast.error('Erro ao cadastrar rifa')
        } finally {
            hideLoader()
        }
    }

    const limparCampos = () => {
        setModalidadeVenda(null)
        setDataSorteio('')
        setDescricao('')
        setQuantidadeNumeros('')
        setQuantidadeBilhetesTalao('')
        setQuantidadeNumerosPorBilhete('')
        setCambistasSelecionados([])
        setPremiacaoList([{ ordem: 1, valor: '', descricao: '' }])
    }

    return (
        <div className='space-y-3'>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-4">
                <Select
                    placeholder="Modalidade de Venda"
                    options={modalidadeOptions}
                    value={modalidadeVenda}
                    onChange={(v: any) => setModalidadeVenda(v)}
                    classNames={{
                        control: () => 'dark:bg-gray-900',
                        singleValue: () => 'dark:text-white',
                        input: () => 'dark:text-white',
                    }}
                />

                <Input
                    type="date"
                    value={dataSorteio}
                    onChange={(e: any) => setDataSorteio(e.target.value)}
                />

                <Input
                    placeholder="Descrição da Rifa"
                    value={descricao}
                    maxLength={120}
                    onChange={(e: any) => setDescricao(e.target.value)}
                />

                <Input
                    type="number"
                    placeholder="Quantidade de Números"
                    value={quantidadeNumeros}
                    onChange={(e: any) => setQuantidadeNumeros(e.target.value)}
                />

                <Input
                    type="number"
                    placeholder="Bilhetes por Talão"
                    value={quantidadeBilhetesTalao}
                    onChange={(e: any) => setQuantidadeBilhetesTalao(e.target.value)}
                />

                <Input
                    type="number"
                    placeholder="Números por Bilhete"
                    value={quantidadeNumerosPorBilhete}
                    onChange={(e: any) => setQuantidadeNumerosPorBilhete(e.target.value)}
                />


            </div>
            <CustomSelect<IdLabel>
                options={cambistaList}
                value={cambistasSelecionados}
                onChange={(v: any) => setCambistasSelecionados(v as IdLabel[])}
                isMulti={true}
                placeholder="Excluir Cambistas"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => String(option.id)}
            />

            <div className="space-y-2 border-4 border-gray-500 rounded-xl p-2">
                <h3 className="font-semibold">Premiações</h3>
                {premiacaoList.map((premio, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 border border-gray-500 rounded-md p-2">
                        <div className="w-full sm:w-28 text-sm font-medium opacity-80">
                            {idx + 1}º Prêmio
                        </div>

                        {/* Input de moeda */}
                        <NumericFormat
                            value={premio.valor}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            allowNegative={false}
                            decimalScale={2}
                            fixedDecimalScale
                            onValueChange={(values) => {
                                atualizarPremiacao(idx, 'valor', values.value) // values.value é numérico puro
                            }}
                            className="w-36 border rounded px-2 py-1 dark:bg-gray-900 dark:text-white flex-1"
                        />

                        <Input
                            placeholder="Descrição"
                            value={premio.descricao}
                            onChange={(e) => atualizarPremiacao(idx, 'descricao', e.target.value)}
                            className="w-36 flex-1"
                        />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => removerPremiacao(idx)}
                            disabled={premiacaoList.length <= 1}
                            className="ml-auto"
                        >
                            Remover
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={adicionarPremiacao}>
                    Adicionar Premiação
                </Button>
            </div>

            <Button onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700">
                Cadastrar Rifa
            </Button>

            {rifaIdCriada && (
                <div className="mt-2">
                    <Link
                        href={`/rifa/${empresaId}/${rifaIdCriada}`}
                        className="text-blue-600 underline font-semibold"
                    >
                        Acessar rifa criada
                    </Link>
                </div>
            )}
        </div>
    )
}
