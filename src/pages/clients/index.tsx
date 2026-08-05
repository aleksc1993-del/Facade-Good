import { useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { EditOutlined, InboxOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useClientStore } from '@entities/client/model/clientStore';
import type { Client } from '@shared/types/models';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const Search = styled(Input)({ maxWidth: 360 });
const FormGrid = styled.div({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 });
const FullWidthItem = styled(Form.Item)({ gridColumn: '1 / -1' });
interface ClientFormValues { name: string; phone: string; city: string; comment: string }
const emptyClient: ClientFormValues = { name: '', phone: '', city: '', comment: '' };

export function ClientsPage() {
  const { clients, addClient, updateClient, archiveClient, searchClients } = useClientStore();
  const [query, setQuery] = useState(''); const [editingClient, setEditingClient] = useState<Client | null>(null); const [isModalOpen, setIsModalOpen] = useState(false); const [form] = Form.useForm<ClientFormValues>();
  const visibleClients = searchClients(query);
  void clients;
  const closeModal = () => { setIsModalOpen(false); form.resetFields(); };
  const openCreateModal = () => { form.setFieldsValue(emptyClient); setEditingClient(null); setIsModalOpen(true); };
  const openEditModal = (client: Client) => { form.setFieldsValue(client); setEditingClient(client); setIsModalOpen(true); };
  const saveClient = (values: ClientFormValues) => { const client: Client = { ...values, id: editingClient?.id ?? crypto.randomUUID(), createdAt: editingClient?.createdAt ?? new Date().toISOString() }; if (editingClient) updateClient(client); else addClient(client); closeModal(); };
  return <><Header><div><Typography.Title level={2}>РљР»РёРµРЅС‚С‹</Typography.Title><Typography.Text type="secondary">Р‘Р°Р·Р° РєР»РёРµРЅС‚РѕРІ РјРµР±РµР»СЊРЅРѕРіРѕ РїСЂРѕРёР·РІРѕРґСЃС‚РІР°</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Р”РѕР±Р°РІРёС‚СЊ РєР»РёРµРЅС‚Р°</Button></Header><Card><Search allowClear prefix={<SearchOutlined />} placeholder="РџРѕРёСЃРє РїРѕ РёРјРµРЅРё, С‚РµР»РµС„РѕРЅСѓ РёР»Рё РіРѕСЂРѕРґСѓ" value={query} onChange={(event) => setQuery(event.target.value)} /><Table<Client> style={{ marginTop: 20 }} rowKey="id" dataSource={visibleClients} locale={{ emptyText: <Empty description={query ? 'РљР»РёРµРЅС‚С‹ РЅРµ РЅР°Р№РґРµРЅС‹' : 'РљР»РёРµРЅС‚РѕРІ РїРѕРєР° РЅРµС‚'} /> }} columns={[{ title: 'РРјСЏ', dataIndex: 'name' }, { title: 'РўРµР»РµС„РѕРЅ', dataIndex: 'phone' }, { title: 'Р“РѕСЂРѕРґ', dataIndex: 'city' }, { title: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№', dataIndex: 'comment', ellipsis: true }, { title: 'Р”РµР№СЃС‚РІРёСЏ', width: 120, render: (_value: unknown, client: Client) => <Space><Button aria-label="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ" icon={<EditOutlined />} onClick={() => openEditModal(client)} /><Popconfirm title="РЈРґР°Р»РёС‚СЊ РєР»РёРµРЅС‚Р°?" okText="РЈРґР°Р»РёС‚СЊ" cancelText="РћС‚РјРµРЅР°" onConfirm={() => archiveClient(client.id)}><Button danger aria-label="РЈРґР°Р»РёС‚СЊ" icon={<InboxOutlined />} /></Popconfirm></Space> }]} /></Card><Modal title={editingClient ? 'Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РєР»РёРµРЅС‚Р°' : 'РќРѕРІС‹Р№ РєР»РёРµРЅС‚'} open={isModalOpen} okText="РЎРѕС…СЂР°РЅРёС‚СЊ" cancelText="РћС‚РјРµРЅР°" onCancel={closeModal} onOk={() => form.submit()}><Form form={form} layout="vertical" initialValues={emptyClient} onFinish={saveClient}><FormGrid><Form.Item name="name" label="РРјСЏ" rules={[{ required: true, message: 'Р’РІРµРґРёС‚Рµ РёРјСЏ РєР»РёРµРЅС‚Р°' }]}><Input /></Form.Item><Form.Item name="phone" label="РўРµР»РµС„РѕРЅ" rules={[{ required: true, message: 'Р’РІРµРґРёС‚Рµ С‚РµР»РµС„РѕРЅ' }]}><Input /></Form.Item><Form.Item name="city" label="Р“РѕСЂРѕРґ"><Input /></Form.Item><FullWidthItem name="comment" label="РљРѕРјРјРµРЅС‚Р°СЂРёР№"><Input.TextArea rows={3} /></FullWidthItem></FormGrid></Form></Modal></>;
}


