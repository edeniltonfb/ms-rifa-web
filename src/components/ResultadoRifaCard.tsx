import { useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import Select from 'react-select'
import { Input } from '@components/ui/input'
import Modal from './Modal'
import { toast } from 'react-toastify'
import instance from '@lib/axios'
import { Rifa, situacoes } from '@common/data'
import { useAppContext } from 'src/contexts/AppContext'

export function RifaCard({ rifa }: { rifa: Rifa }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [premiacaoData, setPremiacaoData] = useState(() =>
        rifa.itemPremiacaoList.map(item => {
            const situacaoObj = situacoes.find(s => s.value === item.situacao);
            return {
                ...item,
                situacao: situacaoObj || { label: 'Indefinido', value: 'IND' }
            };
        })
    );

    useEffect(() => {
        setPremiacaoData(
            rifa.itemPremiacaoList.map(item => {
                const situacaoObj = situacoes.find(s => s.value === item.situacao);
                return {
                    ...item,
                    situacao: situacaoObj || { label: 'Indefinido', value: 'IND' }
                };
            })
        );
    }, [rifa]);


    const { loading, showLoader, hideLoader } = useAppContext();

    const handleSituacaoChange = (value: any, idx: number) => {
        const updated = [...premiacaoData]
        updated[idx].situacao = value
        setPremiacaoData(updated)
    }

    const handleCidadeChange = (value: string, idx: number) => {
        const updated = [...premiacaoData]
        updated[idx].cidadeApostador = value
        setPremiacaoData(updated)
    }

    const openModal = async () => {


        setIsModalOpen(true);

    }

    const handleSalvar = async () => {
        // Validação básica:
        const invalidItem = premiacaoData.find(item => {
            if (!item.situacao) {
                return true;
            }
            // Se a situação for 'VDD', então cidadeApostador é obrigatório
            if (item.situacao!.value === 'VDD') {
                return !(item.cidadeApostador && item.cidadeApostador.trim().length > 0);
            }
            // Para outras situações, não é obrigatório
            return false;
        });

        if (invalidItem) {
            toast.error('Para prêmios com situação "VDD", a cidade do apostador é obrigatória.');
            return;
        }

        const body = {
            rifaId: rifa.rifaId,
            itemPremiacaoList: premiacaoData.map(item => ({
                numero: item.numero,
                situacao: item.situacao.value,
                cidadeApostador: item.cidadeApostador,
                cidadeVendedor: item.cidadeVendedor,
                ordem: item.ordem
            }))
        }

        try {
            showLoader();
            const res = await instance.post('/registrardadospremiacao', body)
            if (res.data.success) {
                if (res.data.data) {
                    toast.success('Rifa finalizada com sucesso!')
                } else {
                    toast.success('Dados salvos. A rifa ainda não foi finalizada')
                }

                setIsModalOpen(false)
            } else {
                toast.error(res.data.errorMessage || 'Erro ao finalizar')
            }
        } catch {
            toast.error('Erro ao conectar com o servidor.')
        } finally {
            hideLoader();
        }
    }

    return (
        <>
            <div className="border rounded-md shadow-sm p-4 bg-white dark:bg-gray-900 w-full sm:w-[30%] md:w-[30%] xl:w-[20%]">
                <h3 className="font-bold text-lg mb-2">{rifa.empresa}</h3>
                <p className="text-sm text-gray-500 mb-2">{rifa.data} - {rifa.horario}</p>
                <div className="space-y-1">
                    {rifa.itemPremiacaoList.map((item, idx) => (
                        <div key={idx} className="text-sm border p-2 rounded bg-gray-100 dark:bg-gray-800">
                            <div className='text-[28px] pb-4 text-center'><strong>{item.numero}</strong></div>
                            <div><strong>{item.ordem}º -</strong> {item.descricao}</div>
                            <div><strong>{item.talao}</strong> {item.vendedor}</div>
                        </div>
                    ))}
                </div>
                <Button className="mt-4 w-full" onClick={() => setIsModalOpen(true)}>Finalizar...</Button>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)} title={`Finalizar - ${rifa.empresa}`}>
                    <div className="space-y-1 px-2">
                        {premiacaoData.map((item, idx) => (

                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 border rounded p-2 items-center space-x-2 space-y-1 bg-gray-50 dark:bg-gray-800">
                                <div className="text-3xl font-bold text-center">{item.numero}</div>
                                <div>
                                    <Select
                                        options={situacoes}
                                        value={item.situacao}
                                        onChange={(v: any) => handleSituacaoChange(v, idx)}
                                        placeholder="Situação"
                                        isClearable
                                    />

                                </div>
                                <div>
                                    <Input
                                        placeholder="Cidade do ganhador"
                                        value={item.cidadeApostador}
                                        onChange={(e: any) => handleCidadeChange(e.target.value, idx)}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className='flex flex-row space-x-4'>
                            <Button className="w-full mt-2" onClick={handleSalvar} disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>

                            <Button className="w-full mt-2" onClick={() => setIsModalOpen(false)}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    )
}
