// pages/taloes/index.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import instance from '@lib/axios'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { useAppContext } from 'src/contexts/AppContext'
import { toast } from 'react-toastify'
import Modal from '@components/Modal'

type GenericIdTitleSubtitleTO = {
  id: number
  titulo: string
  subtitulo: string
}

type TalaoTO = {
  id: number
  titulo: string
  subtitulo: string
  numeros: string[]
}

export default function TaloesPage() {
  const router = useRouter()
   const { empresaId, rifaId } = router.query

    const empresaIdStr = typeof empresaId === 'string' ? empresaId : ''
    const rifaIdStr = typeof rifaId === 'string' ? rifaId : ''

  const { showLoader, hideLoader } = useAppContext()

  const [taloes, setTaloes] = useState<GenericIdTitleSubtitleTO[]>([])
  const [selectedTalao, setSelectedTalao] = useState<TalaoTO | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [criando, setCriando] = useState(false)

  // form para criação de talões
  const [quantidadeTaloes, setQuantidadeTaloes] = useState<number | ''>('')
  const [quantidadeBilhetes, setQuantidadeBilhetes] = useState<number | ''>('')

  useEffect(() => {
    if (!rifaId) return
    fetchTaloes()
  }, [rifaId])

  async function fetchTaloes() {
    if (!rifaId) return
    try {
      showLoader()
      // GET /listartaloes?rifaId=...
      const res = await instance.get('/listartaloes', {
        params: { rifaId: Number(rifaId) }
      })

      if (res.data?.success) {
        // res.data.data é um array de GenericIdTitleSubtitleTO
        setTaloes(Array.isArray(res.data.data) ? res.data.data : [])
      } else {
        toast.error(res.data?.errorMessage || 'Erro ao carregar talões')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar talões')
    } finally {
      hideLoader()
    }
  }

  async function handleOpenTalao(talaoId: number) {
    if (!rifaId) return
    try {
      showLoader()
      // GET /buscartalao?rifaId=...&talaoId=...
      const res = await instance.get('/buscartalao', {
        params: { rifaId: Number(rifaId), talaoId }
      })

      if (res.data?.success && res.data.data) {
        const t: TalaoTO = res.data.data
        setSelectedTalao(t)
        setIsModalOpen(true)
      } else {
        toast.error(res.data?.errorMessage || 'Erro ao buscar talão')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao buscar talão')
    } finally {
      hideLoader()
    }
  }

  async function handleCriarTaloes() {
    if (!rifaId) {
      toast.error('rifaId ausente na rota')
      return
    }
    if (!quantidadeTaloes || !quantidadeBilhetes) {
      toast.error('Informe quantidade de talões e bilhetes')
      return
    }

    const body = {
      rifaId: Number(rifaId),
      quantidadeTaloes: Number(quantidadeTaloes),
      quantidadeBilhetes: Number(quantidadeBilhetes)
    }

    try {
      setCriando(true)
      showLoader()
      // NOTE: na sua descrição o endpoint foi anotado com @GetMapping porém recebe @RequestBody.
      // Aqui usamos POST porque faz mais sentido enviar body. Ajuste se seu backend exigir GET.
      const res = await instance.post('/criartaloes', body)

      if (res.data?.success) {
        toast.success('Talões criados com sucesso')
        // recarrega lista
        await fetchTaloes()
        // limpa formulário
        setQuantidadeTaloes('')
        setQuantidadeBilhetes('')
      } else {
        toast.error(res.data?.errorMessage || 'Falha ao criar talões')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar talões')
    } finally {
      setCriando(false)
      hideLoader()
    }
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Talões</h1>

      {/* Aviso quando falta rifaId */}
      {!rifaId && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 rounded">
          Parâmetro <strong>rifaId</strong> ausente na URL. Passe <code>?empresaId=&rifaId=</code>.
        </div>
      )}

      {/* Criação de talões */}
      <div className="flex flex-wrap items-end gap-3 p-3 border rounded bg-white dark:bg-gray-900">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-300">Quantidade de talões</label>
          <Input
            type="number"
            value={quantidadeTaloes}
            onChange={(e: any) => setQuantidadeTaloes(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-40"
            min={1}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-300">Bilhetes por talão</label>
          <Input
            type="number"
            value={quantidadeBilhetes}
            onChange={(e: any) => setQuantidadeBilhetes(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-40"
            min={1}
          />
        </div>

        <div>
          <Button onClick={handleCriarTaloes} disabled={criando || !rifaId}>
            {criando ? 'Criando...' : 'Criar talões'}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium">Lista de talões</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {taloes.length === 0 ? (
            <div className="col-span-full p-4 text-center text-sm text-gray-500">Nenhum talão encontrado.</div>
          ) : (
            taloes.map((t) => (
              <div key={t.id} className="border rounded-md p-4 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{t.titulo}</h3>
                    <p className="text-sm text-gray-500">{t.subtitulo}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleOpenTalao(t.id)}>Ver talão</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalhe do talão */}
      {isModalOpen && selectedTalao && (
        <Modal onClose={() => { setIsModalOpen(false); setSelectedTalao(null) }} title={`${selectedTalao.titulo}`}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{selectedTalao.subtitulo}</p>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {selectedTalao.numeros.map((n, idx) => (
                <div key={idx} className="p-2 border rounded text-center bg-gray-50 dark:bg-gray-800">
                  <span className="font-mono">{n}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={() => { setIsModalOpen(false); setSelectedTalao(null) }}>Fechar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
