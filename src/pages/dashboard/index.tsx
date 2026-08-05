import { AppstoreOutlined, ClockCircleOutlined, DollarOutlined, TeamOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Tag, Typography } from 'antd';
import styled from '@emotion/styled';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { getOrderBalance, getPaymentValue } from '@shared/lib/order-financials';
import { orderStatuses } from '@shared/types/models';

const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  marginBottom: 28,
  flexWrap: 'wrap',
});

const MetricsGrid = styled(Row)({
  marginBottom: 24,
});

const MetricCard = styled(Card)({
  height: '100%',
  '& .ant-statistic-title': { marginBottom: 12 },
  '& .ant-statistic-content': { fontSize: 28 },
});

const isToday = (date: string, currentDate: Date): boolean => {
  const paymentDate = new Date(date);
  return paymentDate.getFullYear() === currentDate.getFullYear()
    && paymentDate.getMonth() === currentDate.getMonth()
    && paymentDate.getDate() === currentDate.getDate();
};

const formatMoney = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`;

export function DashboardPage() {
  const clients = useClientStore((state) => state.clients);
  const orders = useOrderStore((state) => state.orders);
  const payments = usePaymentStore((state) => state.payments);
  const currentDate = new Date();

  const todayPayments = payments
    .filter((payment) => isToday(payment.date, currentDate))
    .reduce((total, payment) => total + getPaymentValue(payment), 0);
  const totalDebt = orders.reduce((total, order) => total + getOrderBalance(order, payments), 0);
  const activeOrders = orders.filter((order) => order.status === orderStatuses[1]).length;

  return (
    <>
      <Header>
        <div>
          <Typography.Title level={2}>Добрый день</Typography.Title>
          <Typography.Text type="secondary">Контроль заказов и оплат в одном месте</Typography.Text>
        </div>
        <Tag color="blue">Локальный режим</Tag>
      </Header>

      <MetricsGrid gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={5}>
          <MetricCard><Statistic title="Клиенты" value={clients.length} prefix={<TeamOutlined />} /></MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={5}>
          <MetricCard><Statistic title="Заказы" value={orders.length} prefix={<ShoppingOutlined />} /></MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={5}>
          <MetricCard><Statistic title="Сегодняшние оплаты" value={formatMoney(todayPayments)} prefix={<DollarOutlined />} /></MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={5}>
          <MetricCard><Statistic title="Общий долг клиентов" value={formatMoney(totalDebt)} prefix={<AppstoreOutlined />} /></MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <MetricCard><Statistic title="Заказы в работе" value={activeOrders} prefix={<ClockCircleOutlined />} /></MetricCard>
        </Col>
      </MetricsGrid>
    </>
  );
}
