// Segunda aba: Cadastro individual de número serva

import { useEffect, useState } from 'react'
import { Input } from '@components/ui/input'
import { Card, CardContent } from '@components/ui/card'
import { toast } from 'react-toastify'
import Select, { ActionMeta, SingleValue } from 'react-select'
import instance from '@lib/axios'
import { useAppContext } from 'src/contexts/AppContext'
import { IdLabel, RifaModelo, Serva } from '@common/data'
import CustomSelect from '@components/CustomCombobox'


interface ConsultaTabProps {
    empresaId: number
    rifaModeloId: number
    quantidadeDigitos: number
}

interface ConsultaResponse {
    numero: string
    cadastrada: boolean
    vendedor: string
}

export default function ConsultaTab({ empresaId, rifaModeloId, quantidadeDigitos }: ConsultaTabProps) {

    const [numero, setNumero] = useState('')
    const [resultadoConsulta, setResultadoConsulta] = useState<ConsultaResponse | null>(null)
    const [vendedores, setVendedores] = useState<IdLabel[]>([])
    const [vendedorSelecionado, setVendedorSelecionado] = useState<IdLabel | null>(null)
    const [servas, setServas] = useState<Serva[]>([])
    const { showLoader, hideLoader } = useAppContext();


    useEffect(() => {
        showLoader();
        instance.get('/listarvendedoridlabel')
            .then(res => {
                if (res.data.success) setVendedores(res.data.data)
                else toast.error(res.data.errorMessage)
            }).finally(() => hideLoader())
    }, [])

    const handleNumeroChange = (value: string) => {
        const clean = value.replace(/\D/g, '').slice(0, quantidadeDigitos || 4)
        setNumero(clean)
    }

    const consultarNumero = async () => {

        if (quantidadeDigitos && numero.length === quantidadeDigitos) {
            showLoader();
            setServas([]);
            setVendedorSelecionado(null);
            await instance.get(`/consultarserva?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&numero=${numero}`)
                .then(res => {
                    if (res.data.success) setResultadoConsulta(res.data.data)
                    else toast.error(res.data.errorMessage)
                }).finally(() => hideLoader())
        } else {
            setResultadoConsulta(null)
            toast.error('Número inválido')
        }
    }

    const handleVendedorChange = (v: SingleValue<IdLabel> | IdLabel[] | null) => {
        setVendedorSelecionado(v as IdLabel)
        setServas([])
        if (v) {
            fetchServasByVendedor((v as IdLabel).id);
        }
    }


    const fetchServasByVendedor = async (cambistaId: number) => {
        showLoader();
        setResultadoConsulta(null);
        setNumero('')
        instance.get(`/listarservas?empresaId=${empresaId}&rifaModeloId=${rifaModeloId}&cambistaId=${cambistaId}`)
            .then(res => {
                if (res.data.success) setServas(res.data.data)
                else toast.error(res.data.errorMessage)
            }).finally(() => hideLoader())
    }

    const handleRemoverNumero = async (numero: string) => {
        if (!vendedorSelecionado) return;

        try {
            const response = await instance.delete('/removerserva', {
                params: {
                    empresaId: empresaId,
                    rifaModeloId,
                    numero,
                },
            });

            if (response.data.success) {
                toast.success(`Número ${numero} removido com sucesso`);
                // Recarrega a lista de números
                await fetchServasByVendedor(vendedorSelecionado?.id);
            } else {
                toast.error(response.data.errorMessage || 'Erro ao remover número');
            }
        } catch (error) {
            toast.error('Erro na exclusão');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4">

                {/*<Input
                    className='text-xl w-[100px] text-center text-bold p-1'
                    placeholder={`${quantidadeDigitos || 4} dígitos`}
                    value={numero}
                    onChange={(e) => handleNumeroChange(e.target.value)}
                    maxLength={quantidadeDigitos || 4}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            consultarNumero()
                        }
                    }}
                />*/}

                <Input
                    type="text"
                    inputMode="numeric" // força teclado numérico no celular
                    className="text-xl w-[100px] text-center font-bold p-1"
                    placeholder={`${quantidadeDigitos || 4} dígitos`}
                    value={numero}
                    onChange={(e) => handleNumeroChange(e.target.value)}
                    maxLength={quantidadeDigitos || 4}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // impede submit ou quebra de linha
                            consultarNumero();
                        }
                    }}
                />

                <CustomSelect<IdLabel>
                    options={vendedores}
                    value={vendedorSelecionado}
                    onChange={handleVendedorChange}
                    isMulti={false}
                    placeholder="Selecione um vendedor"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => String(option.id)}
                />


            </div>

            {resultadoConsulta && (
                <div className="mt-4 p-4 border rounded shadow bg-white dark:bg-gray-900">
                    <p><strong>Número:</strong> {resultadoConsulta.numero}</p>
                    <p><strong>Status:</strong> {resultadoConsulta.cadastrada ? 'Cadastrado' : 'Disponível'}</p>
                    <p><strong>Vendedor:</strong> {resultadoConsulta.vendedor}</p>
                </div>
            )}

            {servas.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Números do vendedor</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {servas.map((s, idx) => (
                            <Card
                                key={idx}
                                className="relative flex flex-col w-min h-min items-center justify-center"
                            >
                                {/* Botão de excluir */}
                                <button
                                    className="absolute top-0 right-1 text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoverNumero(s.numero)}
                                    title="Remover número"
                                >
                                    ×
                                </button>

                                <CardContent className="text-center font-mono font-bold text-xl">
                                    {s.numero}
                                </CardContent>
                            </Card>

                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
