import { useState } from 'react';
import { Avatar, Button, Card, Form, Input, message, Typography, Upload } from 'antd';
import { InboxOutlined, SaveOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useOrganizationSettingsStore } from '@entities/organization-settings/model/organizationSettingsStore';
import type { OrganizationSettings } from '@shared/types/models';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const FormGrid = styled.div({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, '@media (max-width: 700px)': { gridTemplateColumns: '1fr' } });
const FullWidthItem = styled(Form.Item)({ gridColumn: '1 / -1' });
const LogoSection = styled.div({ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 });
const LogoPreview = styled(Avatar)({ background: '#f0f5ff', color: '#1677ff', flexShrink: 0 });
const UploadCopy = styled.div({ display: 'flex', flexDirection: 'column', gap: 4 });

export function SettingsPage() {
  const { settings, updateSettings } = useOrganizationSettingsStore();
  const [form] = Form.useForm<OrganizationSettings>();
  const [logo, setLogo] = useState(settings.logo);
  const [messageApi, contextHolder] = message.useMessage();
  const handleLogoChange = (file: File) => { const reader = new FileReader(); reader.onload = () => setLogo(typeof reader.result === 'string' ? reader.result : ''); reader.readAsDataURL(file); };
  const saveSettings = (values: OrganizationSettings) => { updateSettings({ ...values, logo }); messageApi.success('Настройки сохранены'); };
  return <>{contextHolder}<Header><div><Typography.Title level={2}>Настройки</Typography.Title><Typography.Text type="secondary">Данные организации для будущей печати документов</Typography.Text></div><Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>Сохранить</Button></Header><Card><Form form={form} layout="vertical" initialValues={settings} onFinish={saveSettings}><LogoSection><LogoPreview size={88} src={logo || undefined} icon={!logo ? <InboxOutlined /> : undefined} /><UploadCopy><Typography.Text strong>Логотип организации</Typography.Text><Typography.Text type="secondary">PNG, JPG или SVG, до 5 МБ</Typography.Text><Upload accept="image/png,image/jpeg,image/svg+xml" maxCount={1} showUploadList={false} beforeUpload={(file) => { if (file.size > 5 * 1024 * 1024) { messageApi.error('Размер логотипа не должен превышать 5 МБ'); return Upload.LIST_IGNORE; } handleLogoChange(file); return false; }}><Button>Выбрать файл</Button></Upload></UploadCopy></LogoSection><FormGrid><Form.Item name="name" label="Название организации"><Input placeholder="Например, Фасад-Мастер" /></Form.Item><Form.Item name="phone" label="Телефон"><Input placeholder="+7 (___) ___-__-__" /></Form.Item><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Введите корректный email' }]}><Input placeholder="mail@example.ru" /></Form.Item><FullWidthItem name="address" label="Адрес"><Input.TextArea rows={3} placeholder="Юридический или производственный адрес" /></FullWidthItem></FormGrid></Form></Card></>;
}
