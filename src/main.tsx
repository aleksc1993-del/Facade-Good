import { ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')!).render(<ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}><App /></ConfigProvider>);
