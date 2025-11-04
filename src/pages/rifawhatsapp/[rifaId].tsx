import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { useAppContext } from "src/contexts/AppContext"
import instance from "@lib/axios"
import { toast } from "react-toastify"
import Modal from "@components/Modal"
import { Separator } from "@components/ui/separator"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { NumericFormat } from "react-number-format"

interface ConfiguracaoVenda {
    horaLimiteVenda: string
    valorBilhete: number
    comissaoVendedor: number
    comissaoCobrador: number
    vendaHabilitada: boolean
    linkImagem: string
}

interface VendaWhatsapp {
    vendedor: string
    dataHoraVenda: string
    quantidade: number
    numeros: string[]
    valor: number
    cidade: string
    cliente: string
    telefone: string
}

export default function ConfiguracaoVendaWhatsappPage() {
    const router = useRouter()
    const { rifaId } = router.query
    const { showLoader, hideLoader } = useAppContext()

    const [config, setConfig] = useState<ConfiguracaoVenda | null>(null)
    const [vendas, setVendas] = useState<VendaWhatsapp[]>([])
    const [modalOpen, setModalOpen] = useState(false)

    const [page, setPage] = useState(0)
    const [size] = useState(10)
    const [totalPages, setTotalPages] = useState(0)

    const [form, setForm] = useState({
        horaLimiteVenda: new Date() as Date | null,
        valorBilhete: 0,
        comissaoVendedor: 0,
        comissaoCobrador: 0,
        imageBase64: "",
    })

    useEffect(() => {
        if (rifaId) {
            carregarConfiguracao()
            listarVendas(0)
        }
    }, [rifaId])

    const carregarConfiguracao = async () => {
        try {
            showLoader()
            const res = await instance.get("/configuracaovendawhatsapp", { params: { rifaId } })
            if (res.data.success) {
                const d = res.data.data
                setConfig(d)
                // converter string "dd/MM/yyyy HH:mm" para Date
                const [dateStr, timeStr] = d.horaLimiteVenda.split(" ")
                const [day, month, year] = dateStr.split("/").map(Number)
                const [hour, minute] = timeStr.split(":").map(Number)
                setForm({
                    horaLimiteVenda: new Date(year, month - 1, day, hour, minute),
                    valorBilhete: d.valorBilhete,
                    comissaoVendedor: d.comissaoVendedor,
                    comissaoCobrador: d.comissaoCobrador,
                    imageBase64: "",
                })
            } else toast.error(res.data.errorMessage)
        } catch {
            toast.error("Erro ao carregar configuração")
        } finally {
            hideLoader()
        }
    }

    const listarVendas = async (pageNumber: number) => {
        try {
            showLoader()
            const res = await instance.get("/listarvendaswhatsapp", {
                params: { rifaId, page: pageNumber, size },
            })
            if (res.data.success) {
                const content = res.data.data
                setVendas(content.slice(pageNumber * size, pageNumber * size + size))
                setTotalPages(Math.ceil(content.length / size))
                setPage(pageNumber)
            } else toast.error(res.data.errorMessage)
        } catch {
            toast.error("Erro ao listar vendas")
        } finally {
            hideLoader()
        }
    }

    const salvarConfiguracao = async () => {
        // validação de comissão
        if (form.comissaoVendedor + form.comissaoCobrador >= form.valorBilhete) {
            toast.error("A soma das comissões não pode ser igual ou maior que o valor do bilhete.")
            return
        }

        try {
            showLoader()
            const data = form.horaLimiteVenda
            if(data == null){
                toast.error('Selecione a data/hora limite para a venda')
                return
            }
            const dia = String(data.getDate()).padStart(2, "0")
            const mes = String(data.getMonth() + 1).padStart(2, "0")
            const ano = data.getFullYear()
            const hora = String(data.getHours()).padStart(2, "0")
            const minuto = String(data.getMinutes()).padStart(2, "0")
            const dataStr = `${dia}/${mes}/${ano} ${hora}:${minuto}`

            const res = await instance.post("/configurarvendawhatsapp", {
                horaLimiteVenda: dataStr,
                valorBilhete: form.valorBilhete,
                comissaoVendedor: form.comissaoVendedor,
                comissaoCobrador: form.comissaoCobrador,
                imageBase64: form.imageBase64,
                rifaId: Number(rifaId),
            })
            if (res.data.success) {
                toast.success("Configuração salva com sucesso")
                setModalOpen(false)
                carregarConfiguracao()
            } else toast.error(res.data.errorMessage)
        } catch {
            toast.error("Erro ao salvar configuração")
        } finally {
            hideLoader()
        }
    }

    const habilitarVenda = async () => {
        try {
            showLoader()
            const res = await instance.put("/habilitarvendaonline", null, { params: { rifaId } })
            if (res.data.success) {
                toast.success("Venda habilitada")
                carregarConfiguracao()
            } else toast.error(res.data.errorMessage)
        } catch {
            toast.error("Erro ao habilitar venda")
        } finally {
            hideLoader()
        }
    }

    const desabilitarVenda = async () => {
        try {
            showLoader()
            const res = await instance.put("/desabilitarvendaonline", null, { params: { rifaId } })
            if (res.data.success) {
                toast.success("Venda desabilitada")
                carregarConfiguracao()
            } else toast.error(res.data.errorMessage)
        } catch {
            toast.error("Erro ao desabilitar venda")
        } finally {
            hideLoader()
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setForm((prev) => ({ ...prev, imageBase64: reader.result as string }))
        reader.readAsDataURL(file)
    }

    return (
        <div className="space-y-4">
            {config && (
                <>
                    <div className="flex flex-wrap gap-4 items-center justify-between border p-4 rounded-md bg-gray-50 dark:bg-gray-900">
                        <div>
                            <p><strong>Hora limite:</strong> {config.horaLimiteVenda}</p>
                            <p><strong>Valor bilhete:</strong> R$ {config.valorBilhete.toFixed(2)}</p>
                            <p><strong>Comissão vendedor:</strong> R$ {config.comissaoVendedor.toFixed(2)}</p>
                            <p><strong>Comissão cobrador:</strong> R$ {config.comissaoCobrador.toFixed(2)}</p>
                            <p><strong>Status:</strong> {config.vendaHabilitada ? "Habilitada" : "Desabilitada"}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => setModalOpen(true)}>Editar</Button>
                            {config.vendaHabilitada ? (
                                <Button variant="outline" onClick={desabilitarVenda}>
                                    Desabilitar Venda
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={habilitarVenda}>
                                    Habilitar Venda
                                </Button>
                            )}
                        </div>
                    </div>

                    {config.linkImagem && (
                        <img src={config.linkImagem} alt="Imagem" className="max-w-xs rounded-md shadow" />
                    )}
                </>
            )}

            {!config &&
                <Button onClick={() => setModalOpen(true)}>Configurar</Button>
                            
            }
            <Separator />

            {/* Listagem de vendas */}
            <h2 className="text-lg font-semibold">Vendas WhatsApp</h2>
            <div className="overflow-x-auto border rounded shadow-sm bg-white dark:bg-gray-900">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-800">
                        <tr>
                            <th className="p-2 text-left">Vendedor</th>
                            <th className="p-2 text-left">Data/Hora</th>
                            <th className="p-2 text-left">Qtd</th>
                            <th className="p-2 text-left">Números</th>
                            <th className="p-2 text-left">Valor</th>
                            <th className="p-2 text-left">Cliente</th>
                            <th className="p-2 text-left">Telefone</th>
                            <th className="p-2 text-left">Cidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendas.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center p-4">Nenhuma venda encontrada.</td>
                            </tr>
                        ) : (
                            vendas.map((v, i) => (
                                <tr key={i} className="border-t hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <td className="p-2">{v.vendedor}</td>
                                    <td className="p-2">{v.dataHoraVenda}</td>
                                    <td className="p-2">{v.quantidade}</td>
                                    <td className="p-2">{v.numeros.join(", ")}</td>
                                    <td className="p-2">R$ {v.valor.toFixed(2)}</td>
                                    <td className="p-2">{v.cliente}</td>
                                    <td className="p-2">{v.telefone}</td>
                                    <td className="p-2">{v.cidade}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button disabled={page === 0} onClick={() => listarVendas(page - 1)}>
                        Anterior
                    </Button>
                    <span className="text-sm">
                        Página {page + 1} de {totalPages}
                    </span>
                    <Button disabled={page + 1 >= totalPages} onClick={() => listarVendas(page + 1)}>
                        Próxima
                    </Button>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <Modal title="Configurar Venda WhatsApp" onClose={() => setModalOpen(false)}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm">Hora Limite da Venda</label>
                            <DatePicker
                                selected={form.horaLimiteVenda}
                                onChange={(date: Date|null) => setForm((p) => ({ ...p, horaLimiteVenda: date }))}
                                showTimeSelect
                                dateFormat="dd/MM/yyyy HH:mm"
                                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-sm">Valor Bilhete (R$)</label>
                                <NumericFormat
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    value={form.valorBilhete}
                                    onValueChange={(v) => setForm((p) => ({ ...p, valorBilhete: v.floatValue || 0 }))}
                                    customInput={Input}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm">Comissão Vendedor (R$)</label>
                                <NumericFormat
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    value={form.comissaoVendedor}
                                    onValueChange={(v) => setForm((p) => ({ ...p, comissaoVendedor: v.floatValue || 0 }))}
                                    customInput={Input}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm">Comissão Cobrador (R$)</label>
                                <NumericFormat
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    value={form.comissaoCobrador}
                                    onValueChange={(v) => setForm((p) => ({ ...p, comissaoCobrador: v.floatValue || 0 }))}
                                    customInput={Input}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">Imagem</label>
                            <Input type="file" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                            <Button onClick={salvarConfiguracao}>Salvar</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
