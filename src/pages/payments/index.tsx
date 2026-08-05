import { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Empty, Form, InputNumber, Modal, Popconfirm, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs, { type Dayjs } from 'dayjs';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { paymentTypes, type Payment, type PaymentType } from '@shared/types/models';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const Summary = styled.div({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 });
interface PaymentFormValues { orderId: string; date: Dayjs; amount: number; type: PaymentType }
const getPaymentSign = (type: PaymentType) => (type === 'Возврат' ? -1 : 1);

export function PaymentsPage() {
  const { orders } = useOrderStore();
  const { payments, addPayment, deletePayment } = usePaymentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<PaymentFormValues>();
  const totalReceived = useMemo(() => payments.reduce((sum, payment) => sum + getPaymentSign(payment.type) * payment.amount, 0), [payments]);
  const orderTotal = (orderId: string) => orders.find((order) => order.id === orderId)?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) ?? 0;
  const orderLabel = (orderId: string) => { const order = orders.find((item) => item.id === orderId); return order ? `Заказ №${order.number}` : 'Заказ удалён'; };
  const openModal = () => { form.resetFields(); form.setFieldValue('date', dayjs()); setIsModalOpen(true); };
  const savePayment = (values: PaymentFormValues) => { addPayment({ ...values, date: values.date.toISOString(), id: crypto.randomUUID() }); setIsModalOpen(false); form.resetFields(); };
  return <>
    <Header><div><Typography.Title level={2}>Платежи</Typography.Title><Typography.Text type="secondary">История оплат и возвратов по заказам</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={openModal}>Добавить платёж</Button></Header>
    <Summary><Card><Statistic title="Получено всего" value={totalReceived} suffix="₽" /></Card><Card><Statistic title="Платежей" value={payments.length} /></Card><Card><Statistic title="Возвратов" value={payments.filter((payment) => payment.type === 'Возврат').length} /></Card></Summary>
    <Card><Table<Payment> rowKey="id" dataSource={[...payments].sort((a, b) => b.date.localeCompare(a.date))} locale={{ emptyText: <Empty description="Платежей пока нет" /> }} columns={[{ title: 'Дата', dataIndex: 'date', render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm') }, { title: 'Заказ', dataIndex: 'orderId', render: (orderId: string) => orderLabel(orderId) }, { title: 'Тип', dataIndex: 'type', render: (type: PaymentType) => <Tag color={type === 'Возврат' ? 'red' : type === 'Предоплата' ? 'gold' : 'green'}>{type}</Tag> }, { title: 'Сумма', dataIndex: 'amount', render: (amount: number, payment: Payment) => `${getPaymentSign(payment.type) < 0 ? '-' : '+'}${amount.toLocaleString('ru-RU')} ₽` }, { title: 'Действия', width: 110, render: (_value: string, payment: Payment) => <Popconfirm title="Удалить платёж?" okText="Удалить" cancelText="Отмена" onConfirm={() => deletePayment(payment.id)}><Button danger type="text" icon={<DeleteOutlined />} /></Popconfirm> }]} /></Card>
    <Modal title="Новый платёж" open={isModalOpen} okText="Сохранить" cancelText="Отмена" onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}><Form form={form} layout="vertical" onFinish={savePayment}><Form.Item name="orderId" label="Заказ" rules={[{ required: true, message: 'Выберите заказ' }]}><Select options={orders.map((order) => ({ value: order.id, label: `Заказ №${order.number} — ${orderTotal(order.id).toLocaleString('ru-RU')} ₽` }))} /></Form.Item><Form.Item name="type" label="Тип платежа" initialValue={paymentTypes[0]} rules={[{ required: true }]}><Select options={paymentTypes.map((type) => ({ value: type, label: type }))} /></Form.Item><Space.Compact block><Form.Item name="date" label="Дата" rules={[{ required: true, message: 'Выберите дату' }]}><DatePicker showTime format="DD.MM.YYYY HH:mm" /></Form.Item><Form.Item name="amount" label="Сумма" rules={[{ required: true, message: 'Введите сумму' }]}><InputNumber min={0.01} precision={2} /></Form.Item></Space.Compact></Form></Modal>
  </>;
}
