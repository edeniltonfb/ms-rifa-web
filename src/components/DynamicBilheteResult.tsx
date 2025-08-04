import { Card, CardContent } from '@components/ui/card'

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

interface Props {
    mode: 'LIST' | 'SINGLE' | null
    data: BilheteListItem[] | BilheteDetalhado | null
}

export default function DynamicBilheteResult({ mode, data }: Props) {
    if (!mode || !data) return null

    if (mode === 'LIST' && Array.isArray(data)) {
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {data.map((item) => (
                    <Card
                        key={item.id}
                        className="relative flex flex-col w-min h-[50px] items-center justify-center">
                        <CardContent className="text-center font-mono font-bold text-xl">
                            {item.label}
                        </CardContent>
                    </Card>

                ))}
            </div>
        )
    }

    if (mode === 'SINGLE' && !Array.isArray(data)) {
        const detalhado = data as BilheteDetalhado
        return (
            <Card className="mt-4 bg-green-100 w-[300px]">
                <CardContent className="space-y-2">
                    <div><strong>Número:</strong> {detalhado.numero}</div>
                    <div><strong>Talão:</strong> {detalhado.talao}</div>
                    <div><strong>Vendedor:</strong> {detalhado.vendedor || '---'}</div>
                </CardContent>
            </Card>
        )
    }

    return null
}
