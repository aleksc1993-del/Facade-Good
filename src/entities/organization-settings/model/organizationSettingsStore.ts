import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { OrganizationSettings } from '../../../shared/types/models';

interface OrganizationSettingsState {
  settings: OrganizationSettings;
  updateSettings: (settings: OrganizationSettings) => void;
}

const defaultSettings: OrganizationSettings = { name: '', phone: '', email: '', address: '', logo: '' };

export const useOrganizationSettingsStore = create<OrganizationSettingsState>((set) => ({
  settings: storage.load<OrganizationSettings>('organization-settings', defaultSettings),
  updateSettings: (settings) => set({ settings }),
}));

useOrganizationSettingsStore.subscribe((state) => storage.save('organization-settings', state.settings));
