import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';

export default function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Usuários" value="1.024" />
        <Card title="Vendas" value="R$ 12.300" />
        <Card title="Lucro" value="R$ 3.200" />
      </div>
      <Table />
    </>
  );
}