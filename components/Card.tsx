export default function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded shadow p-4">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">{title}</h2>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}