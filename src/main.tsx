import { ConfigProvider, theme as antdTheme } from 'antd';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'antd/dist/reset.css';
import { App } from '@app/App';
import { DashboardPage } from '@pages/dashboard';
import { SettingsPage } from '@pages/settings';
import { ClientsPage } from '@pages/clients';
import { OrdersPage } from '@pages/orders';
import { PaymentsPage } from '@pages/payments';
import { DocumentsPage } from '@pages/documents';
import { AnalyticsPage } from '@pages/analytics';
import { ProductionCalendarPage } from '@pages/production-calendar';
import { NotificationsPage } from '@pages/notifications';
import { ArchivePage } from '@pages/archive';
import { BackupPage } from '@pages/backup';
import { ImportPage } from '@pages/import-data';
import { SyncPage } from '@pages/sync';
import { ProductionPage } from '@pages/production';
import { AuditPage } from '@pages/audit';
import { usePlatformStore } from '@entities/platform/model/platformStore';

function Root() {
  const theme = usePlatformStore((state) => state.theme);
  return <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
    <BrowserRouter><Routes><Route element={<App />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/production-calendar" element={<ProductionCalendarPage />} />
      <Route path="/production" element={<ProductionPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/backup" element={<BackupPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route path="/sync" element={<SyncPage />} />
      <Route path="/audit" element={<AuditPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route></Routes></BrowserRouter>
  </ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<Root />);
