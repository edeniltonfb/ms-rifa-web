
interface CheckboxProps {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
}

export const SimpleCheckbox: React.FC<CheckboxProps> = ({ id, checked, onCheckedChange, label }) => {
    return (
        <div className="flex items-center space-x-2 p-2 border rounded cursor-pointer" onClick={() => onCheckedChange(!checked)}>
            <div
                className={`w-4 h-4 border-2 rounded ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}
                role="checkbox"
                aria-checked={checked}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white m-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <label htmlFor={id} className="text-sm font-medium leading-none">
                {label}
            </label>
        </div>
    );
};
