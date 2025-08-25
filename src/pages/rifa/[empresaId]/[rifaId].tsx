// RifaPage.tsx - Tela principal da Rifa

import { useEffect, useState } from 'react'
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
import { CheckCircle } from 'lucide-react'
import { Premiacao } from '@common/data'

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

    useEffect(() => {

        if (rifaId && empresaId) {
            showLoader();
            instance.get(`/buscarrifa?empresaId=${empresaId}&rifaId=${rifaId}`).then(res => {
                if (res.data.success) setInfo(res.data.data)
                else toast.error(res.data.errorMessage)
            })

            instance.get('/listarvendedoridlabel').then(res => {
                if (res.data.success) setVendedores(res.data.data)
            })

            instance.get(`/listartalaoidlabel?rifaId=${rifaId}`).then(res => {
                if (res.data.success) setTaloes(res.data.data)
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

    //if (!info) return <div>Carregando...</div>

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
                <Button className="bg-blue-600 text-white w-[120px]">Conferência</Button>
                {/*<Button className="bg-blue-600 text-white">Conf por Vendedor...</Button>*/}
                <Button className="bg-blue-600 text-white w-[120px]">Vales</Button>
                <Button className="bg-blue-600 text-white w-[120px]"><Link href={`/taloes/${rifaId}`}>Taloes</Link></Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                    type="number"
                    inputMode="numeric"
                    placeholder={`${info?.quantidadeDigitos ?? 4} dígitos`}
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && empresaIdStr && rifaIdStr) {
                            fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, numero: numero })
                        }
                    }}
                    maxLength={info?.quantidadeDigitos ?? 4}
                    className="text-xl w-[100px] text-center font-bold p-1"
                />

                {/* Botão visível só no mobile */}
                <Button
                    onClick={() => fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, numero: numero })}
                    className="sm:hidden bg-blue-600 text-white px-3 py-2 rounded w-[30px]"
                >
                    <CheckCircle></CheckCircle>
                </Button>

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
            <DynamicBilheteResult mode={mode} data={data} />

            <div className='h-[150px]'></div>
        </div>
    )
}
