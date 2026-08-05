import ExcelJS from 'exceljs';
import type { Client, Order, Payment } from '@shared/types/models';
import { getOrderBalance, getOrderPaid, getOrderTotal, getPaymentValue } from '@shared/lib/order-financials';

const currencyFormat = '#,##0.00 [$₽-ru-RU]';
const dateFormat = 'dd.mm.yyyy hh:mm';
const dateOnlyFormat = 'dd.mm.yyyy';

type ExportRow = Array<string | number | Date>;

const addSheet = (workbook: ExcelJS.Workbook, name: string, headers: string[], rows: ExportRow[]) => {
  const sheet = workbook.addWorksheet(name);
  sheet.addRows([headers, ...rows]);
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + Math.min(headers.length, 26))}1` };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1677FF' } };
  sheet.getRow(1).alignment = { vertical: 'middle' };
  sheet.columns.forEach((column) => { column.width = Math.min(Math.max((column.header?.toString().length ?? 10) + 4, 14), 32); });
  return sheet;
};

const saveWorkbook = async (workbook: ExcelJS.Workbook, filename: string): Promise<void> => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export async function exportClients(clients: Client[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  addSheet(workbook, 'Клиенты', ['Имя', 'Телефон', 'Город', 'Комментарий', 'Создан'], clients.map((client) => [client.name, client.phone, client.city, client.comment, new Date(client.createdAt)]));
  await saveWorkbook(workbook, 'clients.xlsx');
}

export async function exportOrders(orders: Order[], clients: Client[], payments: Payment[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = addSheet(workbook, 'Заказы', ['Номер', 'Клиент', 'Статус', 'Создан', 'Срок', 'Стоимость', 'Оплачено', 'Остаток', 'Комментарий'], orders.map((order) => [order.number, clients.find((client) => client.id === order.clientId)?.name ?? 'Удалённый клиент', order.status, new Date(order.createdAt), order.deadline ? new Date(order.deadline) : '', getOrderTotal(order), getOrderPaid(order.id, payments), getOrderBalance(order, payments), order.comment]));
  sheet.getColumn(4).numFmt = dateOnlyFormat;
  sheet.getColumn(5).numFmt = dateOnlyFormat;
  [6, 7, 8].forEach((index) => { sheet.getColumn(index).numFmt = currencyFormat; });
  await saveWorkbook(workbook, 'orders.xlsx');
}

export async function exportPayments(payments: Payment[], orders: Order[], clients: Client[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = addSheet(workbook, 'Оплаты', ['Дата', 'Заказ', 'Клиент', 'Тип', 'Сумма', 'С учётом типа'], payments.map((payment) => { const order = orders.find((item) => item.id === payment.orderId); return [new Date(payment.date), order?.number ?? 'Удалённый заказ', clients.find((client) => client.id === order?.clientId)?.name ?? 'Удалённый клиент', payment.type, payment.amount, getPaymentValue(payment)]; }));
  sheet.getColumn(1).numFmt = dateFormat;
  [5, 6].forEach((index) => { sheet.getColumn(index).numFmt = currencyFormat; });
  await saveWorkbook(workbook, 'payments.xlsx');
}

export async function exportDebtors(orders: Order[], clients: Client[], payments: Payment[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const debtors = orders.filter((order) => getOrderBalance(order, payments) > 0);
  const sheet = addSheet(workbook, 'Должники', ['Клиент', 'Телефон', 'Заказ', 'Стоимость', 'Оплачено', 'Долг'], debtors.map((order) => { const client = clients.find((item) => item.id === order.clientId); return [client?.name ?? 'Удалённый клиент', client?.phone ?? '', order.number, getOrderTotal(order), getOrderPaid(order.id, payments), getOrderBalance(order, payments)]; }));
  [4, 5, 6].forEach((index) => { sheet.getColumn(index).numFmt = currencyFormat; });
  await saveWorkbook(workbook, 'debtors.xlsx');
}

export async function exportStatistics(clients: Client[], orders: Order[], payments: Payment[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const totalValue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + getPaymentValue(payment), 0);
  const totalDebt = orders.reduce((sum, order) => sum + getOrderBalance(order, payments), 0);
  const sheet = addSheet(workbook, 'Статистика', ['Показатель', 'Значение'], [['Клиентов', clients.length], ['Заказов', orders.length], ['Платежей', payments.length], ['Стоимость заказов', totalValue], ['Получено с учётом возвратов', totalPaid], ['Общая задолженность', totalDebt], ['Заказов с долгом', orders.filter((order) => getOrderBalance(order, payments) > 0).length]]);
  [4, 5, 6].forEach((row) => { sheet.getCell(`B${row}`).numFmt = currencyFormat; });
  await saveWorkbook(workbook, 'statistics.xlsx');
}
