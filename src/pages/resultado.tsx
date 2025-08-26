// CadastroEdicaoResultadoPage.tsx

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { toast } from 'react-toastify'
import instance from '@lib/axios'
import dayjs from 'dayjs'
import NumeroInput from '@components/NumeroInput'
import { useAppContext } from 'src/contexts/AppContext'
import CustomSelect from '@components/CustomSelect'
import { Separator } from '@components/ui/separator'
import { RifaCard } from '@components/ResultadoRifaCard'
import { CadastroResultado, horarios, Rifa } from '@common/data'

export default function CadastroEdicaoResultadoPage() {
    const [dataResultado, setDataResultado] = useState(dayjs().format('YYYY-MM-DD'))
    const [horario, setHorario] = useState<{ label: string, value: string } | null>(null)
    const [numeros, setNumeros] = useState<string[]>([])
    const [rifas, setRifas] = useState<Rifa[]>([])
    const { showLoader, hideLoader } = useAppContext();

    useEffect(() => {
        if (horario && dataResultado) {
            buscarResultado()
        }
    }, [horario, dataResultado])

    const buscarResultado = async () => {

        try {
            showLoader();
            const res = await instance.get('/buscarresultado', {
                params: {
                    horario: horario?.value,
                    dataResultado,
                }
            })

            if (res.data.success && res.data.data) {
                const resultado = res.data.data as CadastroResultado
                const novosNumeros = []
                for (let i = 1; i <= 10; i++) {
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
        if (numeros.length !== 10 && numeros.length > 0) {
            return false;
        }

        // Divide em dois subarrays com base no primeiro dígito
        const grupo1 = numeros.filter(n => n[0] >= '0' && n[0] <= '4');
        const grupo2 = numeros.filter(n => n[0] >= '5' && n[0] <= '9');

        // Função auxiliar de validação
        const validarGrupo = (grupo: string[]) => {
            if (grupo.length === 0) return true; // se não houver elementos, ok
            const tamanho = grupo[0].length;
            return grupo.every(n =>
                (n.length === tamanho || n.length === 4 || n.length === 5) &&
                (tamanho === 4 || tamanho === 5 || tamanho === 0)
            );
        };

        // valida os dois grupos
        return validarGrupo(grupo1) && validarGrupo(grupo2);
    };


    const salvarResultado = async () => {
        if (!validarNumeros()) {
            toast.error('Todos os números devem ter a mesma quantidade de dígitos (4 ou 5)')
            return
        }

        const body: any = {
            horario: horario?.value,
            data: dayjs(dataResultado).format('DD/MM/YYYY'),
        }

        numeros.forEach((num, idx) => {
            body[`_${idx + 1}Premio`] = num
        })

        try {
            showLoader();
            const res = await instance.post('/salvarresultado', body)
            if (res.data.success) {
                const resultado = res.data.data as CadastroResultado
                toast.success('Resultado salvo com sucesso')
                setRifas(Array.isArray(resultado.rifaList) ? resultado.rifaList : [])
                console.log(rifas)
            }
            else { toast.error(res.data.errorMessage) }
        } catch {
            toast.error('Erro ao salvar resultado')
        } finally {
            hideLoader();
        }
    }

    const limparCampos = () => {

        setNumeros(Array(10).fill(''))
        setRifas([])
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

            </div>

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
