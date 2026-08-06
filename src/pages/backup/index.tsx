import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Divider, Space, Switch, Typography, message } from 'antd';
import { CloudDownloadOutlined, CloudUploadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { storage } from '@shared/lib/storage/storage';
import { useBackupStore } from '@entities/backup/model/backupStore';
const Header = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' });
const SettingsRow = styled.div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, padding: '8px 0' });
const Path = styled(Typography.Text)({ wordBreak: 'break-all' });
export function BackupPage() {
  const { folderPath, automaticDaily, lastBackupAt, setFolderPath, setAutomaticDaily, markBackupCreated } = useBackupStore();
  const [api, contextHolder] = message.useMessage(); const [busy, setBusy] = useState(false);
  const chooseFolder = async () => { const path = await window.facadeGood?.selectBackupFolder(); if (path) setFolderPath(path); };
  const backup = useCallback(async () => { if (!folderPath || !window.facadeGood) { api.warning('Выберите папку для резервных копий'); return; } setBusy(true); try { const name = `facade-good-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`; await window.facadeGood.writeBackupFile(folderPath, name, storage.exportDatabase()); markBackupCreated(); api.success('Резервная копия создана'); } catch { api.error('Не удалось создать резервную копию'); } finally { setBusy(false); } }, [api, folderPath, markBackupCreated]);
  const restore = async () => { const data = await window.facadeGood?.selectBackupFile(); if (!data) return; if (!storage.importDatabase(data)) { api.error('Некорректный файл резервной копии'); return; } api.success('Данные восстановлены'); window.setTimeout(() => window.location.reload(), 700); };
  useEffect(() => { if (!automaticDaily || !folderPath) return; if (!lastBackupAt || Date.now() - new Date(lastBackupAt).getTime() >= 86400000) void backup(); }, [automaticDaily, backup, folderPath, lastBackupAt]);
  return <>{contextHolder}<Header><div><Typography.Title level={2}>Резервное копирование</Typography.Title><Typography.Text type="secondary">Сохранение и восстановление данных CRM</Typography.Text></div><Space><Button icon={<CloudUploadOutlined />} onClick={restore}>Восстановить</Button><Button type="primary" icon={<CloudDownloadOutlined />} loading={busy} onClick={backup}>Создать копию</Button></Space></Header><Card><SettingsRow><div><Typography.Text strong>Папка резервных копий</Typography.Text><br /><Path type={folderPath ? undefined : 'secondary'}>{folderPath || 'Папка не выбрана'}</Path></div><Button icon={<FolderOpenOutlined />} onClick={chooseFolder}>Выбрать папку</Button></SettingsRow><Divider /><SettingsRow><div><Typography.Text strong>Автоматические ежедневные копии</Typography.Text><br /><Typography.Text type="secondary">Создавать копию при первом запуске за новые сутки</Typography.Text></div><Switch checked={automaticDaily} onChange={setAutomaticDaily} disabled={!folderPath} /></SettingsRow>{lastBackupAt && <Alert type="info" showIcon message={`Последняя копия: ${new Date(lastBackupAt).toLocaleString('ru-RU')}`} style={{ marginTop: 20 }} />}</Card></>;
}
