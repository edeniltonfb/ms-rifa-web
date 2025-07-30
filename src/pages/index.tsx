// pages/dashboard.tsx

'use client'

import { useEffect, useState } from 'react'
import instance from '@lib/axios'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Card } from '@components/ui/card'
import { useAppContext } from 'src/contexts/AppContext'
import Link from 'next/link'

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
}

interface EmpresaDashboard {
  empresaId: number
  empresaNome: string
  rifaList: Rifa[]
  rifaModeloList: RifaModelo[]
}

interface DashboardResponse {
  success: boolean
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
          alert(res.data.errorMessage)
        }
      })
      .catch(() => alert('Erro ao carregar dashboard'))
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
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Modelos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {empresa.rifaModeloList.map((modelo) => (

                    <Card key={modelo.id} className="p-4">
                      <Link href={`/rifamodelo/${empresa.empresaId}/${modelo.id}`}>
                        <h3 className="text-lg font-semibold">{modelo.tipo}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{modelo.descricao}</p>
                      </Link>
                    </Card>

                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Rifas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {empresa.rifaList.map((rifa) => (
                    <Card key={rifa.id} className="p-4">
                      <h3 className="text-lg font-semibold">Modalidade: {rifa.modalidadeVenda}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Data: {rifa.dataSorteio}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Qtd. Números: {rifa.quantidadeNumeros}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Números por Bilhete: {rifa.quantidadeNumerosPorBilhete}</p>
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