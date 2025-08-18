// pages/dashboard.tsx

'use client'

import { useEffect, useState } from 'react'
import instance from '@lib/axios'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Card } from '@components/ui/card'
import { useAppContext } from 'src/contexts/AppContext'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { Separator } from '@components/ui/separator'

interface RifaModelo {
  id: number
  tipo: string
  descricao: string
}

interface Rifa {
  id: number
  rifaModeloId: number
  modalidadeVenda: string
  dataSorteio: string
  quantidadeNumeros: number
  quantidadeNumerosPorBilhete: number
  empresaId: number
  descricao:string
}

interface EmpresaDashboard {
  empresaId: number
  empresaNome: string
  rifaList: Rifa[]
  rifaModeloList: RifaModelo[]
}

interface DashboardResponse {
  success: boolean
  invalidToken: boolean
  errorMessage: string | null
  data: EmpresaDashboard[]
}

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState<EmpresaDashboard[]>([])
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('')
  const { showLoader, hideLoader } = useAppContext();

  useEffect(() => {
    showLoader();
    instance.get<DashboardResponse>('/dashboard')
      .then((res) => {
        if (res.data.success) {
          setEmpresas(res.data.data)
        } else {
          toast.error(res.data.errorMessage)
        }
      })
      .catch(() => toast.error('Erro ao carregar dashboard'))
      .finally(() => hideLoader())
  }, [])

  useEffect(() => {
    if (empresas.length > 0) {
      setSelectedEmpresaId(empresas[0].empresaId.toString())
    }
  }, [empresas])

  return (
    <div>
      <Tabs value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}
        className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-4">
          {empresas.map((empresa) => (
            <TabsTrigger
              key={empresa.empresaId}
              value={empresa.empresaId.toString()}
              className="px-2 py-2 text-sm font-medium border-b-2 transition-all
                   border-transparent text-muted-foreground hover:text-primary hover:border-gray-300
                   data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800"
            >
              {empresa.empresaNome}
            </TabsTrigger>
          ))}
        </TabsList>

        {empresas.map((empresa) => (
          <TabsContent key={empresa.empresaId} value={empresa.empresaId.toString()}>
            <div className="space-y-4">
              <div className='space-y-4'>
                <h2 className="text-xl font-bold mb-4">Modelos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 ">
                  {empresa.rifaModeloList.map((modelo) => (

                    <Card key={modelo.id} className="p-4 border-gray-400">
                      <Link href={`/rifamodelo/${empresa.empresaId}/${modelo.id}`}>
                        <h3 className="text-2xl  font-bold">{modelo.tipo}</h3>
                        <p className="text-lg font-semibold">{modelo.descricao}</p>
                      </Link>
                    </Card>

                  ))}
                </div>
              </div>
              <Separator></Separator>
              <div className='space-y-4'>
                <h2 className="text-xl font-bold mb-4">Rifas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {empresa.rifaList.map((rifa) => (
                    <Card key={rifa.id} className="p-4 border-green-400">
                      <Link href={`/rifa/${empresa.empresaId}/${rifa.id}`}>
                        <h3 className="text-2xl  font-bold">{rifa.dataSorteio}</h3>
                        <p className="text-lg font-semibold">{rifa.descricao}</p>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}