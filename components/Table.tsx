export default function Table() {
  const rows = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ];
  return (
    <table className="w-full mt-4 bg-white dark:bg-gray-700 rounded shadow">
      <thead>
        <tr className="text-left border-b dark:border-gray-600">
          <th className="p-2">ID</th>
          <th className="p-2">Nome</th>
          <th className="p-2">Email</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} className="border-b dark:border-gray-600">
            <td className="p-2">{r.id}</td>
            <td className="p-2">{r.name}</td>
            <td className="p-2">{r.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}