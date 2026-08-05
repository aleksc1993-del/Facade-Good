import { Layout, Menu, Typography } from 'antd';
import styled from '@emotion/styled';
import { DashboardPage } from '../pages/dashboard';

const Brand = styled(Typography.Title)({ color: '#fff !important', margin: '0 0 28px !important', fontSize: 22 });
const Content = styled(Layout.Content)({ padding: 32, background: '#f5f7fa' });
export function App() { return <Layout style={{ minHeight: '100vh' }}><Layout.Sider theme="dark" width={240} style={{ padding: 24 }}><Brand level={3}>Facade-Good</Brand><Menu theme="dark" mode="inline" selectedKeys={['dashboard']} items={[{ key: 'dashboard', label: 'Обзор' }, { key: 'clients', label: 'Клиенты' }, { key: 'orders', label: 'Заказы' }, { key: 'payments', label: 'Платежи' }]} /></Layout.Sider><Layout><Content><DashboardPage /></Content></Layout></Layout>; }
