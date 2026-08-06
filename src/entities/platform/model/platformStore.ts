import { create } from 'zustand';
import type { AuditEntry, Currency, DocumentTemplate, Organization, ThemeMode, Warehouse } from '@shared/types/models';
import { storage } from '@shared/lib/storage/storage';

interface PlatformState {
  theme: ThemeMode; currency: string; currencies: Currency[]; organizations: Organization[]; warehouses: Warehouse[]; audit: AuditEntry[]; templates: DocumentTemplate[];
  setTheme: (theme: ThemeMode) => void; setCurrency: (code: string) => void; addOrganization: (name: string) => void; addWarehouse: (organizationId: string, name: string, address: string) => void; addAudit: (entry: Omit<AuditEntry, 'id' | 'createdAt'>) => void; saveTemplate: (template: DocumentTemplate) => void;
}
const initialCurrencies: Currency[] = [{ code: 'RUB', name: 'Российский рубль', symbol: '₽', rate: 1, isBase: true }, { code: 'USD', name: 'Доллар США', symbol: '$', rate: 90, isBase: false }, { code: 'EUR', name: 'Евро', symbol: '€', rate: 98, isBase: false }];
const read = <T>(key: string, fallback: T) => storage.load(key, fallback);
export const usePlatformStore = create<PlatformState>((set, get) => ({
  theme: read('theme', 'light'), currency: read('currency', 'RUB'), currencies: read('currencies', initialCurrencies), organizations: read('organizations', []), warehouses: read('warehouses', []), audit: read('audit', []), templates: read('document-templates', []),
  setTheme: (theme) => { storage.save('theme', theme); set({ theme }); }, setCurrency: (currency) => { storage.save('currency', currency); set({ currency }); },
  addOrganization: (name) => { const item = { id: crypto.randomUUID(), name, isActive: true, createdAt: new Date().toISOString() }; const organizations = [...get().organizations, item]; storage.save('organizations', organizations); set({ organizations }); },
  addWarehouse: (organizationId, name, address) => { const item = { id: crypto.randomUUID(), organizationId, name, address, isActive: true }; const warehouses = [...get().warehouses, item]; storage.save('warehouses', warehouses); set({ warehouses }); },
  addAudit: (entry) => { const audit = [{ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...get().audit].slice(0, 1000); storage.save('audit', audit); set({ audit }); },
  saveTemplate: (template) => { const templates = [...get().templates.filter((item) => item.id !== template.id), template]; storage.save('document-templates', templates); set({ templates }); },
}));
