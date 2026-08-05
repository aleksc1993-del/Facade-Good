import { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, InboxOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs, { type Dayjs } from 'dayjs';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { getItemTotal, getOrderBalance, getOrderPaid, getOrderTotal, getPaymentStatus } from '@shared/lib/order-financials';
import { orderStatuses, type Order, type OrderItem, type OrderStatus } from '@shared/types/models';
import { createDefaultCalendar, isOverdue, useProductionCalendarStore } from '@entities/production-calendar';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const FormGrid = styled.div({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 });
const FullWidthItem = styled(Form.Item)({ gridColumn: '1 / -1' });
const ItemsSection = styled.div({ gridColumn: '1 / -1' });
const TotalRow = styled.div({ display: 'flex', justifyContent: 'flex-end', marginTop: 16, fontSize: 16 });
const Search = styled(Input)({ maxWidth: 420, marginBottom: 20 });
const Filters = styled.div({ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 });
const FilterSelect = styled(Select)({ minWidth: 190 });
const OrdersCard = styled(Card)({
  '& .ant-table-thead > tr > th': {
    textAlign: 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
});
interface OrderFormValues { clientId: string; number: string; status: OrderStatus; deadline: Dayjs | null; comment: string; items: OrderItem[] }
type DebtFilter = 'all' | 'with-debt' | 'without-debt';
const emptyOrder: OrderFormValues = { clientId: '', number: '', status: orderStatuses[0], deadline: null, comment: '', items: [] };
const paymentStatusColors: Record<string, string> = { 'РћРїР»Р°С‡РµРЅРѕ': 'success', 'Р§Р°СЃС‚РёС‡РЅРѕ РѕРїР»Р°С‡РµРЅРѕ': 'warning', 'РќРµ РѕРїР»Р°С‡РµРЅРѕ': 'error' };

export function OrdersPage() {
  const { orders: allOrders, addOrder, updateOrder, archiveOrder } = useOrderStore();
  const storedOrders = allOrders.filter((order) => !order.archivedAt);
  const { clients } = useClientStore();
  const payments = usePaymentStore((state) => state.payments);
  const calendars = useProductionCalendarStore((state) => state.calendars);
  const currentCalendar = calendars.find((calendar) => calendar.year === new Date().getFullYear()) ?? createDefaultCalendar(new Date().getFullYear());
  const overdueOrders = storedOrders.filter((order) => isOverdue(order.deadline, order.status, currentCalendar));
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [deadlineFilter, setDeadlineFilter] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [debtFilter, setDebtFilter] = useState<DebtFilter>('all');
  const [form] = Form.useForm<OrderFormValues>();
  const items = Form.useWatch('items', form) ?? [];
  const orderTotal = items.reduce((total, item) => total + getItemTotal(item), 0);
  const closeModal = () => { setIsModalOpen(false); form.resetFields(); };
  const openCreateModal = () => { form.setFieldsValue(emptyOrder); setEditingOrder(null); setIsModalOpen(true); };
  const openEditModal = (order: Order) => { form.setFieldsValue({ ...order, items: order.items ?? [], deadline: order.deadline ? dayjs(order.deadline) : null }); setEditingOrder(order); setIsModalOpen(true); };
  const saveOrder = (values: OrderFormValues) => { const order: Order = { ...values, items: values.items.map((item) => ({ ...item, id: item.id || crypto.randomUUID() })), deadline: values.deadline?.toISOString() ?? '', id: editingOrder?.id ?? crypto.randomUUID(), createdAt: editingOrder?.createdAt ?? new Date().toISOString() }; if (editingOrder) updateOrder(order); else addOrder(order); closeModal(); };
  const clientName = (id: string) => clients.find((client) => client.id === id)?.name ?? 'РљР»РёРµРЅС‚ СѓРґР°Р»С‘РЅ';
  const money = (value: number) => `${value.toLocaleString('ru-RU')} в‚Ѕ`;
  const visibleOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ru-RU');
    const compactQuery = normalizedQuery.replace(/[\s()+-]/g, '');
    return storedOrders.filter((order) => {
      const client = clients.find((item) => item.id === order.clientId);
      const clientNameValue = client?.name.toLocaleLowerCase('ru-RU') ?? '';
      const clientPhone = client?.phone.toLocaleLowerCase('ru-RU') ?? '';
      const compactPhone = clientPhone.replace(/[\s()+-]/g, '');
      const matchesSearch = !normalizedQuery || order.number.toLocaleLowerCase('ru-RU').includes(normalizedQuery)
        || clientNameValue.includes(normalizedQuery)
        || clientPhone.includes(normalizedQuery)
        || compactPhone.includes(compactQuery);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesClient = !clientFilter || order.clientId === clientFilter;
      const deadline = order.deadline ? dayjs(order.deadline) : null;
      const matchesDeadline = !deadlineFilter || (deadline?.isValid() && (!deadlineFilter[0] || !deadline.isBefore(deadlineFilter[0], 'day')) && (!deadlineFilter[1] || !deadline.isAfter(deadlineFilter[1], 'day')));
      const balance = getOrderBalance(order, payments);
      const matchesDebt = debtFilter === 'all' || (debtFilter === 'with-debt' ? balance > 0 : balance <= 0);
      return matchesSearch && matchesStatus && matchesClient && matchesDeadline && matchesDebt;
    });
  }, [clients, clientFilter, deadlineFilter, debtFilter, payments, searchQuery, statusFilter, storedOrders]);
  const orders = visibleOrders;
  const resetFilters = () => { setSearchQuery(''); setStatusFilter(undefined); setClientFilter(undefined); setDeadlineFilter(null); setDebtFilter('all'); };
  return <>
    <Filters>
      <FilterSelect allowClear placeholder="РЎС‚Р°С‚СѓСЃ" value={statusFilter} options={orderStatuses.map((status) => ({ value: status, label: status }))} onChange={(value) => setStatusFilter(value as OrderStatus | undefined)} />
      <FilterSelect allowClear showSearch optionFilterProp="label" placeholder="РљР»РёРµРЅС‚" value={clientFilter} options={clients.map((client) => ({ value: client.id, label: client.name }))} onChange={(value) => setClientFilter(value as string | undefined)} />
      <DatePicker.RangePicker format="DD.MM.YYYY" value={deadlineFilter} onChange={setDeadlineFilter} />
      <FilterSelect value={debtFilter} options={[{ value: 'all', label: 'Р вЂєРЎР‹Р В±Р В°РЎРЏ Р В·Р В°Р Т‘Р С•Р В»Р В¶Р ВµР Р…Р Р…Р С•РЎРѓРЎвЂљРЎРЉ' }, { value: 'with-debt', label: 'Р СћР С•Р В»РЎРЉР С”Р С• РЎРѓ Р Т‘Р С•Р В»Р С–Р С•Р С' }, { value: 'without-debt', label: 'Р вЂР ВµР В· Р В·Р В°Р Т‘Р С•Р В»Р В¶Р ВµР Р…Р Р…Р С•РЎРѓРЎвЂљР С‘' }]} onChange={(value) => setDebtFilter(value as DebtFilter)} />
      <Button onClick={resetFilters}>Р РЋР В±РЎР‚Р С•РЎРѓР С‘РЎвЂљРЎРЉ</Button>
    </Filters>
    <Search allowClear prefix={<SearchOutlined />} placeholder="РџРѕРёСЃРє РїРѕ РєР»РёРµРЅС‚Сѓ, С‚РµР»РµС„РѕРЅСѓ РёР»Рё РЅРѕРјРµСЂСѓ Р·Р°РєР°Р·Р°" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
    <Header><div><Typography.Title level={2}>Р—Р°РєР°Р·С‹</Typography.Title><Typography.Text type="secondary">РЈС‡С‘С‚ Р·Р°РєР°Р·РѕРІ Рё РєРѕРЅС‚СЂРѕР»СЊ СЃСЂРѕРєРѕРІ РїСЂРѕРёР·РІРѕРґСЃС‚РІР°</Typography.Text>{overdueOrders.length > 0 && <Tag color="error" style={{ marginLeft: 12 }}>РџСЂРѕСЃСЂРѕС‡РµРЅРѕ: {overdueOrders.length}</Tag>}</div><Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Р”РѕР±Р°РІРёС‚СЊ Р·Р°РєР°Р·</Button></Header>
    <OrdersCard><Table<Order> rowKey="id" dataSource={orders} locale={{ emptyText: <Empty description="Р—Р°РєР°Р·РѕРІ РїРѕРєР° РЅРµС‚" /> }} columns={[{ title: 'РќРѕРјРµСЂ', dataIndex: 'number' }, { title: 'РљР»РёРµРЅС‚', render: (_value: string, order: Order) => clientName(order.clientId) }, { title: 'РЎС‚РѕРёРјРѕСЃС‚СЊ', render: (_value: string, order: Order) => money(getOrderTotal(order)) }, { title: 'РћРїР»Р°С‡РµРЅРѕ', render: (_value: string, order: Order) => money(getOrderPaid(order.id, payments)) }, { title: 'РћСЃС‚Р°С‚РѕРє', render: (_value: string, order: Order) => money(getOrderBalance(order, payments)) }, { title: 'РћРїР»Р°С‚Р°', render: (_value: string, order: Order) => { const status = getPaymentStatus(order, payments); return <Tag color={paymentStatusColors[status]}>{status}</Tag>; } }, { title: 'РЎС‚Р°С‚СѓСЃ', dataIndex: 'status', render: (status: OrderStatus) => <Tag>{status}</Tag> }, { title: 'РЎСЂРѕРє', dataIndex: 'deadline', render: (deadline: string) => deadline ? dayjs(deadline).format('DD.MM.YYYY') : 'вЂ”' }, { title: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№', dataIndex: 'comment', ellipsis: true }, { title: 'Р”РµР№СЃС‚РІРёСЏ', width: 120, render: (_value: string, order: Order) => <Space><Button aria-label="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ" icon={<EditOutlined />} onClick={() => openEditModal(order)} /><Popconfirm title="Архивировать заказ?" okText="Архивировать" cancelText="РћС‚РјРµРЅР°" onConfirm={() => archiveOrder(order.id)}><Button aria-label="Архивировать" icon={<InboxOutlined />} /></Popconfirm></Space> }]} /></OrdersCard>
    <Modal title={editingOrder ? 'Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РєР°Р·Р°' : 'РќРѕРІС‹Р№ Р·Р°РєР°Р·'} open={isModalOpen} okText="РЎРѕС…СЂР°РЅРёС‚СЊ" cancelText="РћС‚РјРµРЅР°" onCancel={closeModal} onOk={() => form.submit()} width={1000}><Form form={form} layout="vertical" initialValues={emptyOrder} onFinish={saveOrder}><FormGrid><Form.Item name="number" label="РќРѕРјРµСЂ Р·Р°РєР°Р·Р°" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="clientId" label="РљР»РёРµРЅС‚" rules={[{ required: true }]}><Select options={clients.map((client) => ({ value: client.id, label: `${client.name} вЂ” ${client.phone}` }))} /></Form.Item><Form.Item name="status" label="РЎС‚Р°С‚СѓСЃ"><Select options={orderStatuses.map((status) => ({ value: status, label: status }))} /></Form.Item><Form.Item name="deadline" label="РЎСЂРѕРє РіРѕС‚РѕРІРЅРѕСЃС‚Рё"><DatePicker format="DD.MM.YYYY" /></Form.Item><FullWidthItem name="comment" label="РљРѕРјРјРµРЅС‚Р°СЂРёР№"><Input.TextArea rows={3} /></FullWidthItem><ItemsSection><Typography.Title level={4}>РР·РґРµР»РёСЏ</Typography.Title><Form.List name="items">{(fields, { add, remove }) => <><Table locale={{ emptyText: <Empty description="РР·РґРµР»РёР№ РїРѕРєР° РЅРµС‚" /> }} rowKey="key" pagination={false} dataSource={fields} columns={[{ title: 'РќР°Р·РІР°РЅРёРµ', render: (_value: unknown, field) => <Form.Item name={[field.name, 'name']}><Input /></Form.Item> }, ...([{ key: 'height', label: 'Р’С‹СЃРѕС‚Р°' }, { key: 'width', label: 'РЁРёСЂРёРЅР°' }, { key: 'quantity', label: 'РљРѕР»РёС‡РµСЃС‚РІРѕ' }, { key: 'price', label: 'Р¦РµРЅР°' }] as const).map(({ key, label }) => ({ title: label, render: (_value: unknown, field: { name: number }) => <Form.Item name={[field.name, key]}><InputNumber min={0} /></Form.Item> })), { title: 'РЎСѓРјРјР°', render: (_value: unknown, field: { name: number }) => money(getItemTotal(items[field.name])) }, { title: '', render: (_value: unknown, field: { name: number }) => <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} /> }]} /><Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ id: crypto.randomUUID(), name: '', height: 0, width: 0, quantity: 1, price: 0 })}>Р”РѕР±Р°РІРёС‚СЊ РёР·РґРµР»РёРµ</Button></>}</Form.List><TotalRow><Typography.Text strong>РЎС‚РѕРёРјРѕСЃС‚СЊ Р·Р°РєР°Р·Р°: {money(orderTotal)}</Typography.Text></TotalRow></ItemsSection></FormGrid></Form></Modal>
  </>;
}




