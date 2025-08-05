function NumeroInput({ value, onChange, label }: { value: string; onChange: (val: string) => void; label: string }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full border rounded px-2 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xl dark:text-black"
      />
      <label className="absolute left-2 top-1 text-gray-500 text-sm pointer-events-none">
        {label}
      </label>
    </div>
  )
}

export default NumeroInput;