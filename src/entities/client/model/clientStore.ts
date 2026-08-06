import { create } from 'zustand';
import { repository } from '@shared/api/repository/repository';
import type { Client } from '../../../shared/types/models';
interface ClientState { clients: Client[]; addClient: (client: Client) => void; replaceClients: (clients: Client[]) => void; updateClient: (client: Client) => void; archiveClient: (id: string) => void; restoreClient: (id: string) => void; deleteClient: (id: string) => void; searchClients: (query: string) => Client[] }
export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  addClient: (client) => { set((state) => ({ clients: [...state.clients, client] })); void repository.saveClient(client); },
  replaceClients: (clients) => set({ clients }),
  updateClient: (client) => { set((state) => ({ clients: state.clients.map((item) => item.id === client.id ? client : item) })); void repository.saveClient(client); },
  archiveClient: (id) => { const client = get().clients.find((item) => item.id === id); if (client) { const updated = { ...client, archivedAt: new Date().toISOString() }; set((state) => ({ clients: state.clients.map((item) => item.id === id ? updated : item) })); void repository.saveClient(updated); } },
  restoreClient: (id) => { const client = get().clients.find((item) => item.id === id); if (client) { const updated = { ...client, archivedAt: undefined }; set((state) => ({ clients: state.clients.map((item) => item.id === id ? updated : item) })); void repository.saveClient(updated); } },
  deleteClient: (id) => { set((state) => ({ clients: state.clients.filter((client) => client.id !== id) })); void repository.deleteClient(id); },
  searchClients: (query) => { const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU'); const activeClients = get().clients.filter((client) => !client.archivedAt); if (!normalizedQuery) return activeClients; return activeClients.filter((client) => [client.name, client.phone, client.city, client.comment].some((field) => field.toLocaleLowerCase('ru-RU').includes(normalizedQuery))); },
}));
void repository.getClients().then((clients) => useClientStore.getState().replaceClients(clients));
