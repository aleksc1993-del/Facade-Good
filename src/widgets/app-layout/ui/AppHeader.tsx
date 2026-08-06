import { Badge, Button, Layout, Typography } from 'antd';
import { BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { GlobalSearch } from '@features/global-search/ui/GlobalSearch';
import { useUserStore } from '@entities/user/model/userStore';
const Header = styled(Layout.Header)({ display: 'flex', alignItems: 'center', gap: 24, padding: '0 clamp(16px, 4vw, 40px)', background: '#fff', borderBottom: '1px solid #f0f0f0' });
const Title = styled(Typography.Title)({ margin: '0 !important', flex: 1 });
export function AppHeader() { const { currentUserId, users, logout } = useUserStore(); const user = users.find((item) => item.id === currentUserId); return <Header><Title level={4}>Управление производством</Title><GlobalSearch /><Typography.Text>{user?.name}</Typography.Text><Link to="/notifications"><Badge dot><Button type="text" aria-label="Уведомления" icon={<BellOutlined />} /></Badge></Link><Button type="text" icon={<LogoutOutlined />} onClick={logout}>Выйти</Button></Header>; }
