import { Button, Card, Empty, Table, Tabs, Typography } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import type { Client, Order } from '@shared/types/models';

export function ArchivePage() {
  const clients = useClientStore((state) => state.clients.filter((client) => client.archivedAt));
  const restoreClient = useClientStore((state) => state.restoreClient);
  const orders = useOrderStore((state) => state.orders.filter((order) => order.archivedAt));
  const restoreOrder = useOrderStore((state) => state.restoreOrder);
  const clientColumns = [
    { title: 'Имя', dataIndex: 'name' }, { title: 'Телефон', dataIndex: 'phone' }, { title: 'Город', dataIndex: 'city' },
    { title: 'Действия', render: (_value: unknown, client: Client) => <Button icon={<RollbackOutlined />} onClick={() => restoreClient(client.id)}>Восстановить</Button> },
  ];
  const orderColumns = [
    { title: 'Номер', dataIndex: 'number' }, { title: 'Клиент', dataIndex: 'clientId' }, { title: 'Статус', dataIndex: 'status' },
    { title: 'Действия', render: (_value: unknown, order: Order) => <Button icon={<RollbackOutlined />} onClick={() => restoreOrder(order.id)}>Восстановить</Button> },
  ];
  return <><Typography.Title level={2}>Архив</Typography.Title><Typography.Paragraph type="secondary">Архивированные клиенты и заказы можно восстановить в рабочие списки.</Typography.Paragraph><Card><Tabs items={[{ key: 'clients', label: `Клиенты (${clients.length})`, children: <Table<Client> rowKey="id" dataSource={clients} columns={clientColumns} locale={{ emptyText: <Empty description="Архив клиентов пуст" /> }} /> }, { key: 'orders', label: `Заказы (${orders.length})`, children: <Table<Order> rowKey="id" dataSource={orders} columns={orderColumns} locale={{ emptyText: <Empty description="Архив заказов пуст" /> }} /> }]} /></Card></>;
}
