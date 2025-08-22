// src/pages/taloes/index.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useAppContext } from 'src/contexts/AppContext'
import instance from '@lib/axios'
import { toast } from 'react-toastify'
import { Separator } from '@components/ui/separator'
import Modal from '@components/Modal'
import { GenericPageableResponseTO, IdTitleSubtitle, Talao } from '@common/data'

export default function TaloesPage() {
  const router = useRouter()
  const { empresaId, rifaId } = router.query
  const { loading, showLoader, hideLoader } = useAppContext()

  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [quantidadeTaloes, setQuantidadeTaloes] = useState('')
  const [quantidadeBilhetes, setQuantidadeBilhetes] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [talaoSelecionado, setTalaoSelecionado] = useState<Talao | null>(null)
  const [data, setData] = useState<GenericPageableResponseTO<IdTitleSubtitle>["data"] | null>(null)

  useEffect(() => {
    if (rifaId) listarTaloes(page)
  }, [rifaId, page])

  const listarTaloes = async (pageNumber: number) => {
    try {
      showLoader()
      const res = await instance.get('/listartaloes', {
        params: { rifaId, page: pageNumber, size, order: 'ASC', orderBy: 'ID' }
      })
      if (res.data.success) {
        setData(res.data.data)
       
      } else {
        toast.error(res.data.errorMessage)
      }
    } catch {
      toast.error('Erro ao listar talões')
    } finally {
      hideLoader()
    }
  }

  const criarTaloes = async () => {
    if (!quantidadeTaloes || !quantidadeBilhetes) {
      toast.error('Informe as quantidades')
      return
    }
    try {
      showLoader()
      const res = await instance.post('/criartaloes', {
        rifaId,
        quantidadeTaloes: Number(quantidadeTaloes),
        quantidadeBilhetes: Number(quantidadeBilhetes)
      })
      if (res.data.success) {
        toast.success('Talões criados com sucesso')
        listarTaloes(page)
        setQuantidadeTaloes('')
        setQuantidadeBilhetes('')
      } else {
        toast.error(res.data.errorMessage)
      }
    } catch {
      toast.error('Erro ao criar talões')
    } finally {
      hideLoader()
    }
  }

  const visualizarTalao = async (talaoId: number) => {
    try {
      showLoader()
      const res = await instance.get('/buscartalao', {
        params: { rifaId, talaoId }
      })
      if (res.data.success) {
        setTalaoSelecionado(res.data.data)
        setModalOpen(true)
      } else {
        toast.error(res.data.errorMessage)
      }
    } catch {
      toast.error('Erro ao buscar talão')
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="space-y-4">
      {/* Criar Talões */}
      <div className="flex flex-wrap gap-2 items-end border p-4 rounded-md bg-gray-50 dark:bg-gray-900">
        <div>
          <label className="block text-sm">Qtd Talões</label>
          <Input
            value={quantidadeTaloes}
            onChange={(e) => setQuantidadeTaloes(e.target.value)}
            type="number"
          />
        </div>
        <div>
          <label className="block text-sm">Qtd Bilhetes</label>
          <Input
            value={quantidadeBilhetes}
            onChange={(e) => setQuantidadeBilhetes(e.target.value)}
            type="number"
          />
        </div>
        <Button onClick={criarTaloes}>Criar</Button>
      </div>

      <Separator />






      {/* Listagem */}

      <div className="overflow-x-scroll border rounded shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2">Número</th>
              <th className="text-left p-2">Vendedor</th>
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
              data.content.map((c:any) => (
                <tr key={c.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="p-2">{c.titulo}</td>
                  <td className="p-2">{c.subtitulo}</td>

                  <td className="p-2">
                    <Button variant="outline" onClick={() => visualizarTalao(c.id)}>
                      Visualizar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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



      

      {/* Modal */}
      {modalOpen &&
        <Modal onClose={() => setModalOpen(false)} title={talaoSelecionado?.titulo || ''}>
          <p className="text-sm text-gray-500">{talaoSelecionado?.subtitulo}</p>
          <div className="flex flex-wrap gap-1 m-2">
            {talaoSelecionado?.numeros?.map((num, idx) => (
              <div
                key={idx}
                className="border px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
              >
                {num}
              </div>
            ))}
          </div>
        </Modal>
      }
    </div>
  )
}
