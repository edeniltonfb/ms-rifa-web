// pages/cobradores/edit.tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import instance from '@lib/axios'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { useAppContext } from 'src/contexts/AppContext'

interface CobradorForm {
    id?: number
    nome: string
    login: string
    comissao: number
    email: string
    whatsapp: string
    ativo: boolean
}

export default function CobradorEditPage() {
    const router = useRouter()
    const { id } = router.query

    const [form, setForm] = useState<CobradorForm>({
        nome: '',
        login: '',
        comissao: 0,
        email: '',
        whatsapp: '',
        ativo: true,
    })
    const { loading, showLoader, hideLoader } = useAppContext();
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const isEdit = !!id

    useEffect(() => {
        if (isEdit) {
            showLoader()
            instance.get(`/buscarcobrador?id=${id}`)
                .then((res) => {
                    if (res.data.success) {
                        setForm(res.data.data)
                    } else {
                        alert(res.data.errorMessage)
                    }
                })
                .catch(() => alert('Erro ao carregar cobrador'))
                .finally(() => hideLoader())
            
        }
    }, [id])

    const validate = () => {
        const newErrors: typeof errors = {}
        if (!/^[0-9]{4}$/.test(form.login)) newErrors.login = 'Login deve conter 4 números'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'E-mail inválido'
        if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(form.whatsapp)) newErrors.whatsapp = 'WhatsApp inválido'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const formatWhatsapp = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11)
        if (digits.length < 3) return digits
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    }

    const handleChange = (field: keyof CobradorForm, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!validate()) return
        showLoader()
        try {
            const response = await instance.post('/cadastrarcobrador', {
                ...form,
                whatsapp: form.whatsapp.replace(/\D/g, ''),
            })
            if (response.data.success) {
                router.push('/cobradores')
            } else {
                alert(response.data.errorMessage)
            }
        } catch (e) {
            alert('Erro ao salvar')
        } finally {
            hideLoader()
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Editar Cobrador' : 'Novo Cobrador'}</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nome</label>
                    <Input value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} />
                </div>

                <div>
                    <label className="block text-sm font-medium">Login</label>
                    <Input
                        value={form.login}
                        onChange={(e) => handleChange('login', e.target.value.replace(/\D/g, ''))}
                        disabled={isEdit}
                        maxLength={4}
                    />
                    {errors.login && <p className="text-sm text-red-500">{errors.login}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Comissão (%)</label>
                    <Input
                        type="number"
                        value={form.comissao}
                        onChange={(e) => handleChange('comissao', parseFloat(e.target.value))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <Input value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">WhatsApp</label>
                    <Input
                        value={form.whatsapp}
                        onChange={(e) => handleChange('whatsapp', formatWhatsapp(e.target.value))}
                        maxLength={15}
                    />
                    {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.ativo}
                        onChange={(e) => handleChange('ativo', e.target.checked)}
                        id="ativo"
                    />
                    <label htmlFor="ativo">Ativo</label>
                </div>

                <div className="flex justify-between mt-6">
                    <Link href="/cobradores">
                        <Button variant="outline">Cancelar</Button>
                    </Link>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
