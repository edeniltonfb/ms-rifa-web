// src/components/CustomSelect.tsx
import React from 'react'
import Select, { SingleValue } from 'react-select'

interface CustomSelectProps<T> {
    options: T[]
    value: SingleValue<T> | T[] | null
    onChange: (value: SingleValue<T> | T[] | null) => void
    placeholder?: string
    isClearable?: boolean
    isMulti?: boolean
    getOptionLabel: (option: T) => string
    getOptionValue: (option: T) => string
}

const CustomSelect = <T,>({
    options,
    value,
    onChange,
    placeholder = 'Selecione...',
    isClearable = true,
    isMulti = false,
    getOptionLabel,
    getOptionValue,
}: CustomSelectProps<T>) => {
    // SSR-safe: só ativa portal no client
    const portalTarget = typeof window !== 'undefined' ? document.body : undefined

    return (
        <Select
            placeholder={placeholder}
            options={options}
            value={value}
            onChange={(v: any) => onChange(v as SingleValue<T> | T[] | null)}
            isClearable={isClearable}
            isMulti={isMulti}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            menuPortalTarget={portalTarget}
            menuPosition={portalTarget ? 'fixed' : 'absolute'}
            menuPlacement="auto"
            classNames={{
                control: (state: any) =>
                    state.isFocused
                        ? 'dark:bg-gray-900 border-indigo-500 ring-2 ring-indigo-500'
                        : 'dark:bg-gray-900 dark:border-gray-700',
                menu: () =>
                    'z-100 dark:bg-gray-900 dark:border dark:border-gray-700', // ❌ sem max-h/overflow aqui
                option: (state: any) =>
                    state.isSelected
                        ? 'dark:bg-indigo-600 dark:text-white bg-indigo-600 text-white'
                        : state.isFocused
                            ? 'dark:bg-indigo-500 dark:text-white bg-indigo-500 text-white'
                            : 'dark:bg-gray-800 dark:text-white bg-white',
                singleValue: () => 'dark:text-white',
                multiValue: () =>
                    'dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-800 rounded-md',
                multiValueLabel: () => 'dark:text-white text-gray-800',
                multiValueRemove: () => 'dark:hover:bg-gray-600 hover:bg-gray-300',
                input: () => 'dark:text-white',
                placeholder: () => 'dark:text-gray-400 text-gray-500',
            }}
            styles={{
                menuList: (base: any) => ({
                    ...base,
                    maxHeight: 240, // 👈 aqui fica o limite de altura
                    overflowY: 'auto', // 👈 único scrollbar
                    paddingTop: 0,
                    paddingBottom: 0,
                }),
            }}
        />
    )
}

export default CustomSelect
