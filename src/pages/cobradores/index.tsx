// pages/cobradores/index.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from 'src/components/ui/button'
import instance from '@lib/axios'
import { Input } from '@components/ui/input'
import { useAppContext } from 'src/contexts/AppContext'
import { GenericPageableResponseTO } from '@common/data'

interface Cobrador {
  id: number
  nome: string
  login: string
  email: string
  whatsapp: string
  comissao: number
  ativo: boolean
}

export default function CobradoresListPage() {
  const [nome, setNome] = useState('')
  const [ativo, setAtivo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<GenericPageableResponseTO<Cobrador>["data"] | null>(null)
  const { loading, showLoader, hideLoader } = useAppContext();


  const fetchData = async () => {
    showLoader()
    try {
      const response = await instance.get<GenericPageableResponseTO<Cobrador>>('/listarcobrador', {
        params: {
          nome,
          ativo: ativo === '' ? undefined : ativo === 'true',
          page,
          size,
          orderBy: 'nome',
          order: 'asc',
        },
      })
      if (response.data.success) {
        setData(response.data.data)
      } else {
        console.error(response.data.errorMessage)
      }
    } catch (e) {
      console.error('Erro ao buscar cobradores:', e)
    } finally {
      hideLoader()
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, size])

  const handleSearch = () => {
    setPage(0)
    fetchData()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cobradores</h1>
        <Link href="/cobradores/edit">
          <Button className="bg-blue-600 hover:bg-blue-700">Novo cobrador</Button>
        </Link>
      </div>

      <div className="flex gap-4 flex-wrap mb-4">
        <Input
          placeholder="Nome"
          value={nome}
          onChange={(e: any) => setNome(e.target.value)}
        />

        <select
          className="p-2 rounded border bg-white dark:bg-gray-800 dark:text-white"
          value={ativo}
          onChange={(e) => setAtivo(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      <div className="overflow-x-auto border rounded shadow-sm bg-white dark:bg-gray-900">
        <table className="hidden sm:table min-w-full text-sm">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Login</th>
              <th className="text-left p-2">Comissão</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">WhatsApp</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">Carregando...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">Nenhum cobrador encontrado.</td>
              </tr>
            ) : (
              data.content.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="p-2">{c.nome}</td>
                  <td className="p-2">{c.login}</td>
                  <td className="p-2">{c.comissao?.toFixed(2)}%</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2">{c.whatsapp}</td>
                  <td className="p-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${c.ativo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}
                    >
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-2">
                    <Link href={`/cobradores/edit?id=${c.id}`}>
                      <Button variant="outline" size="sm">Editar</Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile (cards) */}
        <div className="sm:hidden divide-y">
          {loading ? (
            <div className="p-4 text-center">Carregando...</div>
          ) : !data || data.content.length === 0 ? (
            <div className="p-4 text-center">Nenhum cobrador encontrado.</div>
          ) : (
            data.content.map((c) => (
              <div key={c.id} className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="font-bold text-lg mb-1">{c.nome}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300"><strong>Login:</strong> {c.login}</div>
                <div className="text-sm"><strong>Comissão:</strong> {c.comissao?.toFixed(2)}%</div>
                <div className="text-sm"><strong>Email:</strong> {c.email}</div>
                <div className="text-sm"><strong>WhatsApp:</strong> {c.whatsapp}</div>
                <div className="text-sm mb-2">
                  <strong>Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 text-xs rounded ${c.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                  >
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <Link href={`/cobradores/edit?id=${c.id}`}>
                  <Button size="sm" className="w-full">Editar</Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>


      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm">
            Página {data.number + 1} de {data.totalPages}
          </span>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
