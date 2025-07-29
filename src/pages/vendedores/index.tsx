// pages/vendedores/index.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'

interface Vendedor {
    id: number
    nome: string
    login: string
    email: string
    whatsapp: string
    comissao: number
    ativo: boolean
    cobradorNome: string
}

interface GenericPageableResponseTO<T> {
    success: boolean
    errorMessage: string | null
    data: {
        content: T[]
        totalPages: number
        totalElements: number
        number: number
    }
}

export default function VendedoresListPage() {
    const [nome, setNome] = useState('')
    const [ativo, setAtivo] = useState('')
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)
    const [data, setData] = useState<GenericPageableResponseTO<Vendedor>["data"] | null>(null)
    const { loading, showLoader, hideLoader } = useAppContext();

    const fetchData = async () => {
        try {
            showLoader();
            const res = await instance.get<GenericPageableResponseTO<Vendedor>>('/listarvendedor', {
                params: {
                    nome,
                    ativo: ativo === '' ? undefined : ativo === 'true',
                    page,
                    size,
                    orderBy: 'nome',
                    order: 'asc',
                },
            })
            if (res.data.success) setData(res.data.data)
        } catch (e) {
            console.error('Erro ao buscar vendedores')
        } finally {
            hideLoader();
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
                <h1 className="text-2xl font-bold">Vendedores</h1>
                <Link href="/vendedores/edit">
                    <Button className="bg-blue-600 hover:bg-blue-700">Novo vendedor</Button>
                </Link>
            </div>

            <div className="flex gap-4 flex-wrap mb-4">
                <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
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
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-800">
                        <tr>
                            <th className="text-left p-2">Nome</th>
                            <th className="text-left p-2">Login</th>
                            <th className="text-left p-2 hidden sm:block">Comissão</th>
                            <th className="text-left p-2 hidden sm:block">Email</th>
                            <th className="text-left p-2">WhatsApp</th>
                            <th className="text-left p-2">Cobrador</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.content.map((v) => (
                            <tr key={v.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-800">
                                <td className="p-2">{v.nome}</td>
                                <td className="p-2">{v.login}</td>
                                <td className="p-2 hidden sm:block">{v.comissao?.toFixed(2)}%</td>
                                <td className="p-2 hidden sm:block">{v.email}</td>
                                <td className="p-2">{v.whatsapp}</td>
                                <td className="p-2">{v.cobradorNome}</td>
                                <td className="p-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${v.ativo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                        }`}>
                                        {v.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-2">
                                    <Link href={`/vendedores/edit?id=${v.id}`}>
                                        <Button variant="outline" size="sm">Editar</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}