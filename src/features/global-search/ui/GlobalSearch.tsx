import { useMemo, useState } from 'react';
import { AutoComplete, Empty, Input } from 'antd';
import { FileSearchOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '@entities/client/model/clientStore';
import { useOrderStore } from '@entities/order/model/orderStore';
import { globalSearch } from '../model/globalSearch';

const SearchBox = styled(AutoComplete)({ width: 'min(420px, 45vw)' });
export function GlobalSearch() { const navigate = useNavigate(); const clients = useClientStore((state) => state.clients); const orders = useOrderStore((state) => state.orders); const [query, setQuery] = useState(''); const results = useMemo(() => globalSearch(clients, orders, query).slice(0, 12), [clients, orders, query]); const options = query.trim() ? [{ label: results.length ? 'Результаты поиска' : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Ничего не найдено" />, options: results.map((result) => ({ value: result.id, label: <span>{result.kind === 'client' ? <UserOutlined /> : <FileSearchOutlined />} <strong>{result.title}</strong>{result.description && <small> · {result.description}</small>}</span>, result })) }] : []; return <SearchBox options={options} value={query} onChange={(value) => setQuery(typeof value === 'string' ? value : '')} onSelect={(_value, option) => { navigate(option.result.path); setQuery(''); }}><Input allowClear prefix={<SearchOutlined />} placeholder="Поиск по CRM" /></SearchBox>; }
