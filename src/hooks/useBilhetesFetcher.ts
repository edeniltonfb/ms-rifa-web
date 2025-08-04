import { useState } from 'react'
import instance from '@lib/axios'
import { toast } from 'react-toastify'
import { useAppContext } from 'src/contexts/AppContext'

interface BilheteListItem {
    id: number
    label: string
}

interface BilheteDetalhado {
    id: number | null
    rifaId: number
    talao: string
    vendedor: string | null
    numero: string
}

export function useBilhetesFetcher() {
    const { showLoader, hideLoader } = useAppContext()
    const [mode, setMode] = useState<'LIST' | 'SINGLE' | null>(null)
    const [data, setData] = useState<BilheteListItem[] | BilheteDetalhado | null>(null)

    const fetchBilhetes = async (params: { empresaId: string | string[], rifaId: string | string[], cambistaId?: number, talaoId?: number, numero?: string }) => {
        showLoader()
        try {
            const res = await instance.get('/listarbilhetes', { params })
            if (res.data.success) {
                setMode(res.data.mode)
                setData(res.data.data)
            } else {
                toast.error(res.data.errorMessage)
            }
        } catch {
            toast.error('Erro ao buscar bilhetes')
        } finally {
            hideLoader()
        }
    }

    return { mode, data, fetchBilhetes }
}
