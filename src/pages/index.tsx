// pages/dashboard.tsx

'use client'

import { useEffect, useState } from 'react'
import instance from '@lib/axios'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Card } from '@components/ui/card'

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

  useEffect(() => {
    instance.get<DashboardResponse>('/dashboard')
      .then((res) => {
        if (res.data.success) {
          setEmpresas(res.data.data)
        } else {
          alert(res.data.errorMessage)
        }
      })
      .catch(() => alert('Erro ao carregar dashboard'))
  }, [])

  useEffect(() => {
    if (empresas.length > 0) {
      setSelectedEmpresaId(empresas[0].empresaId.toString())
    }
  }, [empresas])

  return (
    <div>
      <Tabs value={selectedEmpresaId} onValueChange={setSelectedEmpresaId} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-4">
          {empresas.map((empresa) => (
            <TabsTrigger
              key={empresa.empresaId}
              value={empresa.empresaId.toString()}
              className="px-1 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-700 
                   data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              {empresa.empresaNome}
            </TabsTrigger>
          ))}
        </TabsList>

        {empresas.map((empresa) => (
          <TabsContent key={empresa.empresaId} value={empresa.empresaId.toString()}>
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Modelos de Rifa</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {empresa.rifaModeloList.map((modelo) => (
                    <Card key={modelo.id} className="p-4">
                      <h3 className="text-lg font-semibold">{modelo.tipo}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{modelo.descricao}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Rifas Ativas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {empresa.rifaList.map((rifa) => (
                    <Card key={rifa.id} className="p-4">
                      <h3 className="text-lg font-semibold">Modalidade: {rifa.modalidadeVenda}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Data do Sorteio: {rifa.dataSorteio}</p>
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