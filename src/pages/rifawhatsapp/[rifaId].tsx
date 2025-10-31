// src/pages/taloes/index.tsx
import { useRouter } from 'next/router'
import { useAppContext } from 'src/contexts/AppContext'

export default function RifaWhatsappPage() {
    const router = useRouter()
    const { rifaId } = router.query
    const { loading, showLoader, hideLoader } = useAppContext()

    return (
        <div className="space-y-4">


            {/* Listagem */}


        </div>
    )
}
