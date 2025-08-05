// EnvioParaImpressaoPage.tsx

import { useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import Select from 'react-select'
import instance from '@lib/axios'
import { toast } from 'react-toastify'
import CustomSelect from '@components/CustomCombobox'

interface IdLabel {
  id: number
  label: string
}

export default function EnvioParaImpressaoPage() {
  const [modo, setModo] = useState<'UNICA' | 'MULTIPLAS' | null>(null)
  const [empresas, setEmpresas] = useState<IdLabel[]>([])
  const [rifasPorEmpresa, setRifasPorEmpresa] = useState<{ [key: number]: IdLabel[] }>({})
  const [selecaoUnica, setSelecaoUnica] = useState<{ empresa: IdLabel | null, rifa: IdLabel | null }>({ empresa: null, rifa: null })
  const [selecaoMultiplas, setSelecaoMultiplas] = useState<{ empresa: IdLabel | null, rifa: IdLabel | null }[]>([
    { empresa: null, rifa: null },
    { empresa: null, rifa: null },
    { empresa: null, rifa: null },
    { empresa: null, rifa: null }
  ])

  useEffect(() => {
    instance.get('/listarempresas').then(res => {
      if (res.data.success) setEmpresas(res.data.data)
      else toast.error(res.data.errorMessage)
    })
  }, [])

  const carregarRifas = async (empresaId: number) => {
    if (rifasPorEmpresa[empresaId]) return

    const res = await instance.get(`/listarrifasporempresa?empresaId=${empresaId}`)
    if (res.data.success) {
      setRifasPorEmpresa(prev => ({ ...prev, [empresaId]: res.data.data }))
    } else {
      toast.error(res.data.errorMessage)
    }
  }

  const handleEnvio = async (rifaIds: number[]) => {
    try {
      const res = await instance.post('/preparararquivoimpressao', { rifaIdList: rifaIds })
      if (res.data.success) {
        toast.success('Arquivo preparado com sucesso')
      } else {
        toast.error(res.data.errorMessage)
      }
    } catch {
      toast.error('Erro ao enviar para impressão')
    }
  }

  return (
    <div className="space-y-4">
      <div className='w-[250px]'>

        <Select
          placeholder="Selecione o Modo"
          options={[
            { label: 'Rifa Única', value: 'UNICA' },
            { label: 'Múltiplas Rifas', value: 'MULTIPLAS' }
          ]}
          onChange={(v: any) => setModo(v?.value as 'UNICA' | 'MULTIPLAS')}
          isClearable
          classNames={{
            control: (state: any) =>
              state.isFocused
                ? 'dark:bg-gray-900 border-indigo-500 ring-2 ring-indigo-500'
                : 'dark:bg-gray-900 dark:border-gray-700',
            menu: () => 'z-50 max-h-48 overflow-y-auto dark:bg-gray-900 dark:border-gray-700',
            option: (state: any) =>
              state.isSelected
                ? 'dark:bg-indigo-600 dark:text-white bg-indigo-600 text-white'
                : state.isFocused
                  ? 'dark:bg-indigo-500 dark:text-white bg-indigo-500 text-white'
                  : 'dark:bg-gray-800 dark:text-white bg-white',
            singleValue: () => 'dark:text-white',
            multiValue: () => 'dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-800 rounded-md',
            multiValueLabel: () => 'dark:text-white text-gray-800',
            multiValueRemove: () => 'dark:hover:bg-gray-600 hover:bg-gray-300',
            input: () => 'dark:text-white',
            placeholder: () => 'dark:text-gray-400 text-gray-500',
          }}
        />
      </div>
      <div className='border-2 border-[#555] p-2 rounded-md'>
        {modo === 'UNICA' && (
          <div className="space-y-4 w-[250px]">
            <CustomSelect<IdLabel>
              options={empresas}
              value={selecaoUnica.empresa}
              onChange={(v: any) => {
                setSelecaoUnica({ empresa: v, rifa: null })
                if (v) carregarRifas(v.id)
              }}
              isMulti={false}
              placeholder="Selecione a Empresa"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => String(option.id)}
            />


            {selecaoUnica.empresa && (
              <CustomSelect<IdLabel>
                options={rifasPorEmpresa[selecaoUnica.empresa.id] || []}
                value={selecaoUnica.rifa}
                onChange={(v: any) => setSelecaoUnica(prev => ({ ...prev, rifa: v }))}
                isMulti={false}
                placeholder="Selecione a Rifa"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => String(option.id)}
              />
            )}
            {selecaoUnica.rifa && (
              <Button onClick={() => handleEnvio([selecaoUnica.rifa!.id])}>
                Enviar
              </Button>
            )}
          </div>
        )}

        {modo === 'MULTIPLAS' && (

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {selecaoMultiplas.map((selecao, index) => (
              <div key={index} className="space-y-2 border p-2 rounded">

                <CustomSelect<IdLabel>
                  options={empresas}
                  value={selecao.empresa}
                  onChange={(v: any) => {
                    const novasSelecoes = [...selecaoMultiplas]
                    novasSelecoes[index] = { empresa: v, rifa: null }
                    setSelecaoMultiplas(novasSelecoes)
                    if (v) carregarRifas(v.id)
                  }}
                  isMulti={false}
                  placeholder="Selecione a Empresa"
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => String(option.id)}
                />
                {selecao.empresa && (
                  <CustomSelect<IdLabel>
                    options={rifasPorEmpresa[selecao.empresa.id] || []}
                    value={selecao.rifa}
                    onChange={(v: any) => {
                      const novasSelecoes = [...selecaoMultiplas]
                      novasSelecoes[index] = { ...novasSelecoes[index], rifa: v }
                      setSelecaoMultiplas(novasSelecoes)
                    }}
                    isMulti={false}
                    placeholder="Selecione a Rifa"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => String(option.id)}
                  />
                )}

              </div>
            ))}
          </div>

        )}
      </div>
      {modo === 'MULTIPLAS' && selecaoMultiplas.every(s => s.rifa) && (
        <Button
          onClick={() => handleEnvio(selecaoMultiplas.map(s => s.rifa!.id))}
        >
          Enviar
        </Button>
      )}
    </div>
  )
}
