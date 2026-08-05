import { useMemo, useState } from 'react';
import { Button, Card, Empty, Select, Space, Tag, Typography } from 'antd';
import { FileTextOutlined, PrinterOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { usePaymentStore } from '@entities/payment/model/paymentStore';
import { useOrganizationSettingsStore } from '@entities/organization-settings/model/organizationSettingsStore';
import { useDocumentStore } from '@entities/document/model/documentStore';
import { getOrderBalance, getOrderPaid, getOrderTotal } from '@shared/lib/order-financials';

const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const Toolbar = styled.div({ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 });
const DocumentGrid = styled.div({ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 24, '@media (max-width: 800px)': { gridTemplateColumns: '1fr' } });
const Preview = styled.div({ background: '#fff', minHeight: 760, padding: '56px clamp(24px, 6vw, 80px)', boxShadow: '0 2px 12px rgba(0,0,0,.08)', color: '#1f2937', '@media print': { boxShadow: 'none', padding: '20mm', minHeight: 'auto' } });
const PreviewHeader = styled.div({ display: 'flex', justifyContent: 'space-between', gap: 24, borderBottom: '2px solid #1677ff', paddingBottom: 20, marginBottom: 42 });
const Logo = styled.img({ maxWidth: 130, maxHeight: 70, objectFit: 'contain' });
const Meta = styled.div({ color: '#667085', lineHeight: 1.6 });
const Total = styled.div({ textAlign: 'right', fontSize: 18, fontWeight: 700, marginTop: 24 });
const Signatures = styled.div({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 90, color: '#667085' });
const documentTypes = ['Договор', 'Счет на оплату', 'Коммерческое предложение', 'Акт выполненных работ', 'Расписка о получении предоплаты', 'Заказ-наряд'] as const;
type DocumentType = typeof documentTypes[number];
const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

export function DocumentsPage() {
  const { orders } = useOrderStore(); const { clients } = useClientStore(); const payments = usePaymentStore((state) => state.payments); const settings = useOrganizationSettingsStore((state) => state.settings); const issueNumber = useDocumentStore((state) => state.issueNumber);
  const [orderId, setOrderId] = useState(orders[0]?.id ?? ''); const [type, setType] = useState<DocumentType>('Договор'); const [number, setNumber] = useState(() => issueNumber());
  const order = orders.find((item) => item.id === orderId); const client = clients.find((item) => item.id === order?.clientId); const paid = order ? getOrderPaid(order.id, payments) : 0;
  const orderOptions = useMemo(() => orders.map((item) => ({ value: item.id, label: `Заказ №${item.number}` })), [orders]);
  if (!order) return <><Header><div><Typography.Title level={2}>Документы</Typography.Title><Typography.Text type="secondary">Формирование и печать документов</Typography.Text></div></Header><Card><Empty description="Добавьте заказ, чтобы сформировать документ" /></Card></>;
  return <><Header><div><Typography.Title level={2}>Документы</Typography.Title><Typography.Text type="secondary">Формирование, предпросмотр и печать документов по заказам</Typography.Text></div><Space><Button icon={<FileTextOutlined />} onClick={() => setNumber(issueNumber())}>Новый номер</Button><Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>Печать / PDF</Button></Space></Header><Toolbar><Select aria-label="Тип документа" value={type} options={documentTypes.map((item) => ({ value: item, label: item }))} onChange={(value: DocumentType) => setType(value)} style={{ minWidth: 280 }} /><Select aria-label="Заказ" value={orderId} options={orderOptions} onChange={setOrderId} style={{ minWidth: 220 }} showSearch optionFilterProp="label" /></Toolbar><DocumentGrid><Card title="Параметры" bordered={false}><Typography.Text type="secondary">Документ</Typography.Text><Typography.Paragraph strong>{type}</Typography.Paragraph><Typography.Text type="secondary">Номер</Typography.Text><Typography.Paragraph strong>{number}</Typography.Paragraph><Tag color="blue">Автоматическая нумерация</Tag></Card><Preview><PreviewHeader><div>{settings.logo && <Logo src={settings.logo} alt="Логотип" />}<Typography.Title level={3}>{settings.name || 'Название организации'}</Typography.Title><Meta>{settings.address || 'Адрес организации'}<br />{settings.phone || 'Телефон'} · {settings.email || 'Email'}</Meta></div><Meta>№ {number}<br />{new Date().toLocaleDateString('ru-RU')}</Meta></PreviewHeader><Typography.Title level={2} style={{ textAlign: 'center' }}>{type}</Typography.Title><Typography.Paragraph>Настоящий документ оформлен между <strong>{settings.name || 'организацией'}</strong> и клиентом <strong>{client?.name || 'не указан'}</strong>.</Typography.Paragraph><Typography.Paragraph>По заказу №{order.number} согласованы следующие изделия и работы:</Typography.Paragraph><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ textAlign: 'left', borderBottom: '1px solid #d0d5dd', padding: '10px 0' }}>Изделие</th><th style={{ textAlign: 'right', borderBottom: '1px solid #d0d5dd', padding: '10px 0' }}>Количество</th><th style={{ textAlign: 'right', borderBottom: '1px solid #d0d5dd', padding: '10px 0' }}>Сумма</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td style={{ padding: '10px 0', borderBottom: '1px solid #eaecf0' }}>{item.name}</td><td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid #eaecf0' }}>{item.quantity}</td><td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid #eaecf0' }}>{money(item.quantity * item.price)}</td></tr>)}</tbody></table><Total>Итого: {money(getOrderTotal(order))}</Total><Meta>Оплачено: {money(paid)} · Остаток: {money(getOrderBalance(order, payments))}</Meta><Signatures><div>Заказчик: {client?.name || '________________'}<br /><br />________________</div><div>Исполнитель: {settings.name || '________________'}<br /><br />________________</div></Signatures></Preview></DocumentGrid></>;
}
