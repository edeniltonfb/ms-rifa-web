'use client'

import { useState, useEffect } from 'react';
import { Button } from '@components/ui/button'; // Mantemos o Button
import { DownloadIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import instance from '@lib/axios';
import { useAppContext } from 'src/contexts/AppContext';

// Usaremos uma interface simples para os dados do vendedor
interface IdLabel {
  id: string;
  label: string;
}

interface DownloadButtonProps {
  rifaId: string;
}

// Estilos básicos para simular o modal
const modalStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyles: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};


export default function DownloadConferenciaButton({ rifaId }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [vendedores, setVendedores] = useState<IdLabel[]>([]);
  const [selectedVendedorId, setSelectedVendedorId] = useState<string>('');
  const { showLoader, hideLoader } = useAppContext();

  // Efeito para carregar a lista de vendedores APENAS quando o modal abrir
  useEffect(() => {
    if (isOpen && vendedores.length === 0) {
      instance.get('/listarvendedoridlabel')
        .then(res => {
          if (res.data && res.data.success) {
            setVendedores(res.data.data || []);
          } else {
            toast.error(res.data.errorMessage || 'Erro ao carregar vendedores.');
          }
        })
        .catch(() => toast.error('Falha na comunicação ao carregar vendedores.'));
    }

    // Reseta a seleção quando o modal fecha
    if (!isOpen) {
      setSelectedVendedorId('');
    }
  }, [isOpen]);


  const handleDownload = async () => {
    setIsOpen(false); // Fecha o modal

    try {
      showLoader();

      // Constrói a URL, incluindo o vendedorId SE estiver selecionado
      let endpoint = `/gerararquivoconferencia?rifaId=${rifaId}`;
      if (selectedVendedorId) {
        endpoint += `&vendedorId=${selectedVendedorId}`;
      }

      const res = await instance.post(endpoint);

      if (res.data && res.data.success && res.data.data) {
        const url = res.data.data as string;

        // Lógica de download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success("Download iniciado!");
      } else {
        toast.error(res.data.errorMessage || 'Erro ao gerar arquivo.');
      }
    } catch (err) {
      toast.error('Falha ao se comunicar com o servidor.');
    } finally {
      hideLoader();
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVendedorId(event.target.value);
  }

  return (
    <>
      {/* Botão que abre o modal */}
      <Button
        className="bg-blue-600 text-white"
        onClick={() => setIsOpen(true)} // Abre o modal
      >
        <div className='flex items-center gap-2'>
          <DownloadIcon className="w-5 h-5" /> Conferência
        </div>
      </Button>

      {/* Modal - Renderizado condicionalmente */}
      {isOpen && (
        <div style={modalStyles}>
          <div style={modalContentStyles}>

            {/* Cabeçalho */}
            <h2 className="text-xl font-bold mb-4 text-gray-800">Download de Arquivo de Conferência</h2>
            <p className="text-sm text-gray-600 mb-6">
              Selecione um vendedor específico ou deixe em branco para um arquivo geral.
            </p>

            {/* Corpo (Select) */}
            <div className="mb-6">
              <label htmlFor="vendedor-select" className="block text-sm font-medium text-gray-700 mb-1">
                Vendedor (Opcional)
              </label>
              <select
                id="vendedor-select"
                value={selectedVendedorId}
                onChange={handleSelectChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {/* Opção padrão para download GERAL */}
                <option value="">-- GERAL (Todas Vendedores) --</option>

                {vendedores.map((vendedor) => (
                  <option key={vendedor.id} value={vendedor.id}>
                    {vendedor.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rodapé (Botões) */}
            <div className="flex justify-end space-x-3">
              {/* Botão para fechar o modal */}
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </Button>
              {/* Botão para confirmar e iniciar o download */}
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Confirmar Download
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}