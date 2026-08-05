import { ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'antd/dist/reset.css';
import { App } from '@app/App';
import { DashboardPage } from '@pages/dashboard';
import { PlaceholderPage } from '@pages/placeholder';
import { ClientsPage } from '@pages/clients';

createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
    <BrowserRouter><Routes><Route element={<App />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/orders" element={<PlaceholderPage title="Заказы" description="Здесь будет список и контроль заказов." />} />
      <Route path="/payments" element={<PlaceholderPage title="Платежи" description="Здесь будет история платежей и задолженности." />} />
      <Route path="/settings" element={<PlaceholderPage title="Настройки" description="Здесь будут настройки приложения." />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route></Routes></BrowserRouter>
  </ConfigProvider>,
);
