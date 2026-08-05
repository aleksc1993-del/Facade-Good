import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Client } from '../../../shared/types/models';
interface ClientState { clients: Client[]; addClient: (client: Client) => void }
export const useClientStore = create<ClientState>((set) => ({ clients: storage.get<Client[]>('facade-good-clients', []), addClient: (client) => set((state) => { const clients = [...state.clients, client]; storage.set('facade-good-clients', clients); return { clients }; }) }));
