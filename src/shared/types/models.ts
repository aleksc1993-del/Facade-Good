export interface Client { id: string; name: string; phone: string; createdAt: string }
export interface Order { id: string; clientId: string; title: string; totalAmount: number; createdAt: string }
export interface Payment { id: string; orderId: string; amount: number; paidAt: string }
