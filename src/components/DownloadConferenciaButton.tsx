import { Button } from '@components/ui/button'
import instance from '@lib/axios'
import { toast } from 'react-toastify'

interface DownloadButtonProps {
  rifaId: string
}

export default function DownloadConferenciaButton({ rifaId }: DownloadButtonProps) {

  const handleDownload = async () => {
    try {
      const res = await instance.post(`/gerararquivoconferencia?rifaId=${rifaId}`)

      if (res.data && res.data.success && res.data.data) {
        const url = res.data.data as string

        // cria um link temporário
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '') // deixa o navegador decidir o nome
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        toast.error(res.data.errorMessage || 'Erro ao gerar arquivo')
      }
    } catch (err) {
      toast.error('Falha ao se comunicar com o servidor')
    }
  }

  return (
    <Button className="bg-blue-600 text-white" onClick={handleDownload}>
      Baixar Conferência
    </Button>
  )
}
