import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Client } from '../../../shared/types/models';
interface ClientState { clients: Client[]; addClient: (client: Client) => void; updateClient: (client: Client) => void; deleteClient: (id: string) => void; searchClients: (query: string) => Client[] }
export const useClientStore = create<ClientState>((set, get) => ({
  clients: storage.load<Client[]>('clients', []),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (client) => set((state) => ({ clients: state.clients.map((item) => item.id === client.id ? client : item) })),
  deleteClient: (id) => set((state) => ({ clients: state.clients.filter((client) => client.id !== id) })),
  searchClients: (query) => { const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU'); if (!normalizedQuery) return get().clients; return get().clients.filter((client) => [client.name, client.phone, client.city, client.comment].some((field) => field.toLocaleLowerCase('ru-RU').includes(normalizedQuery))); },
}));
useClientStore.subscribe((state) => storage.save('clients', state.clients));
