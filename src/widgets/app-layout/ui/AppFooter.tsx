import { Layout, Typography } from 'antd';
import styled from '@emotion/styled';

const Footer = styled(Layout.Footer)({ textAlign: 'center', background: '#fff' });
export function AppFooter() { return <Footer><Typography.Text type="secondary">Facade-Good · Локальная CRM</Typography.Text></Footer>; }
