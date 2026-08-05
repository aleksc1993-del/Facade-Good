import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import styled from '@emotion/styled';
import { AppFooter } from './ui/AppFooter';
import { AppHeader } from './ui/AppHeader';
import { AppSidebar } from './ui/AppSidebar';

const Shell = styled(Layout)({ minHeight: '100vh' });
const MainLayout = styled(Layout)({ minWidth: 0 });
const Content = styled(Layout.Content)({ flex: 1, padding: '32px clamp(16px, 4vw, 40px)', background: '#f5f7fa' });

export function AppLayout() {
  return <Shell><AppSidebar /><MainLayout><AppHeader /><Content><Outlet /></Content><AppFooter /></MainLayout></Shell>;
}
