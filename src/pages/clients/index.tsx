import { useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
  const { clients, addClient, updateClient, deleteClient, searchClients } = useClientStore();
  const [query, setQuery] = useState(''); const [editingClient, setEditingClient] = useState<Client | null>(null); const [isModalOpen, setIsModalOpen] = useState(false); const [form] = Form.useForm<ClientFormValues>();
  const visibleClients = searchClients(query);
  void clients;
  const closeModal = () => { setIsModalOpen(false); form.resetFields(); };
  const openCreateModal = () => { form.setFieldsValue(emptyClient); setEditingClient(null); setIsModalOpen(true); };
  const openEditModal = (client: Client) => { form.setFieldsValue(client); setEditingClient(client); setIsModalOpen(true); };
  const saveClient = (values: ClientFormValues) => { const client: Client = { ...values, id: editingClient?.id ?? crypto.randomUUID(), createdAt: editingClient?.createdAt ?? new Date().toISOString() }; if (editingClient) updateClient(client); else addClient(client); closeModal(); };
  return <><Header><div><Typography.Title level={2}>Клиенты</Typography.Title><Typography.Text type="secondary">База клиентов мебельного производства</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Добавить клиента</Button></Header><Card><Search allowClear prefix={<SearchOutlined />} placeholder="Поиск по имени, телефону или городу" value={query} onChange={(event) => setQuery(event.target.value)} /><Table<Client> style={{ marginTop: 20 }} rowKey="id" dataSource={visibleClients} locale={{ emptyText: <Empty description={query ? 'Клиенты не найдены' : 'Клиентов пока нет'} /> }} columns={[{ title: 'Имя', dataIndex: 'name' }, { title: 'Телефон', dataIndex: 'phone' }, { title: 'Город', dataIndex: 'city' }, { title: 'Комментарий', dataIndex: 'comment', ellipsis: true }, { title: 'Действия', width: 120, render: (_value: unknown, client: Client) => <Space><Button aria-label="Редактировать" icon={<EditOutlined />} onClick={() => openEditModal(client)} /><Popconfirm title="Удалить клиента?" okText="Удалить" cancelText="Отмена" onConfirm={() => deleteClient(client.id)}><Button danger aria-label="Удалить" icon={<DeleteOutlined />} /></Popconfirm></Space> }]} /></Card><Modal title={editingClient ? 'Редактирование клиента' : 'Новый клиент'} open={isModalOpen} okText="Сохранить" cancelText="Отмена" onCancel={closeModal} onOk={() => form.submit()}><Form form={form} layout="vertical" initialValues={emptyClient} onFinish={saveClient}><FormGrid><Form.Item name="name" label="Имя" rules={[{ required: true, message: 'Введите имя клиента' }]}><Input /></Form.Item><Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите телефон' }]}><Input /></Form.Item><Form.Item name="city" label="Город"><Input /></Form.Item><FullWidthItem name="comment" label="Комментарий"><Input.TextArea rows={3} /></FullWidthItem></FormGrid></Form></Modal></>;
}
