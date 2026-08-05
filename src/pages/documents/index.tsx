import { useState } from 'react';
import { Button, Card, Empty, Select, Space, Typography } from 'antd';
import { createClientsPdf, createDebtPdf, createOrderPdf, createPaymentsPdf, exportPdf } from '@shared/lib/pdf/pdfExport';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { useOrganizationSettingsStore } from '@entities/organization-settings/model/organizationSettingsStore';
import { useDocumentStore } from '@entities/document/model/documentStore';
import { getOrderBalance, getOrderPaid, getOrderTotal } from '@shared/lib/order-financials';

const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

export function DocumentsPage() {
  const clients = useClientStore((state) => state.clients); const orders = useOrderStore((state) => state.orders); const payments = usePaymentStore((state) => state.payments); const settings = useOrganizationSettingsStore((state) => state.settings);
  const [orderId, setOrderId] = useState(orders[0]?.id ?? ''); const order = orders.find((item) => item.id === orderId); const client = clients.find((item) => item.id === order?.clientId);
  if (!order) return <Card><Empty description="Добавьте заказ, чтобы сформировать документы" /></Card>;
  const exportOrder = (title: string) => void exportPdf(createOrderPdf(order, client, settings, payments, title));
  return <Space direction="vertical" size="large" style={{ width: '100%' }}><div><Typography.Title level={2}>Документы и PDF</Typography.Title><Typography.Text type="secondary">Экспорт договоров, счетов, заказов и отчетов</Typography.Text></div><Space wrap><Select value={orderId} options={orders.map((item) => ({ value: item.id, label: `Заказ №${item.number}` }))} onChange={setOrderId} style={{ width: 220 }} /><Button type="primary" onClick={() => exportOrder('Договор')}>Договор PDF</Button><Button onClick={() => exportOrder('Счет на оплату')}>Счет PDF</Button><Button onClick={() => exportOrder('Заказ')}>Заказ PDF</Button><Button onClick={() => void exportPdf(createClientsPdf(clients, settings))}>Клиенты PDF</Button><Button onClick={() => void exportPdf(createPaymentsPdf(payments, orders, clients, settings))}>Платежи PDF</Button><Button onClick={() => void exportPdf(createDebtPdf(orders, clients, payments, settings))}>Задолженность PDF</Button><Button onClick={() => useDocumentStore.getState().issueNumber()}>Новый номер</Button></Space><Card title={`Предпросмотр заказа №${order.number}`}><Typography.Paragraph>Клиент: <b>{client?.name ?? 'Не указан'}</b></Typography.Paragraph>{order.items.map((item) => <Typography.Paragraph key={item.id}>{item.name}: {item.quantity} × {money(item.price)} = {money(item.quantity * item.price)}</Typography.Paragraph>)}<Typography.Text strong>Итого: {money(getOrderTotal(order))}</Typography.Text><br /><Typography.Text>Оплачено: {money(getOrderPaid(order.id, payments))} · Задолженность: {money(getOrderBalance(order, payments))}</Typography.Text></Card></Space>;
}
