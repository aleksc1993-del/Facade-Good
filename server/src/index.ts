import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { initializeDatabase, pool } from './db.js';
interface Client { name: string; phone: string; city: string; comment: string; createdAt: string; archivedAt?: string }
interface Order { clientId: string; number: string; contractNumber?: string; invoiceNumber?: string; status: string; createdAt: string; deadline: string; comment: string; items: object[]; archivedAt?: string }
interface Payment { orderId: string; date: string; amount: number; type: string }

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

const send = (res: Response, value: unknown): void => { res.json(value); };
const id = (request: Request): string => request.params.id ?? '';

app.get('/api/clients', async (_req, res) => send(res, (await pool.query('SELECT id, name, phone, city, comment, created_at AS "createdAt", archived_at AS "archivedAt" FROM clients ORDER BY created_at DESC')).rows));
app.put('/api/clients/:id', async (req, res) => {
  const client = req.body as Client;
  await pool.query(`INSERT INTO clients (id,name,phone,city,comment,created_at,archived_at) VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (id) DO UPDATE SET name=$2,phone=$3,city=$4,comment=$5,created_at=$6,archived_at=$7`, [id(req), client.name, client.phone, client.city, client.comment, client.createdAt, client.archivedAt ?? null]);
  res.status(204).send();
});
app.delete('/api/clients/:id', async (req, res) => { await pool.query('DELETE FROM clients WHERE id=$1', [id(req)]); res.status(204).send(); });

app.get('/api/orders', async (_req, res) => send(res, (await pool.query('SELECT id, client_id AS "clientId", number, contract_number AS "contractNumber", invoice_number AS "invoiceNumber", status, created_at AS "createdAt", deadline, comment, items, archived_at AS "archivedAt" FROM orders ORDER BY created_at DESC')).rows));
app.put('/api/orders/:id', async (req, res) => { const order = req.body as Order; await pool.query(`INSERT INTO orders (id,client_id,number,contract_number,invoice_number,status,created_at,deadline,comment,items,archived_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO UPDATE SET client_id=$2,number=$3,contract_number=$4,invoice_number=$5,status=$6,created_at=$7,deadline=$8,comment=$9,items=$10,archived_at=$11`, [id(req), order.clientId, order.number, order.contractNumber ?? null, order.invoiceNumber ?? null, order.status, order.createdAt, order.deadline, order.comment, JSON.stringify(order.items), order.archivedAt ?? null]); res.status(204).send(); });
app.delete('/api/orders/:id', async (req, res) => { await pool.query('DELETE FROM orders WHERE id=$1', [id(req)]); res.status(204).send(); });

app.get('/api/payments', async (_req, res) => send(res, (await pool.query('SELECT id, order_id AS "orderId", date, amount, type FROM payments ORDER BY date DESC')).rows));
app.put('/api/payments/:id', async (req, res) => { const payment = req.body as Payment; await pool.query(`INSERT INTO payments (id,order_id,date,amount,type) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET order_id=$2,date=$3,amount=$4,type=$5`, [id(req), payment.orderId, payment.date, payment.amount, payment.type]); res.status(204).send(); });
app.delete('/api/payments/:id', async (req, res) => { await pool.query('DELETE FROM payments WHERE id=$1', [id(req)]); res.status(204).send(); });

app.get('/api/values/:key', async (req, res) => { const result = await pool.query('SELECT value FROM values_store WHERE key=$1', [id(req)]); if (result.rowCount === 0) return res.sendStatus(404); send(res, result.rows[0].value); });
app.put('/api/values/:key', async (req, res) => { await pool.query('INSERT INTO values_store (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2', [id(req), req.body]); res.status(204).send(); });
app.delete('/api/values/:key', async (req, res) => { await pool.query('DELETE FROM values_store WHERE key=$1', [id(req)]); res.status(204).send(); });

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
const port = Number(process.env.PORT ?? 3000);
initializeDatabase().then(() => app.listen(port, () => console.log(`Facade-Good API listening on port ${port}`))).catch((error: unknown) => { console.error(error); process.exit(1); });
