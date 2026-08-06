import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import styled from '@emotion/styled';
import { useUserStore } from '@entities/user/model/userStore';
const Page = styled.div({ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fa', padding: 16 });
const LoginCard = styled(Card)({ width: '100%', maxWidth: 420 });
export function LoginPage() { const login = useUserStore((state) => state.login); const [error, setError] = useState(false); return <Page><LoginCard><Typography.Title level={2}>Facade-Good</Typography.Title><Typography.Paragraph type="secondary">Войдите в систему учета фасадов</Typography.Paragraph>{error && <Alert message="Неверный логин или пароль" type="error" showIcon style={{ marginBottom: 16 }} />}<Form layout="vertical" onFinish={(values: { login: string; password: string }) => setError(!login(values.login, values.password))}><Form.Item name="login" label="Логин" rules={[{ required: true }]}><Input autoFocus /></Form.Item><Form.Item name="password" label="Пароль" rules={[{ required: true }]}><Input.Password /></Form.Item><Button type="primary" htmlType="submit" block>Войти</Button></Form><Typography.Text type="secondary">По умолчанию: admin / admin123</Typography.Text></LoginCard></Page>; }
