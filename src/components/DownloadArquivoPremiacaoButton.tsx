import { Button } from '@components/ui/button'
import instance from '@lib/axios'
import { DownloadIcon } from 'lucide-react';
import { toast } from 'react-toastify'
import { useAppContext } from 'src/contexts/AppContext';

interface DownloadButtonProps {
  rifaId: number
  onButtonClick: () => void;
}

export default function DownloadArquivoPremiacaoButton({ rifaId, onButtonClick }: DownloadButtonProps) {

  const { showLoader, hideLoader } = useAppContext();

  const handleDownload = async () => {
    try {
      showLoader();
      const res = await instance.get(`/gerararquivoresultado?rifaId=${rifaId}`)

      if (res.data && res.data.success && res.data.data) {
        const url = res.data.data as string

        // cria um link temporário
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '') // deixa o navegador decidir o nome
        document.body.appendChild(link)
        link.click()
        link.remove()

        onButtonClick();
        toast.success('Download realizado com sucesso')
      } else {
        toast.error(res.data.errorMessage || 'Erro ao gerar arquivo')
      }
    } catch (err) {
      toast.error('Falha ao se comunicar com o servidor')
    } finally {
      hideLoader();
    }
  }

  return (
    <Button className="w-full mt-2 bg-blue-600 text-white " onClick={handleDownload}>
      <div className='flex flex-row gap-2'> <DownloadIcon /> Conferência</div>
    </Button>
  )
}
