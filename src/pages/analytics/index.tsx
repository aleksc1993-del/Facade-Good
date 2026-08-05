import { BarChartOutlined, DollarOutlined, RiseOutlined, TeamOutlined, ShoppingOutlined, WalletOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row, Statistic, Typography } from 'antd';
import styled from '@emotion/styled';
import { useMemo, type ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { getOrderBalance, getOrderTotal, getPaymentValue } from '@shared/lib/order-financials';

const Header = styled.div({ marginBottom: 24 });
const MetricCard = styled(Card)({ height: '100%', '& .ant-statistic-content': { fontSize: 26 } });
const ChartCard = styled(Card)({ height: '100%' });
const ChartTitle = styled(Typography.Title)({ marginTop: '0 !important', marginBottom: '20px !important' });
const ChartBox = styled.div({ width: '100%', height: 280 });
const money = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`;
const monthKey = (date: string): string => { const value = new Date(date); return Number.isNaN(value.getTime()) ? '' : `${value.getFullYear()}-${String(value.getMonth()).padStart(2, '0')}`; };
interface MonthlyPoint { month: string; sales: number; payments: number; debt: number; orders: number }
interface CategoryPoint { category: string; amount: number }
interface MetricCardData { title: string; value: string | number; prefix: ReactNode }

export function AnalyticsPage() {
  const clients = useClientStore((state) => state.clients);
  const orders = useOrderStore((state) => state.orders);
  const payments = usePaymentStore((state) => state.payments);
  const metrics = useMemo(() => { const revenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0); const prepaid = payments.reduce((sum, payment) => sum + Math.max(0, getPaymentValue(payment)), 0); const debt = orders.reduce((sum, order) => sum + getOrderBalance(order, payments), 0); return { revenue, prepaid, debt, average: orders.length ? revenue / orders.length : 0 }; }, [orders, payments]);
  const monthlyData = useMemo<MonthlyPoint[]>(() => { const values = new Map<string, MonthlyPoint>(); const get = (key: string) => { const existing = values.get(key); if (existing) return existing; const [year, month] = key.split('-').map(Number); const point = { month: `${new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(new Date(year, month))} ${year}`, sales: 0, payments: 0, debt: 0, orders: 0 }; values.set(key, point); return point; }; orders.forEach((order) => { const point = get(monthKey(order.createdAt)); if (monthKey(order.createdAt)) { point.sales += getOrderTotal(order); point.debt += getOrderBalance(order, payments); point.orders += 1; } }); payments.forEach((payment) => { const key = monthKey(payment.date); if (key) get(key).payments += Math.max(0, getPaymentValue(payment)); }); return [...values.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, value]) => value); }, [orders, payments]);
  const categories = useMemo<CategoryPoint[]>(() => { const totals = new Map<string, number>(); orders.flatMap((order) => order.items ?? []).forEach((item) => { const name = item.name || 'Без категории'; totals.set(name, (totals.get(name) ?? 0) + item.quantity); }); return [...totals.entries()].sort(([, a], [, b]) => b - a).slice(0, 7).map(([category, amount]) => ({ category, amount })); }, [orders]);
  const tooltipMoney = (value: unknown) => money(Number(value ?? 0));
  const metricCards: MetricCardData[] = [{ title: 'Клиенты', value: clients.length, prefix: <TeamOutlined /> }, { title: 'Заказы', value: orders.length, prefix: <ShoppingOutlined /> }, { title: 'Выручка', value: money(metrics.revenue), prefix: <RiseOutlined /> }, { title: 'Предоплаты', value: money(metrics.prepaid), prefix: <DollarOutlined /> }, { title: 'Долги', value: money(metrics.debt), prefix: <WalletOutlined /> }, { title: 'Средний чек', value: money(metrics.average), prefix: <BarChartOutlined /> }];
  return <><Header><Typography.Title level={2}>Аналитика</Typography.Title><Typography.Text type="secondary">Сводка по продажам, оплатам и задолженности</Typography.Text></Header><Row gutter={[16, 16]}>
    {metricCards.map(({ title, value, prefix }) => <Col xs={24} sm={12} lg={8} xl={4} key={title}><MetricCard><Statistic title={title} value={value} prefix={prefix} /></MetricCard></Col>)}
    <Col xs={24} lg={12}><ChartCard><ChartTitle level={4}>Продажи по месяцам</ChartTitle><ChartBox><ResponsiveContainer><LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={tooltipMoney} /><Line type="monotone" dataKey="sales" name="Продажи" stroke="#1677ff" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartBox></ChartCard></Col>
    <Col xs={24} lg={12}><ChartCard><ChartTitle level={4}>Оплаты и задолженность</ChartTitle><ChartBox><ResponsiveContainer><LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={tooltipMoney} /><Line type="monotone" dataKey="payments" name="Оплаты" stroke="#52c41a" strokeWidth={3} /><Line type="monotone" dataKey="debt" name="Долг" stroke="#ff4d4f" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartBox></ChartCard></Col>
    <Col xs={24} lg={12}><ChartCard><ChartTitle level={4}>Количество заказов</ChartTitle><ChartBox><ResponsiveContainer><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="orders" name="Заказы" fill="#722ed1" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartBox></ChartCard></Col>
    <Col xs={24} lg={12}><ChartCard><ChartTitle level={4}>Популярные категории</ChartTitle>{categories.length ? <ChartBox><ResponsiveContainer><BarChart data={categories} layout="vertical" margin={{ left: 20, right: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="category" width={110} /><Tooltip /><Bar dataKey="amount" name="Количество" fill="#13c2c2" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></ChartBox> : <Empty description="Недостаточно данных" />}</ChartCard></Col>
  </Row></>;
}
