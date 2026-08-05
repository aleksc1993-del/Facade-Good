import { useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Empty, Form, Input, List, Modal, Popconfirm, Select, Space, Tag, Typography } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs, { type Dayjs } from 'dayjs';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { useNotificationStore } from '@entities/notification/model/notificationStore';
import { buildNotifications, type NotificationKind } from '@entities/notification/model/notificationRules';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const Grid = styled.div({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 });
interface ReminderForm { clientId: string; date: Dayjs; note: string }
const labels: Record<NotificationKind, string> = { soon: 'Срок изготовления', unpaid: 'Оплата', overdue: 'Просрочка', pickup: 'Выдача', call: 'Звонок' };
const colors: Record<NotificationKind, string> = { soon: 'orange', unpaid: 'gold', overdue: 'red', pickup: 'green', call: 'blue' };

export function NotificationsPage() {
  const clients = useClientStore((state) => state.clients); const orders = useOrderStore((state) => state.orders); const payments = usePaymentStore((state) => state.payments);
  const { reminders, addReminder, deleteReminder, toggleReminder } = useNotificationStore();
  const [open, setOpen] = useState(false); const [form] = Form.useForm<ReminderForm>();
  const systemNotifications = useMemo(() => buildNotifications(orders, payments, clients), [clients, orders, payments]);
  const saveReminder = (values: ReminderForm) => { addReminder({ ...values, date: values.date.toISOString(), id: crypto.randomUUID(), completed: false }); setOpen(false); form.resetFields(); };
  return <><Header><div><Typography.Title level={2}>Уведомления</Typography.Title><Typography.Text type="secondary">Контроль сроков, оплат и контактов с клиентами</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Напомнить позвонить</Button></Header><Grid><Card title={<Space><BellOutlined /> Системные уведомления</Space>}><List dataSource={systemNotifications} locale={{ emptyText: <Empty description="Нет активных уведомлений" /> }} renderItem={(item) => <List.Item><List.Item.Meta title={<Space><Tag color={colors[item.kind]}>{labels[item.kind]}</Tag>{item.title}</Space>} description={item.description} /></List.Item>} /></Card><Card title={<Space><PhoneOutlined /> Напоминания о звонках</Space>}><List dataSource={reminders.filter((reminder) => !reminder.completed).sort((a, b) => a.date.localeCompare(b.date))} locale={{ emptyText: <Empty description="Напоминаний пока нет" /> }} renderItem={(item) => <List.Item actions={[<Button key="done" type="text" icon={<CheckOutlined />} onClick={() => toggleReminder(item.id)} />, <Popconfirm key="delete" title="Удалить напоминание?" onConfirm={() => deleteReminder(item.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>]}><List.Item.Meta title={<Space><Tag color="blue">Звонок</Tag>{clients.find((client) => client.id === item.clientId)?.name ?? 'Клиент удалён'}</Space>} description={`${dayjs(item.date).format('DD.MM.YYYY HH:mm')} — ${item.note || 'Без заметки'}`} /></List.Item>} /></Card></Grid><Modal title="Напоминание о звонке" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Сохранить" cancelText="Отмена"><Form form={form} layout="vertical" onFinish={saveReminder}><Form.Item name="clientId" label="Клиент" rules={[{ required: true }]}><Select options={clients.map((client) => ({ value: client.id, label: `${client.name} — ${client.phone}` }))} /></Form.Item><Form.Item name="date" label="Дата и время" rules={[{ required: true }]}><DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} /></Form.Item><Form.Item name="note" label="Комментарий"><Input.TextArea rows={3} /></Form.Item></Form></Modal><Alert type="info" showIcon message="Уведомления обновляются автоматически на основе сроков заказов и истории оплат." style={{ marginTop: 16 }} /></>;
}
