import { Layout, Menu, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

const Sidebar = styled(Layout.Sider)({ background: '#001529' });
const Brand = styled(Typography.Title)({ color: '#fff !important', margin: '0 !important', padding: '24px 24px 20px', fontSize: 22, whiteSpace: 'nowrap' });
const menuItems = [
  { key: '/analytics', label: <Link to="/analytics">Аналитика</Link> },
  { key: '/', label: <Link to="/">Главная</Link> },
  { key: '/clients', label: <Link to="/clients">Клиенты</Link> },
  { key: '/orders', label: <Link to="/orders">Заказы</Link> },
  { key: '/production-calendar', label: <Link to="/production-calendar">Производственный календарь</Link> },
  { key: '/payments', label: <Link to="/payments">Платежи</Link> },
  { key: '/documents', label: <Link to="/documents">Документы</Link> },
  { key: '/settings', label: <Link to="/settings">Настройки</Link> },
];

menuItems.push({ key: '/notifications', label: <Link to="/notifications">Уведомления</Link> });

export function AppSidebar() {
  const { pathname } = useLocation();
  const selectedKey = menuItems.some((item) => item.key === pathname) ? pathname : '/';
  return <Sidebar breakpoint="lg" collapsedWidth={0} width={240} theme="dark"><Brand level={3}>Facade-Good</Brand><Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} /></Sidebar>;
}
