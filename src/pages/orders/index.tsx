import { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs, { type Dayjs } from 'dayjs';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { getItemTotal, getOrderBalance, getOrderPaid, getOrderTotal, getPaymentStatus, type PaymentStatus } from '@shared/lib/order-financials';
import { orderStatuses, type Order, type OrderItem, type OrderStatus } from '@shared/types/models';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const FormGrid = styled.div({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 });
const FullWidthItem = styled(Form.Item)({ gridColumn: '1 / -1' });
const ItemsSection = styled.div({ gridColumn: '1 / -1' });
const TotalRow = styled.div({ display: 'flex', justifyContent: 'flex-end', marginTop: 16, fontSize: 16 });
const Search = styled(Input)({ maxWidth: 420, marginBottom: 20 });
const Filters = styled.div({ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 });
const FilterSelect = styled(Select)({ minWidth: 190 });
interface OrderFormValues { clientId: string; number: string; status: OrderStatus; deadline: Dayjs | null; comment: string; items: OrderItem[] }
type DebtFilter = 'all' | 'with-debt' | 'without-debt';
const emptyOrder: OrderFormValues = { clientId: '', number: '', status: orderStatuses[0], deadline: null, comment: '', items: [] };
const paymentStatusColors: Record<PaymentStatus, string> = { Оплачено: 'success', 'Частично оплачено': 'warning', 'Не оплачено': 'error' };

export function OrdersPage() {
  const { orders: storedOrders, addOrder, updateOrder, deleteOrder } = useOrderStore();
  const { clients } = useClientStore();
  const payments = usePaymentStore((state) => state.payments);
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
  const clientName = (id: string) => clients.find((client) => client.id === id)?.name ?? 'Клиент удалён';
  const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
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
      <FilterSelect value={debtFilter} options={[{ value: 'all', label: 'Р›СЋР±Р°СЏ Р·Р°РґРѕР»Р¶РµРЅРЅРѕСЃС‚СЊ' }, { value: 'with-debt', label: 'РўРѕР»СЊРєРѕ СЃ РґРѕР»РіРѕРј' }, { value: 'without-debt', label: 'Р‘РµР· Р·Р°РґРѕР»Р¶РµРЅРЅРѕСЃС‚Рё' }]} onChange={(value) => setDebtFilter(value as DebtFilter)} />
      <Button onClick={resetFilters}>РЎР±СЂРѕСЃРёС‚СЊ</Button>
    </Filters>
    <Search allowClear prefix={<SearchOutlined />} placeholder="Поиск по клиенту, телефону или номеру заказа" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
    <Header><div><Typography.Title level={2}>Заказы</Typography.Title><Typography.Text type="secondary">Учёт заказов и контроль сроков производства</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Добавить заказ</Button></Header>
    <Card><Table<Order> rowKey="id" dataSource={orders} locale={{ emptyText: <Empty description="Заказов пока нет" /> }} columns={[{ title: 'Номер', dataIndex: 'number' }, { title: 'Клиент', render: (_value: string, order: Order) => clientName(order.clientId) }, { title: 'Стоимость', render: (_value: string, order: Order) => money(getOrderTotal(order)) }, { title: 'Оплачено', render: (_value: string, order: Order) => money(getOrderPaid(order.id, payments)) }, { title: 'Остаток', render: (_value: string, order: Order) => money(getOrderBalance(order, payments)) }, { title: 'Оплата', render: (_value: string, order: Order) => { const status = getPaymentStatus(order, payments); return <Tag color={paymentStatusColors[status]}>{status}</Tag>; } }, { title: 'Статус', dataIndex: 'status', render: (status: OrderStatus) => <Tag>{status}</Tag> }, { title: 'Срок', dataIndex: 'deadline', render: (deadline: string) => deadline ? dayjs(deadline).format('DD.MM.YYYY') : '—' }, { title: 'Комментарий', dataIndex: 'comment', ellipsis: true }, { title: 'Действия', width: 120, render: (_value: string, order: Order) => <Space><Button aria-label="Редактировать" icon={<EditOutlined />} onClick={() => openEditModal(order)} /><Popconfirm title="Удалить заказ?" okText="Удалить" cancelText="Отмена" onConfirm={() => deleteOrder(order.id)}><Button danger aria-label="Удалить" icon={<DeleteOutlined />} /></Popconfirm></Space> }]} /></Card>
    <Modal title={editingOrder ? 'Редактирование заказа' : 'Новый заказ'} open={isModalOpen} okText="Сохранить" cancelText="Отмена" onCancel={closeModal} onOk={() => form.submit()} width={1000}><Form form={form} layout="vertical" initialValues={emptyOrder} onFinish={saveOrder}><FormGrid><Form.Item name="number" label="Номер заказа" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="clientId" label="Клиент" rules={[{ required: true }]}><Select options={clients.map((client) => ({ value: client.id, label: `${client.name} — ${client.phone}` }))} /></Form.Item><Form.Item name="status" label="Статус"><Select options={orderStatuses.map((status) => ({ value: status, label: status }))} /></Form.Item><Form.Item name="deadline" label="Срок готовности"><DatePicker format="DD.MM.YYYY" /></Form.Item><FullWidthItem name="comment" label="Комментарий"><Input.TextArea rows={3} /></FullWidthItem><ItemsSection><Typography.Title level={4}>Изделия</Typography.Title><Form.List name="items">{(fields, { add, remove }) => <><Table locale={{ emptyText: <Empty description="Изделий пока нет" /> }} rowKey="key" pagination={false} dataSource={fields} columns={[{ title: 'Название', render: (_value: unknown, field) => <Form.Item name={[field.name, 'name']}><Input /></Form.Item> }, ...([{ key: 'height', label: 'Высота' }, { key: 'width', label: 'Ширина' }, { key: 'quantity', label: 'Количество' }, { key: 'price', label: 'Цена' }] as const).map(({ key, label }) => ({ title: label, render: (_value: unknown, field: { name: number }) => <Form.Item name={[field.name, key]}><InputNumber min={0} /></Form.Item> })), { title: 'Сумма', render: (_value: unknown, field: { name: number }) => money(getItemTotal(items[field.name])) }, { title: '', render: (_value: unknown, field: { name: number }) => <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} /> }]} /><Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ id: crypto.randomUUID(), name: '', height: 0, width: 0, quantity: 1, price: 0 })}>Добавить изделие</Button></>}</Form.List><TotalRow><Typography.Text strong>Стоимость заказа: {money(orderTotal)}</Typography.Text></TotalRow></ItemsSection></FormGrid></Form></Modal>
  </>;
}
