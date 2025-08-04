// RifaPage.tsx - Tela principal da Rifa

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card, CardContent } from '@components/ui/card'
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

interface RifaInfo {
    cliente: string
    dataSorteio: string
    tipo: string
    servas: number
    avisos: number
    complementares: number
    naoCadastrados: number
    total: number
    vendidos: number
    naoVendidos: number
    talaoResumo: string
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
        }
    }, [rifaId, empresaId])

    type FetchBilhetesProps = {
        cambistaId?: number;
        talaoId?: number;
        numero?: string;
    };

    /*  const fetchBilhetess = async ({ cambistaId, talaoId, numero }: FetchBilhetesProps) => {
          showLoader()
          try {
              const res = await instance.get('/listarbilhetes', {
                  params: { empresaId, rifaId, cambistaId, talaoId, numero },
              })
              if (res.data.success) {
                  console.log(res.data.data)
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
          setTalaoSelecionado(null);
          setNumero('');
  
          if (v) fetchBilhetess({ cambistaId: (v as SingleValue<IdLabel>)!.id })
      }
  
      const handleTalaoChange = (v: SingleValue<IdLabel> | IdLabel[] | null) => {
          setTalaoSelecionado(v as SingleValue<IdLabel>)
          setVendedorSelecionado(null)
          setNumero('');
  
          if (v) fetchBilhetess({ talaoId: (v as SingleValue<IdLabel>)!.id })
      }*/


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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-white text-sm">
                <Card className="bg-red-600"><CardContent>Cliente: {info?.cliente}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Data da Rifa: {info?.dataSorteio}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Tipo: {info?.tipo}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Servas: {info?.servas}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Avisos: {info?.avisos}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Complementares: {info?.complementares}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Não Cadastrados: {info?.naoCadastrados}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Total: {info?.total}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Vendidos: {info?.vendidos}</CardContent></Card>
                <Card className="bg-red-600"><CardContent>Não Vendidos: {info?.naoVendidos}</CardContent></Card>
                <Card className="bg-red-600 col-span-2"><CardContent>Talões: {info?.talaoResumo}</CardContent></Card>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button className="bg-blue-600 text-white">Enviar para a Gráfica...</Button>
                <Button className="bg-blue-600 text-white">Imprimir Conferência</Button>
                <Button className="bg-blue-600 text-white">Conferência Por Vendedor...</Button>
                <Button className="bg-blue-600 text-white">Vales</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                    placeholder="Número"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && empresaIdStr && rifaIdStr) {
                            fetchBilhetes({ empresaId: empresaIdStr, rifaId: rifaIdStr, numero: numero })
                        }
                    }}

                />

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

                <Separator></Separator>




            </div>
            <DynamicBilheteResult mode={mode} data={data} />
        </div>
    )
}
