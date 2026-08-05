import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Client } from '../../../shared/types/models';
interface ClientState { clients: Client[]; addClient: (client: Client) => void }
export const useClientStore = create<ClientState>((set) => ({ clients: storage.load<Client[]>('clients', []), addClient: (client) => set((state) => ({ clients: [...state.clients, client] })) }));
useClientStore.subscribe((state) => storage.save('clients', state.clients));
