import { Button, Card, Empty, Space, Typography } from 'antd';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { exportClients, exportDebtors, exportOrders, exportPayments, exportStatistics } from '@shared/lib/excel';

export function DocumentsPage() {
  const clients = useClientStore((state) => state.clients);
  const orders = useOrderStore((state) => state.orders);
  const payments = usePaymentStore((state) => state.payments);
  return <Space direction="vertical" size="large" style={{ width: '100%' }}><div><Typography.Title level={2}>Документы и экспорт</Typography.Title><Typography.Text type="secondary">Формирование Excel-отчётов по локальной базе</Typography.Text></div><Card title="Excel (.xlsx)"><Space wrap><Button onClick={() => void exportClients(clients)}>Клиенты</Button><Button onClick={() => void exportOrders(orders, clients, payments)}>Заказы</Button><Button onClick={() => void exportPayments(payments, orders, clients)}>Оплаты</Button><Button onClick={() => void exportDebtors(orders, clients, payments)}>Должники</Button><Button type="primary" onClick={() => void exportStatistics(clients, orders, payments)}>Статистика</Button></Space></Card>{orders.length === 0 ? <Card><Empty description="Добавьте заказ, чтобы сформировать отчёты" /></Card> : null}</Space>;
}
