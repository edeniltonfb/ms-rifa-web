import Select from 'react-select'

interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  value: Option | null
  onChange: (val: Option | null) => void
  label: string
  options: Option[]
}

function CustomSelect({ value, onChange, label, options }: CustomSelectProps) {
  return (
    <Select
      placeholder={label}
      options={options}
      value={value}
      onChange={onChange}
      isClearable
      menuPortalTarget={document.body}
      menuPosition="fixed"
      classNames={{
        control: (state: any) =>
          state.isFocused
            ? 'dark:bg-gray-900 border-indigo-500 ring-2 ring-indigo-500'
            : 'dark:bg-gray-900 dark:border-gray-700',
        menu: () => 'z-50 max-h-48 dark:bg-gray-900 dark:border-gray-700',
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
    />

  )
}

export default CustomSelect
