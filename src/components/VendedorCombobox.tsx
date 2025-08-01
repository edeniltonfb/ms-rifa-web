// src/components/CustomSelect.tsx

import React from 'react';
import Select, { SingleValue, ActionMeta } from 'react-select';

// Definindo os tipos para as props do componente
interface CustomSelectProps<T> {
    options: T[];
    value: SingleValue<T>;
    onChange: (value: SingleValue<T>) => void;
    placeholder?: string;
    isClearable?: boolean;
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => string;
}

// O componente usa um tipo genérico <T> para ser flexível
const CustomSelect = <T,>({
    options,
    value,
    onChange,
    placeholder = 'Selecione...',
    isClearable = true,
    getOptionLabel,
    getOptionValue,
}: CustomSelectProps<T>) => {
    return (
        <Select
            placeholder={placeholder}
            options={options}
            value={value}
            onChange={(v: SingleValue<T>) => onChange(v)}
            isClearable={isClearable}
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
                input: () => 'dark:text-white',
                placeholder: () => 'dark:text-gray-400 text-gray-500',
            }}
        />
    );
};

export default CustomSelect;