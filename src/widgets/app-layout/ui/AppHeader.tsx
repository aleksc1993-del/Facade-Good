import { Layout, Typography } from 'antd';
import styled from '@emotion/styled';

const Header = styled(Layout.Header)({ display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 4vw, 40px)', background: '#fff', borderBottom: '1px solid #f0f0f0' });

export function AppHeader() {
  return <Header><Typography.Title level={4} style={{ margin: 0 }}>Управление производством</Typography.Title></Header>;
}
