import { useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Select, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { orderStatuses, type Order, type OrderStatus } from '@shared/types/models';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const Toolbar = styled.div({ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' });
const Board = styled.div({ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(190px, 1fr))', gap: 12, overflowX: 'auto', paddingBottom: 12 });
const Column = styled(Card)({ minWidth: 190, background: '#f5f7fa', '& .ant-card-head': { minHeight: 48 }, '& .ant-card-body': { padding: 10, minHeight: 180 } });
const OrderCard = styled(Card)({ marginBottom: 10, '& .ant-card-body': { padding: 12 } });
const Search = styled(Input)({ width: 320, maxWidth: '100%' });
const Deadline = styled(Typography.Paragraph)({ margin: '8px 0 !important' });

export function ProductionPage() {
  const { orders, updateOrder } = useOrderStore();
  const { clients } = useClientStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const activeOrders = useMemo(() => orders.filter((order) => !order.archivedAt && (!statusFilter || order.status === statusFilter) && (!query.trim() || order.number.toLowerCase().includes(query.trim().toLowerCase()) || (clients.find((client) => client.id === order.clientId)?.name ?? '').toLowerCase().includes(query.trim().toLowerCase()))), [clients, orders, query, statusFilter]);
  const clientName = (order: Order) => clients.find((client) => client.id === order.clientId)?.name ?? 'Клиент удалён';
  const move = (order: Order, direction: -1 | 1) => { const nextIndex = orderStatuses.indexOf(order.status) + direction; if (nextIndex >= 0 && nextIndex < orderStatuses.length) updateOrder({ ...order, status: orderStatuses[nextIndex] }); };
  return <><Header><div><Typography.Title level={2}>Производство</Typography.Title><Typography.Text type="secondary">Контроль заказов по этапам изготовления фасадов</Typography.Text></div><Tag color="blue">Заказов в работе: {activeOrders.length}</Tag></Header><Toolbar><Search allowClear prefix={<SearchOutlined />} placeholder="Поиск по номеру или клиенту" value={query} onChange={(event) => setQuery(event.target.value)} /><Select allowClear placeholder="Фильтр по этапу" value={statusFilter} options={orderStatuses.map((status) => ({ value: status, label: status }))} onChange={(value) => setStatusFilter(value)} /></Toolbar><Board>{orderStatuses.map((status, statusIndex) => { const columnOrders = activeOrders.filter((order) => order.status === status); return <Column key={status} title={<Space>{status}<Tag>{columnOrders.length}</Tag></Space>}>{columnOrders.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет заказов" /> : columnOrders.map((order) => <OrderCard key={order.id} size="small"><Typography.Text strong>{order.number}</Typography.Text><br /><Typography.Text type="secondary">{clientName(order)}</Typography.Text>{order.deadline && <Deadline type="secondary" ellipsis={{ rows: 1 }}>Срок: {new Date(order.deadline).toLocaleDateString('ru-RU')}</Deadline>}<Space><Button size="small" icon={<ArrowLeftOutlined />} disabled={statusIndex === 0} onClick={() => move(order, -1)} /><Button size="small" icon={<ArrowRightOutlined />} disabled={statusIndex === orderStatuses.length - 1} onClick={() => move(order, 1)} /></Space></OrderCard>)}</Column>; })}</Board></>;
}
