import { AppLayout } from '@widgets/app-layout/AppLayout';
import { useEffect } from 'react';
import { LoginPage } from '@features/auth/ui/LoginPage';
import { useUserStore } from '@entities/user/model/userStore';

export function App() {
  const { initialize, initialized, currentUserId } = useUserStore();
  useEffect(() => initialize(), [initialize]);
  if (!initialized) return null;
  return currentUserId ? <AppLayout /> : <LoginPage />;
}
