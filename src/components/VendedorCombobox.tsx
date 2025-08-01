// src/components/CustomSelect.tsx

import React from 'react';
import Select, { SingleValue, ActionMeta } from 'react-select';

// Definindo os tipos para as props do componente
interface CustomSelectProps<T> {
    options: T[];
    value: SingleValue<T> | T[] | null; // Adicionado array de T e null
    onChange: (value: SingleValue<T> | T[] | null) => void; // Adicionado array de T e null
    placeholder?: string;
    isClearable?: boolean;
    isMulti?: boolean; // Adicionado a prop isMulti
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => string;
}

const CustomSelect = <T,>({
    options,
    value,
    onChange,
    placeholder = 'Selecione...',
    isClearable = true,
    isMulti = false, // Valor padrão para seleção simples
    getOptionLabel,
    getOptionValue,
}: CustomSelectProps<T>) => {
    return (
        <Select
            placeholder={placeholder}
            options={options}
            value={value}
            onChange={(v: SingleValue<T> | T[] | null) => onChange(v as SingleValue<T> | T[] | null)}
            isClearable={isClearable}
            isMulti={isMulti} // Passando a prop para o react-select
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
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
    );
};

export default CustomSelect;