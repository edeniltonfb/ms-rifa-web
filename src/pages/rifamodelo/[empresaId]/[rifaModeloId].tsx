// pages/rifamodelo/[rifaModeloId].tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import instance from '@lib/axios'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Card } from '@components/ui/card'
import { toast } from 'react-toastify'
import { cn } from 'src/utils/cn'
import { useAppContext } from 'src/contexts/AppContext'
import CadastroTab from '@components/serva/CadastroTab'
import ConsultaTab from '@components/serva/ConsultaTab'


interface RifaModelo {
    id: number
    tipo: string
    descricao: string
    quantidadeServas: number
    quantidadeDigitos: number
}

export default function RifaModeloPage() {
    const router = useRouter()
    const { empresaId, rifaModeloId } = router.query

    const [rifaModelo, setRifaModelo] = useState<RifaModelo | null>(null)
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

    if (rifaModelo == null) return null;

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
                    <ConsultaTab empresaId={parseInt(`${empresaId}`)} rifaModeloId={rifaModelo?.id!} quantidadeDigitos={rifaModelo?.quantidadeDigitos ?? 4} rifaModelo={rifaModelo!} />
                </TabsContent>

                <TabsContent className='border-2 border-[#6C5FFC] rounded-md p-4 mt-[-1px]' value="cadastro">
                    <CadastroTab empresaId={parseInt(`${empresaId}`)} rifaModeloId={rifaModelo?.id!} quantidadeDigitos={rifaModelo?.quantidadeDigitos ?? 4} />
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
