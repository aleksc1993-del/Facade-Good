import { useState } from 'react';
import { Button, Card, DatePicker, Empty, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs, { type Dayjs } from 'dayjs';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { orderStatuses, type Order, type OrderStatus } from '@shared/types/models';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const FormGrid = styled.div({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 });
const FullWidthItem = styled(Form.Item)({ gridColumn: '1 / -1' });
interface OrderFormValues { clientId: string; number: string; status: OrderStatus; deadline: Dayjs | null; comment: string }
const emptyOrder: OrderFormValues = { clientId: '', number: '', status: 'Новый', deadline: null, comment: '' };

export function OrdersPage() {
  const { orders, addOrder, updateOrder, deleteOrder } = useOrderStore();
  const { clients } = useClientStore();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<OrderFormValues>();
  const closeModal = () => { setIsModalOpen(false); form.resetFields(); };
  const openCreateModal = () => { form.setFieldsValue(emptyOrder); setEditingOrder(null); setIsModalOpen(true); };
  const openEditModal = (order: Order) => { form.setFieldsValue({ ...order, deadline: order.deadline ? dayjs(order.deadline) : null }); setEditingOrder(order); setIsModalOpen(true); };
  const saveOrder = (values: OrderFormValues) => { const order: Order = { ...values, deadline: values.deadline?.toISOString() ?? '', id: editingOrder?.id ?? crypto.randomUUID(), createdAt: editingOrder?.createdAt ?? new Date().toISOString() }; if (editingOrder) updateOrder(order); else addOrder(order); closeModal(); };
  const clientName = (clientId: string) => clients.find((client) => client.id === clientId)?.name ?? 'Клиент удалён';
  return <>
    <Header><div><Typography.Title level={2}>Заказы</Typography.Title><Typography.Text type="secondary">Учет заказов и контроль сроков производства</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Добавить заказ</Button></Header>
    <Card><Table<Order> rowKey="id" dataSource={orders} locale={{ emptyText: <Empty description="Заказов пока нет" /> }} columns={[{ title: 'Номер', dataIndex: 'number' }, { title: 'Клиент', render: (_value: string, order: Order) => clientName(order.clientId) }, { title: 'Статус', dataIndex: 'status', render: (status: OrderStatus) => <Tag color={status === 'Выдан' ? 'green' : status === 'Готов' ? 'blue' : status === 'В работе' ? 'orange' : 'default'}>{status}</Tag> }, { title: 'Срок', dataIndex: 'deadline', render: (deadline: string) => deadline ? dayjs(deadline).format('DD.MM.YYYY') : '—' }, { title: 'Комментарий', dataIndex: 'comment', ellipsis: true }, { title: 'Действия', width: 120, render: (_value: string, order: Order) => <Space><Button aria-label="Редактировать" icon={<EditOutlined />} onClick={() => openEditModal(order)} /><Popconfirm title="Удалить заказ?" okText="Удалить" cancelText="Отмена" onConfirm={() => deleteOrder(order.id)}><Button danger aria-label="Удалить" icon={<DeleteOutlined />} /></Popconfirm></Space> }]} /></Card>
    <Modal title={editingOrder ? 'Редактирование заказа' : 'Новый заказ'} open={isModalOpen} okText="Сохранить" cancelText="Отмена" onCancel={closeModal} onOk={() => form.submit()}><Form form={form} layout="vertical" initialValues={emptyOrder} onFinish={saveOrder}><FormGrid><Form.Item name="number" label="Номер заказа" rules={[{ required: true, message: 'Введите номер заказа' }]}><Input /></Form.Item><Form.Item name="clientId" label="Клиент" rules={[{ required: true, message: 'Выберите клиента' }]}><Select options={clients.map((client) => ({ value: client.id, label: `${client.name} — ${client.phone}` }))} placeholder="Выберите клиента" /></Form.Item><Form.Item name="status" label="Статус"><Select options={orderStatuses.map((status) => ({ value: status, label: status }))} /></Form.Item><Form.Item name="deadline" label="Срок готовности"><DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} /></Form.Item><FullWidthItem name="comment" label="Комментарий"><Input.TextArea rows={3} /></FullWidthItem></FormGrid></Form></Modal>
  </>;
}
