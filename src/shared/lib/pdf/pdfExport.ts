import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Client, Order, OrganizationSettings, Payment } from '../../types/models';
import { getOrderBalance, getOrderPaid, getOrderTotal } from '../order-financials';

export interface PdfExportData { title: string; html: string; text: string; fileName: string }

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character);
const money = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`;

const documentHtml = (data: PdfExportData): string => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#1f2937;padding:32px}h1{color:#1677ff;border-bottom:2px solid #1677ff;padding-bottom:12px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px;border-bottom:1px solid #d9e2ec;text-align:left}th:last-child,td:last-child{text-align:right}.muted{color:#667085}</style></head><body>${data.html}</body></html>`;

const fallbackPdf = async (data: PdfExportData): Promise<void> => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(data.title, { x: 40, y: 750, size: 18, font, color: rgb(0.09, 0.47, 1) });
  data.text.split('\n').slice(0, 42).forEach((line, index) => page.drawText(line.slice(0, 110), { x: 40, y: 720 - index * 16, size: 9, font }));
  const bytes = await pdf.save();
  const pdfBuffer = new Uint8Array(bytes.length); pdfBuffer.set(bytes);
  const url = URL.createObjectURL(new Blob([pdfBuffer.buffer], { type: 'application/pdf' }));
  const link = document.createElement('a'); link.href = url; link.download = data.fileName; link.click(); URL.revokeObjectURL(url);
};

export const exportPdf = async (data: PdfExportData): Promise<void> => {
  if (window.facadeGood) { await window.facadeGood.printToPdf(documentHtml(data), data.fileName); return; }
  await fallbackPdf(data);
};

export const createOrderPdf = (order: Order, client: Client | undefined, settings: OrganizationSettings, payments: Payment[], title: string): PdfExportData => {
  const rows = order.items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${money(item.quantity * item.price)}</td></tr>`).join('');
  const total = getOrderTotal(order); const paid = getOrderPaid(order.id, payments); const balance = getOrderBalance(order, payments);
  return { title, fileName: `${title.toLowerCase().replaceAll(' ', '-')}-${order.number}.pdf`, html: `<h1>${escapeHtml(title)}</h1><p class="muted">${escapeHtml(settings.name)} · ${new Date().toLocaleDateString('ru-RU')}</p><p>Клиент: <b>${escapeHtml(client?.name ?? 'Не указан')}</b><br>Заказ №${escapeHtml(order.number)}</p><table><thead><tr><th>Изделие</th><th>Количество</th><th>Сумма</th></tr></thead><tbody>${rows}</tbody></table><p><b>Итого:</b> ${money(total)}<br>Оплачено: ${money(paid)}<br>Задолженность: ${money(balance)}</p>`, text: `${title}\nОрганизация: ${settings.name}\nКлиент: ${client?.name ?? 'Не указан'}\nЗаказ №${order.number}\nИтого: ${money(total)}\nОплачено: ${money(paid)}\nЗадолженность: ${money(balance)}` };
};

export const createClientsPdf = (clients: Client[], settings: OrganizationSettings): PdfExportData => ({ title: 'Список клиентов', fileName: 'spisok-klientov.pdf', html: `<h1>Список клиентов</h1><p class="muted">${escapeHtml(settings.name)} · ${new Date().toLocaleDateString('ru-RU')}</p><table><thead><tr><th>Имя</th><th>Телефон</th><th>Город</th></tr></thead><tbody>${clients.map((client) => `<tr><td>${escapeHtml(client.name)}</td><td>${escapeHtml(client.phone)}</td><td>${escapeHtml(client.city)}</td></tr>`).join('')}</tbody></table>`, text: ['Список клиентов', ...clients.map((client) => `${client.name} | ${client.phone} | ${client.city}`)].join('\n') });

export const createPaymentsPdf = (payments: Payment[], orders: Order[], clients: Client[], settings: OrganizationSettings): PdfExportData => ({ title: 'История платежей', fileName: 'istoriya-platezhey.pdf', html: `<h1>История платежей</h1><p class="muted">${escapeHtml(settings.name)}</p><table><thead><tr><th>Дата</th><th>Клиент</th><th>Тип</th><th>Сумма</th></tr></thead><tbody>${payments.map((payment) => { const order = orders.find((item) => item.id === payment.orderId); const client = clients.find((item) => item.id === order?.clientId); return `<tr><td>${escapeHtml(payment.date)}</td><td>${escapeHtml(client?.name ?? 'Не указан')}</td><td>${escapeHtml(payment.type)}</td><td>${money(payment.amount)}</td></tr>`; }).join('')}</tbody></table>`, text: ['История платежей', ...payments.map((payment) => `${payment.date} | ${payment.type} | ${money(payment.amount)}`)].join('\n') });

export const createDebtPdf = (orders: Order[], clients: Client[], payments: Payment[], settings: OrganizationSettings): PdfExportData => { const debtOrders = orders.filter((order) => getOrderBalance(order, payments) > 0); return { title: 'Отчет по задолженности', fileName: 'otchet-po-zadolzhennosti.pdf', html: `<h1>Отчет по задолженности</h1><p class="muted">${escapeHtml(settings.name)}</p><table><thead><tr><th>Заказ</th><th>Клиент</th><th>Задолженность</th></tr></thead><tbody>${debtOrders.map((order) => `<tr><td>№${escapeHtml(order.number)}</td><td>${escapeHtml(clients.find((client) => client.id === order.clientId)?.name ?? 'Не указан')}</td><td>${money(getOrderBalance(order, payments))}</td></tr>`).join('')}</tbody></table>`, text: ['Отчет по задолженности', ...debtOrders.map((order) => `Заказ №${order.number} | ${money(getOrderBalance(order, payments))}`)].join('\n') }; };
