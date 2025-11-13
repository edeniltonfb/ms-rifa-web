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
import { horarios } from '@common/data'
import { Copy, Trash, X } from 'lucide-react'
import { Checkbox } from '@headlessui/react'

interface IdLabel {
    id: number
    label: string
}

interface Premiacao {
    ordem: number
    valor: string
    descricao: string
    horario: string
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
    const [complementar, setComplementar] = useState(true);
    const [cambistaList, setCambistaList] = useState<IdLabel[]>([])
    const [cambistasSelecionados, setCambistasSelecionados] = useState<IdLabel[]>([])
    const [premiacaoList, setPremiacaoList] = useState<Premiacao[]>([{ ordem: 1, valor: '', descricao: '', horario: '' }])
    const { showLoader, hideLoader } = useAppContext()
    const [rifaIdCriada, setRifaIdCriada] = useState<number | null>(null)


    const [isModalOpen, setIsModalOpen] = useState(false)
    const [rifasPorEmpresa, setRifasPorEmpresa] = useState<{ [key: number]: IdLabel[] }>({})
    const [rifaSelecionada, setRifaSelecionada] = useState<IdLabel | null>(null)

    const rifasOptions = rifasPorEmpresa[empresaId] || []


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
        setPremiacaoList([...premiacaoList, { ordem: premiacaoList.length + 1, valor: '', descricao: '', horario: '' }])
    }

    const removerPremiacao = (index: number) => {
        if (premiacaoList.length <= 1) return toast.error('Deve haver pelo menos uma premiação')
        const filtradas = premiacaoList.filter((_, i) => i !== index)
        // reordena
        setPremiacaoList(filtradas.map((p, idx) => ({ ...p, ordem: idx + 1 })))
    }

    // <<< Fix do TS: restringe o campo para 'valor' | 'descricao' >>>
    const atualizarPremiacao = (index: number, campo: 'valor' | 'descricao' | 'horario', valor: string) => {
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
                premiacaoList: premiacaoList.map((p, idx) => ({ ...p, ordem: idx + 1 })),
                complementar:complementar
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
        setPremiacaoList([{ ordem: 1, valor: '', descricao: '', horario: '' }])
    }

    const handleOpenModal = () => {
        carregarRifas(empresaId)
        setIsModalOpen(true)
    }

    const carregarRifas = async (empresaId: number) => {
        if (rifasPorEmpresa[empresaId]) return

        const res = await instance.get(`/listarrifasporempresa?empresaId=${empresaId}`).finally(() => hideLoader())
        if (res.data.success) {
            setRifasPorEmpresa(prev => ({ ...prev, [empresaId]: res.data.data }))
        } else {
            toast.error(res.data.errorMessage)
        }
    }

    const copiarRifa = async () => {
        if (!rifaSelecionada) {
            return toast.error('Selecione uma rifa para copiar.')
        }

        showLoader()
        try {
            const res = await instance.get(`/buscarrifa?rifaId=${rifaSelecionada.id}`)

            if (res.data.success) {
                const data = res.data.data

                // 1. Limpar campos antes de preencher
                limparCampos()

                // 2. Preencher campos principais
                setModalidadeVenda(data.modalidadeVenda) // Assume que o dado já vem no formato {label, value}
                setDataSorteio(data.dataSorteio || '')
                setDescricao(data.descricao || '')
                setQuantidadeNumeros(String(data.quantidadeNumeros || ''))
                setQuantidadeBilhetesTalao(String(data.quantidadeBilhetesTalao || ''))
                setQuantidadeNumerosPorBilhete(String(data.quantidadeNumerosPorBilhete || ''))

                // 4. Preencher premiações
                setPremiacaoList(data.premiacaoList || [{ ordem: 1, valor: '', descricao: '', horario: '' }])

                toast.success(`Dados da rifa "${rifaSelecionada.label}" copiados com sucesso!`)
                setIsModalOpen(false)
                setRifaSelecionada(null)

            } else {
                toast.error(res.data.errorMessage)
            }
        } catch (e) {
            toast.error('Erro ao buscar dados da rifa.')
        } finally {
            hideLoader()
        }
    }

    // Lógica para fechar o modal
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setRifaSelecionada(null)
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
                
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={complementar}
                        onChange={(e) => setComplementar(e.target.checked)}
                        id="complementar"
                    />
                    <label htmlFor="complementar">Complementar</label>
                </div>

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

                        <CustomSelect
                            options={horarios}
                            value={horarios.find(h => h.value === premio.horario) || null}
                            onChange={(v: any) => atualizarPremiacao(idx, 'horario', v?.value || '')}
                            placeholder="Horário"
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => removerPremiacao(idx)}
                            disabled={premiacaoList.length <= 1}
                            className="ml-auto"
                        >
                            <Trash />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={adicionarPremiacao}>
                    Adicionar Premiação
                </Button>
            </div>

            <div className="flex gap-4 pt-2">
                <Button onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                    Cadastrar Rifa
                </Button>

                {/* 🆕 Botão para Abrir Modal de Cópia */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenModal}
                    className="flex items-center gap-1 shadow-md"
                >
                    <Copy className="w-4 h-4" /> Copiar dados...
                </Button>
            </div>

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

            {/* 🆕 Modal de Cópia */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white">Copiar Dados de Rifa Existente</h3>
                            <Button onClick={handleCloseModal} className="p-1 h-auto">
                                <X className="w-6 h-6 dark:text-white" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Selecione a Rifa
                            </label>
                            {/* Reutilizando o Select mockado, mas populado com as rifas carregadas */}
                            <Select
                                placeholder="Buscar e selecionar rifa..."
                                options={rifasOptions}
                                value={rifaSelecionada}
                                onChange={(v: any) => setRifaSelecionada(v)}
                                classNames={{
                                    control: (state: any) =>
                                        state.isFocused
                                            ? 'dark:bg-gray-900 border-indigo-500 ring-2 ring-indigo-500'
                                            : 'dark:bg-gray-900 dark:border-gray-700',
                                    menu: () =>
                                        'z-50 dark:bg-gray-900 dark:border dark:border-gray-700', // ❌ sem max-h/overflow aqui
                                    option: (state: any) =>
                                        state.isSelected
                                            ? 'dark:bg-indigo-600 dark:text-white bg-indigo-600 text-white'
                                            : state.isFocused
                                                ? 'dark:bg-indigo-500 dark:text-white bg-indigo-500 text-white'
                                                : 'dark:bg-gray-800 dark:text-white bg-white',
                                    singleValue: () => 'dark:text-white',
                                    multiValue: () =>
                                        'dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-800 rounded-md',
                                    multiValueLabel: () => 'dark:text-white text-gray-800',
                                    multiValueRemove: () => 'dark:hover:bg-gray-600 hover:bg-gray-300',
                                    input: () => 'dark:text-white',
                                    placeholder: () => 'dark:text-gray-400 text-gray-500',
                                }}
                                styles={{
                                    menuList: (base: any) => ({
                                        ...base,
                                        maxHeight: 240, // 👈 aqui fica o limite de altura
                                        overflowY: 'auto', // 👈 único scrollbar
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                    }),
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                            >
                                Fechar
                            </Button>
                            <Button
                                type="button"
                                onClick={copiarRifa}
                                disabled={!rifaSelecionada}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                            >
                                <Copy className="w-4 h-4 mr-2" /> Copiar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
