// CadastroEdicaoResultadoPage.tsx

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { toast } from 'react-toastify'
import instance from '@lib/axios'
import Select from 'react-select'
import dayjs from 'dayjs'
import NumeroInput from '@components/NumeroInput'
import { useAppContext } from 'src/contexts/AppContext'
import CustomSelect from '@components/CustomSelect'
import { Separator } from '@components/ui/separator'

interface Resultado {
    data: string
    horario: string
    [key: string]: string | number
}

interface Rifa {
    empresa: string
    data: string
    horario: string
    itemPremiacaoList: {
        numero: string
        talao: string
        vendedor: string
    }[]
}

const horarios = [
    { label: 'Federal', value: 'FED' },
    { label: '19hs Bahia', value: '19B' }
]

const faixas = [
    { label: '1º Premio', value: '1P', quantidade: 1 },
    { label: '1º ao 5º', value: '15P', quantidade: 5 },
    { label: '1º ao 10º', value: '110P', quantidade: 10 }
]

function RifaCard({ rifa }: { rifa: Rifa }) {
    return (
        <div className="border rounded-md shadow-sm p-4 bg-white dark:bg-gray-900 w-full sm:w-[30%] md:w-[30%] xl:w-[20%]">
            <h3 className="font-bold text-lg mb-2">{rifa.empresa}</h3>
            <p className="text-sm text-gray-500 mb-2">{rifa.data} - {rifa.horario}</p>
            <div className="space-y-1">
                {rifa.itemPremiacaoList.map((item, idx) => (
                    <div key={idx} className="text-sm border p-2 rounded bg-gray-100 dark:bg-gray-800">
                        <div className='text-[28px] pb-4 text-center'><strong>{item.numero}</strong> </div>
                        <div><strong>Talão:</strong> {item.talao}</div>
                        <div><strong>Vendedor:</strong> {item.vendedor}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function CadastroEdicaoResultadoPage() {
    const [dataResultado, setDataResultado] = useState(dayjs().format('YYYY-MM-DD'))
    const [horario, setHorario] = useState<{ label: string, value: string } | null>(null)
    const [faixa, setFaixa] = useState<{ label: string, value: string, quantidade: number } | null>(null)
    const [numeros, setNumeros] = useState<string[]>([])
    const [rifas, setRifas] = useState<Rifa[]>([])
    const { showLoader, hideLoader } = useAppContext();

    useEffect(() => {
        if (horario && faixa && dataResultado) {
            buscarResultado()
        }
    }, [horario, faixa, dataResultado])

    const buscarResultado = async () => {

        try {
            showLoader();
            const res = await instance.get('/buscarresultado', {
                params: {
                    horario: horario?.value,
                    dataResultado
                }
            })

            if (res.data.success && res.data.data) {
                const resultado = res.data.data as Resultado
                const novosNumeros = []
                for (let i = 1; i <= faixa!.quantidade; i++) {
                    novosNumeros.push(resultado[`_${i}Premio`] as string || '')
                }
                setNumeros(novosNumeros)
                setRifas(Array.isArray(resultado.rifaList) ? resultado.rifaList : [])

            } else {
                limparCampos()
            }
        } catch {
            toast.error('Erro ao buscar resultado')
        } finally {
            hideLoader();
        }
    }

    const handleNumeroChange = (value: string, index: number) => {
        const newNumeros = [...numeros]
        newNumeros[index] = value.replace(/\D/g, '').slice(0, 5)
        setNumeros(newNumeros)

    }

    const validarNumeros = () => {
        if (numeros.length !== faixa?.quantidade && numeros.length > 0) return false
        const tamanho = numeros[0]?.length
        return numeros.every(n => (n.length === tamanho || n.length === 0) && (tamanho === 4 || tamanho === 5 || tamanho === 0))
    }

    const salvarResultado = async () => {
        if (!validarNumeros()) {
            toast.error('Todos os números devem ter a mesma quantidade de dígitos (4 ou 5)')
            return
        }

        const body: any = {
            horario: horario?.value,
            data: dayjs(dataResultado).format('DD/MM/YYYY')
        }

        numeros.forEach((num, idx) => {
            body[`_${idx + 1}Premio`] = num
        })

        try {
            showLoader();
            const res = await instance.post('/salvarresultado', body)
            if (res.data.success) toast.success('Resultado salvo com sucesso')
            else toast.error(res.data.errorMessage)
        } catch {
            toast.error('Erro ao salvar resultado')
        } finally {
            hideLoader();
        }
    }

    const limparCampos = () => {

        setNumeros(faixa ? Array(faixa.quantidade).fill('') : [])
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 border-2 border-[#555] p-2 rounded-md bg-[#CC9]">
                <Input type="date" value={dataResultado} onChange={(e: any) => setDataResultado(e.target.value)} className="w-full sm:w-auto h-[38px]" />

                <div className="flex-1 min-w-[150px]">
                    <CustomSelect
                        label="Horário"
                        options={horarios}
                        value={horario}
                        onChange={(v: any) => setHorario(v)}
                    />
                </div>

                <div className="flex-1 min-w-[150px]">
                    <CustomSelect
                        label="Faixa"
                        options={faixas}
                        value={faixa}
                        onChange={(v: any) => {
                            setFaixa(v)
                            setNumeros(Array(v?.quantidade || 0).fill(''))
                        }}
                    />

                </div>
            </div>

            {faixa && (
                <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-10 gap-2">
                    {numeros.map((numero, idx) => (
                        <NumeroInput
                            key={idx}
                            value={numero}
                            onChange={(val) => handleNumeroChange(val, idx)}
                            label={`${idx + 1}º Prêmio`}
                        />
                    ))}
                </div>
            )}

            <div className="flex gap-4">
                <Button onClick={salvarResultado}>Salvar</Button>
                <Button variant="outline" onClick={limparCampos}>Limpar</Button>
            </div>

            <Separator></Separator>

            {rifas.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                    {rifas.map((rifa, idx) => (
                        <RifaCard key={idx} rifa={rifa} />
                    ))}
                </div>
            )}
        </div>
    )
}
