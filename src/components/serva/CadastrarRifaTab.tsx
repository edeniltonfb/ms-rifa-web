// Quarta aba: Cadastrar Rifa

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card, CardContent } from '@components/ui/card'
import { toast } from 'react-toastify'
import Select from 'react-select'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'
import { Button } from '@components/ui/button'

interface IdLabel {
    id: number
    label: string
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
    const [quantidadeNumeros, setQuantidadeNumeros] = useState('')
    const [quantidadeBilhetesTalao, setQuantidadeBilhetesTalao] = useState('')
    const [quantidadeNumerosPorBilhete, setQuantidadeNumerosPorBilhete] = useState('')
    const [cambistaList, setCambistaList] = useState<IdLabel[]>([])
    const [cambistasSelecionados, setCambistasSelecionados] = useState<IdLabel[]>([])
    const { showLoader, hideLoader } = useAppContext()

    useEffect(() => {
        const fetchVendedores = async () => {
            const res = await instance.get('/listarvendedoridlabel')
            if (res.data.success) {
                setCambistaList(res.data.data)
                setCambistasSelecionados(res.data.data) // seleciona todos automaticamente
            } else {
                toast.error(res.data.errorMessage)
            }
        }
        fetchVendedores()
    }, [])


    const handleSubmit = async () => {
        if (!modalidadeVenda || !dataSorteio || !quantidadeNumeros || !quantidadeBilhetesTalao || !quantidadeNumerosPorBilhete || cambistasSelecionados.length === 0) {
            return toast.error('Preencha todos os campos obrigatórios')
        }

        showLoader()
        try {
            const body = {
                empresaId,
                rifaModeloId,
                modalidadeVenda: modalidadeVenda.value,
                dataSorteio,
                quantidadeNumeros: parseInt(quantidadeNumeros),
                quantidadeBilhetesTalao: parseInt(quantidadeBilhetesTalao),
                quantidadeNumerosPorBilhete: parseInt(quantidadeNumerosPorBilhete),
                cambistaList: cambistasSelecionados.map(c => c.id)
            }

            const res = await instance.post('/cadastrarrifa', body)
            if (res.data.success) {
                toast.success('Rifa cadastrada com sucesso')
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
        setQuantidadeNumeros('')
        setQuantidadeBilhetesTalao('')
        setQuantidadeNumerosPorBilhete('')
        setCambistasSelecionados([])
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Select
                placeholder="Selecione Cambistas"
                options={cambistaList}
                value={cambistasSelecionados}
                onChange={(v: any) => setCambistasSelecionados(v as IdLabel[])}
                isMulti
                getOptionLabel={(e: any) => e.label}
                getOptionValue={(e: any) => e.id.toString()}
                classNames={{
                    control: () => 'dark:bg-gray-900',
                    menu: () => 'dark:bg-gray-900',
                    option: ({ isFocused, isSelected }: any) =>
                        `dark:text-white ${isFocused ? 'bg-gray-700' : ''} ${isSelected ? 'bg-blue-600 text-white' : ''}`,
                    multiValue: () => 'bg-blue-500 dark:bg-blue-700',
                    multiValueLabel: () => 'text-white',
                    multiValueRemove: () => 'text-white hover:text-red-300',
                    input: () => 'dark:text-white',
                    placeholder: () => 'dark:text-white',
                    singleValue: () => 'dark:text-white',
                }}
            />



            <Button onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700">
                Cadastrar Rifa
            </Button>
        </div>
    )
}
