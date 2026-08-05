import { Badge, Button, Layout, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const Header = styled(Layout.Header)({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px, 4vw, 40px)', background: '#fff', borderBottom: '1px solid #f0f0f0' });

export function AppHeader() {
  return <Header><Typography.Title level={4} style={{ margin: 0 }}>Управление производством</Typography.Title><Link to="/notifications"><Badge dot><Button type="text" aria-label="Уведомления" icon={<BellOutlined />} /></Badge></Link></Header>;
}
