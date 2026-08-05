import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import styled from '@emotion/styled';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 });

export function DashboardPage() {
  const clients = useClientStore((state) => state.clients);
  const orders = useOrderStore((state) => state.orders);
  const payments = usePaymentStore((state) => state.payments);
  const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return <><Header><div><Typography.Title level={2}>Добрый день</Typography.Title><Typography.Text type="secondary">Контроль заказов и оплат в одном месте</Typography.Text></div><Tag color="blue">Локальный режим</Tag></Header><Row gutter={[16, 16]}><Col span={8}><Card><Statistic title="Клиенты" value={clients.length} /></Card></Col><Col span={8}><Card><Statistic title="Заказы" value={orders.length} /></Card></Col><Col span={8}><Card><Statistic title="Оплачено" value={revenue} suffix="₽" /></Card></Col></Row><Card title="Последние заказы" style={{ marginTop: 24 }}><Table rowKey="id" dataSource={orders} columns={[{ title: 'Заказ', dataIndex: 'title' }, { title: 'Сумма', dataIndex: 'totalAmount', render: (value: number) => `${value.toLocaleString('ru-RU')} ₽` }, { title: 'Дата', dataIndex: 'createdAt' }]} locale={{ emptyText: 'Заказов пока нет' }} /></Card></>;
}
