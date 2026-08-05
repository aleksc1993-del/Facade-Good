import { Badge, Button, Layout, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { GlobalSearch } from '@features/global-search/ui/GlobalSearch';

const Header = styled(Layout.Header)({ display: 'flex', alignItems: 'center', gap: 24, padding: '0 clamp(16px, 4vw, 40px)', background: '#fff', borderBottom: '1px solid #f0f0f0' });
const Title = styled(Typography.Title)({ margin: '0 !important', flex: 1 });
export function AppHeader() { return <Header><Title level={4}>Управление производством</Title><GlobalSearch /><Link to="/notifications"><Badge dot><Button type="text" aria-label="Уведомления" icon={<BellOutlined />} /></Badge></Link></Header>; }
