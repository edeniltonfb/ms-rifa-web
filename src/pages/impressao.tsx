// src/pages/builder.tsx
import React, { useState } from 'react';
import {
    DndContext,
    useDraggable,
    DragEndEvent
} from '@dnd-kit/core';
import { CSS, Transform } from '@dnd-kit/utilities';

// --- Importações de bibliotecas sem estilo (Radix UI e Headless UI) ---
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Slider from '@radix-ui/react-slider';
import { Dialog as HeadlessDialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { useAuth } from 'src/contexts/AuthContext';
import instance from '@lib/axios';
import { Button } from '@components/ui/button';
import { toast } from 'react-toastify';


// --- Constantes ---
const A4_PORTRAIT_WIDTH = 595; // px
const A4_PORTRAIT_HEIGHT = 842; // px
const DRAGGABLE_ITEM_WIDTH = 120; // px
const DRAGGABLE_ITEM_HEIGHT = 60; // px


// Componente Elemento Arrastável (adaptado para Tailwind)
interface DraggableItemProps {
    id: string;
    content: string;
    initialTransform: Transform;
}

function DraggableItem({ id, content, initialTransform }: DraggableItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    const finalTransform: Transform = transform
        ? {
            x: initialTransform.x + transform.x,
            y: initialTransform.y + transform.y,
            scaleX: initialTransform.scaleX,
            scaleY: initialTransform.scaleY,
        }
        : initialTransform;

    const style = {
        transform: CSS.Translate.toString(finalTransform),
        cursor: transform ? 'grabbing' : 'grab',
        touchAction: 'none',
        transition: 'box-shadow 0.2s ease-in-out',
        width: `${DRAGGABLE_ITEM_WIDTH}px`,
        height: `${DRAGGABLE_ITEM_HEIGHT}px`,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-2 border border-gray-400 bg-white shadow-md flex flex-col justify-center items-center font-bold select-none absolute"
        >
            <div>{content}</div>
            <div className="text-xs text-gray-500 mt-1">
                ({Math.round(finalTransform.x)}, {Math.round(finalTransform.y)})
            </div>
        </div>
    );
}

// Interface para a estrutura de dados das posições que serão enviadas no corpo
interface PrintPosition {
    xBilhete: number;
    yBilhete: number;
    xCanhoto: number;
    yCanhoto: number;
}

// --- Interfaces para as respostas da API (adaptadas para Axios) ---
interface LayoutApiResponse {
    success: boolean;
    errorMessage: string;
    data: {
        orientacao: 'RETRATO' | 'PAISAGEM';
        quantidade: number;
        [key: string]: number | string | null;
    };
}

interface PrintTestApiResponse {
    success: boolean;
    errorMessage: string;
    data: string | null;
}


const Builder: React.FC = () => {
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [numPositions, setNumPositions] = useState<number>(1);
    const [orientation, setOrientation] = useState<'retrato' | 'paisagem'>('retrato');

    const [panelConfig, setPanelConfig] = useState<{
        numElements: number;
        orientation: 'retrato' | 'paisagem';
        panelWidth: number;
        panelHeight: number;
    } | null>(null);

    const [itemTransforms, setItemTransforms] = useState<Record<string, Transform>>({});

    const [codigo, setCodigo] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingLayout, setIsFetchingLayout] = useState(false);
    const [testPdfLink, setTestPdfLink] = useState<string | null>(null);

    const handleRadioChange = (value: string) => {
        setOrientation(value as 'retrato' | 'paisagem');
    };

    const handleSubmitForm = () => {
        if (!user?.token) {
            toast.error('Token de autenticação não disponível. Faça login novamente.');
            return;
        }

        setIsFetchingLayout(true);
        setTestPdfLink(null);

        const orientationApiValue = orientation === 'retrato' ? 1 : 2;
        const quantityApiValue = numPositions;

        instance.get<LayoutApiResponse>('/carregarlayout', {
            params: {
                token: user.token,
                orientacao: orientationApiValue,
                quantidade: quantityApiValue,
            },
        })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    const data = res.data.data;
                    const currentPanelWidth = data.orientacao === 'RETRATO' ? A4_PORTRAIT_WIDTH : A4_PORTRAIT_HEIGHT;
                    const currentPanelHeight = data.orientacao === 'RETRATO' ? A4_PORTRAIT_HEIGHT : A4_PORTRAIT_WIDTH;
                    const calculatedNumElements = data.quantidade * 2;

                    setPanelConfig({
                        numElements: calculatedNumElements,
                        orientation: data.orientacao.toLowerCase() as 'retrato' | 'paisagem',
                        panelWidth: currentPanelWidth,
                        panelHeight: currentPanelHeight,
                    });

                    const loadedTransforms: Record<string, Transform> = {};
                    for (let i = 1; i <= data.quantidade; i++) {
                        const xCanhoto = data[`xCanhoto${i}`];
                        const yCanhoto = data[`yCanhoto${i}`];
                        const xBilhete = data[`xBilhete${i}`];
                        const yBilhete = data[`yBilhete${i}`];

                        if (typeof xCanhoto === 'number' && typeof yCanhoto === 'number' &&
                            typeof xBilhete === 'number' && typeof yBilhete === 'number') {

                            const canhotoElementId = `item-${2 * (i - 1)}`;
                            const bilheteElementId = `item-${2 * (i - 1) + 1}`;

                            loadedTransforms[canhotoElementId] = {
                                x: Math.round(xCanhoto),
                                y: Math.round(yCanhoto),
                                scaleX: 1,
                                scaleY: 1,
                            };
                            loadedTransforms[bilheteElementId] = {
                                x: Math.round(xBilhete),
                                y: Math.round(yBilhete),
                                scaleX: 1,
                                scaleY: 1,
                            };
                        } else {
                            console.warn(`Dados de posição incompletos ou inválidos para o par ${i}.`);
                        }
                    }
                    setItemTransforms(loadedTransforms);
                    toast.success('Layout carregado com sucesso!');
                    setIsModalOpen(false);
                } else {
                    toast.error(res.data.errorMessage || 'Erro ao carregar layout: Dados inválidos.');
                }
            })
            .catch((error) => {
                console.error('Erro na chamada da API de carregar layout:', error);
                toast.error('Não foi possível conectar ao servidor para carregar o layout.');
            })
            .finally(() => {
                setIsFetchingLayout(false);
            });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        setTestPdfLink(null);

        setItemTransforms((prevTransforms) => {
            const prevTransform = prevTransforms[active.id] || { x: 0, y: 0, scaleX: 1, scaleY: 1 };
            return {
                ...prevTransforms,
                [active.id]: {
                    x: prevTransform.x + delta.x,
                    y: prevTransform.y + delta.y,
                    scaleX: prevTransform.scaleX,
                    scaleY: prevTransform.scaleY,
                },
            };
        });
    };

    const getItemContent = (index: number) => {
        const num = Math.floor(index / 2) + 1;
        return index % 2 === 0 ? `Canhoto ${num}` : `Bilhete ${num}`;
    };

    const handlePrintApiCall = (
        endpointSuffix: string,
        requiresCodigoValidation: boolean
    ) => {
        if (!user?.token) {
            toast.error('Token de autenticação não disponível. Faça login novamente.',);
            return;
        }
        if (!panelConfig) {
            toast.warn('Por favor, configure o layout antes de gerar o arquivo.');
            return;
        }
        if (requiresCodigoValidation && codigo.length !== 5) {
            toast.warn('O código deve ter 5 caracteres.');
            return;
        }

        setIsSubmitting(true);
        setTestPdfLink(null);

        const printPositions: PrintPosition[] = [];
        for (let i = 0; i < panelConfig.numElements; i += 2) {
            const canhotoId = `item-${i}`;
            const bilheteId = `item-${i + 1}`;

            const canhotoTransform = itemTransforms[canhotoId];
            const bilheteTransform = itemTransforms[bilheteId];

            if (!canhotoTransform || !bilheteTransform) {
                toast.error('Erro: Posições de todos os Canhotos/Bilhetes não foram encontradas.');
                setIsSubmitting(false);
                return;
            }

            printPositions.push({
                xCanhoto: Math.round(canhotoTransform.x),
                yCanhoto: Math.round(canhotoTransform.y),
                xBilhete: Math.round(bilheteTransform.x),
                yBilhete: Math.round(bilheteTransform.y),
            });
        }

        let params: { token: string; codigo?: string } = { token: user.token };
        if (requiresCodigoValidation) {
            params.codigo = codigo;
        }

        instance.post<PrintTestApiResponse>(`/${endpointSuffix}`, printPositions, { params })
            .then((res) => {
                if (res.data.success) {
                    if (endpointSuffix === 'gerararquivotesteimpressao') {
                        if (res.data.data) {
                            setTestPdfLink(res.data.data);
                            toast.success('Link para o arquivo de teste de impressão gerado. Clique no link abaixo para baixar.');
                            setCodigo('');
                        } else {
                            toast.error('Erro: Link de download não encontrado na resposta do teste de impressão.');
                        }
                    } else {
                        toast.success('Arquivo de impressão gerado com sucesso!');
                        setCodigo('');
                    }
                } else {
                    toast.error(res.data.errorMessage || `Erro desconhecido ao gerar arquivo via ${endpointSuffix}.`);
                }
            })
            .catch((error) => {
                console.error(`Erro na chamada da API de ${endpointSuffix}:`, error);
                toast.error(`Não foi possível conectar ao servidor para ${endpointSuffix}.`);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleSubmitPrintFileTest = () => {
        handlePrintApiCall('gerararquivotesteimpressao', false);
    };

    const handleSubmitPrintFile = () => {
        handlePrintApiCall('gerararquivoimpressao', true);
    };

    return (
        <div>
            {!panelConfig ? (
                <div className="mt-0 text-center">
                    <button
                        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Configurar Layout
                    </button>
                </div>
            ) : (
                <div className="mt-0">
                    <h2 className="text-2xl font-semibold mb-2">
                        Painel de Layout ({panelConfig.orientation === 'retrato' ? 'Retrato' : 'Paisagem'})
                    </h2>

                    <div className="mb-4">
                        <button
                            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                            onClick={() => {
                                setPanelConfig(null);
                                setTestPdfLink(null);
                            }}
                        >
                            Resetar Configuração
                        </button>
                    </div>

                    <div
                        className="p-0 border-2 border-dashed border-gray-400 relative overflow-hidden bg-white shadow-lg"
                        style={{
                            width: `${panelConfig.panelWidth}px`,
                            height: `${panelConfig.panelHeight}px`,
                            minHeight: 'auto',
                        }}
                    >
                        <DndContext onDragEnd={handleDragEnd}>
                            {Array.from({ length: panelConfig.numElements }).map((_, i) => (
                                <DraggableItem
                                    key={`item-${i}`}
                                    id={`item-${i}`}
                                    content={getItemContent(i)}
                                    initialTransform={itemTransforms[`item-${i}`] || { x: 0, y: 0, scaleX: 1, scaleY: 1 }}
                                />
                            ))}
                        </DndContext>
                    </div>

                    <div className="p-4 mt-8 bg-blue-300 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-2">Gerar Arquivo de Impressão</h3>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-grow">
                                <label htmlFor="codigo-input" className="block text-sm font-medium text-gray-700">
                                    Código (5 caracteres)
                                </label>
                                <input
                                    type="text"
                                    id="codigo-input"
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-3xl px-3 py-1 text-blue-900 ${codigo.length > 0 && codigo.length !== 5 ? 'border-red-500' : ''
                                        }`}
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    maxLength={5}
                                />
                                {codigo.length > 0 && codigo.length !== 5 && (
                                    <p className="mt-1 text-sm text-red-600">O código deve ter 5 caracteres.</p>
                                )}
                            </div>
                            <div className="flex-shrink-0 flex gap-4 mt-2 md:mt-0">
                                <button
                                    className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center w-40 h-14"
                                    onClick={handleSubmitPrintFile}
                                    disabled={codigo.length !== 5 || isSubmitting || !panelConfig}
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Gerar Arquivo'
                                    )}
                                </button>
                                <button
                                    className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center w-40 h-14"
                                    onClick={handleSubmitPrintFileTest}
                                    disabled={isSubmitting || !panelConfig}
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Testar'
                                    )}
                                </button>
                            </div>
                        </div>

                        {testPdfLink && (
                            <div className="mt-4">
                                <p className="text-gray-700">
                                    Link para download do arquivo de teste:
                                </p>
                                <a
                                    href={testPdfLink || '#'}
                                    download="layout_teste.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    Baixar Layout de Teste (.pdf)
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal do Formulário com Radix UI e Headless UI */}
            <HeadlessDialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl relative">
                            <DialogTitle className="text-xl font-semibold mb-4">
                                Configurar Layout do Painel
                            </DialogTitle>

                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Quantidade de Posições (1 a 8)
                                </label>

                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                        <Button
                                            key={n}
                                            type="button"
                                            variant={numPositions === n ? "default" : "outline"}
                                            onClick={() => setNumPositions(n)}
                                            className="w-12"
                                        >
                                            {n}
                                        </Button>
                                    ))}
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    Serão {numPositions * 2} elementos arrastáveis.
                                </p>
                            </div>


                            <fieldset className="mt-6">
                                <legend className="text-base font-medium text-gray-900">Orientação</legend>
                                <RadioGroup.Root
                                    className="flex space-x-4 mt-2"
                                    value={orientation}
                                    onValueChange={handleRadioChange}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroup.Item
                                            className="bg-white w-4 h-4 rounded-full border border-gray-300 hover:bg-gray-100 data-[state=checked]:border-blue-500 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 focus:outline-none"
                                            value="retrato"
                                            id="r1"
                                        >
                                            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500" />
                                        </RadioGroup.Item>
                                        <label htmlFor="r1" className="text-sm font-medium text-gray-700">
                                            Retrato
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroup.Item
                                            className="bg-white w-4 h-4 rounded-full border border-gray-300 hover:bg-gray-100 data-[state=checked]:border-blue-500 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 focus:outline-none"
                                            value="paisagem"
                                            id="r2"
                                        >
                                            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500" />
                                        </RadioGroup.Item>
                                        <label htmlFor="r2" className="text-sm font-medium text-gray-700">
                                            Paisagem
                                        </label>
                                    </div>
                                </RadioGroup.Root>
                            </fieldset>

                            <button
                                className="mt-8 w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                onClick={handleSubmitForm}
                                disabled={isFetchingLayout}
                            >
                                {isFetchingLayout ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Confirmar'
                                )}
                            </button>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </HeadlessDialog>
        </div>
    );
};

export default Builder;