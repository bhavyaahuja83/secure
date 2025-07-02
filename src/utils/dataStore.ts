
import { Bill, Client, Purchase, Item, TechnicianReport, DashboardStats } from '../types';

// Local storage keys
const STORAGE_KEYS = {
  BILLS: 'bills',
  CLIENTS: 'clients',
  PURCHASES: 'purchases',
  ITEMS: 'items',
  REPORTS: 'technician_reports'
};

export const dataStore = {
  // Bills
  getBills: (): Bill[] => {
    const bills = localStorage.getItem(STORAGE_KEYS.BILLS);
    return bills ? JSON.parse(bills) : [];
  },

  saveBill: (bill: Bill) => {
    const bills = dataStore.getBills();
    const existingIndex = bills.findIndex(b => b.id === bill.id);
    if (existingIndex >= 0) {
      bills[existingIndex] = bill;
    } else {
      bills.push(bill);
    }
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  },

  // Clients
  getClients: (): Client[] => {
    const clients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return clients ? JSON.parse(clients) : [];
  },

  saveClient: (client: Client) => {
    const clients = dataStore.getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);
    if (existingIndex >= 0) {
      clients[existingIndex] = client;
    } else {
      clients.push(client);
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  getClientByGSTIN: (gstin: string): Client | null => {
    const clients = dataStore.getClients();
    return clients.find(c => c.gstin === gstin) || null;
  },

  // Purchases
  getPurchases: (): Purchase[] => {
    const purchases = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return purchases ? JSON.parse(purchases) : [];
  },

  savePurchase: (purchase: Purchase) => {
    const purchases = dataStore.getPurchases();
    const existingIndex = purchases.findIndex(p => p.id === purchase.id);
    if (existingIndex >= 0) {
      purchases[existingIndex] = purchase;
    } else {
      purchases.push(purchase);
    }
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },

  // Items
  getItems: (): Item[] => {
    const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return items ? JSON.parse(items) : [];
  },

  saveItem: (item: Item) => {
    const items = dataStore.getItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  },

  // Reports
  getReports: (): TechnicianReport[] => {
    const reports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return reports ? JSON.parse(reports) : [];
  },

  saveReport: (report: TechnicianReport) => {
    const reports = dataStore.getReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.push(report);
    }
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  // Analytics
  getDashboardStats: (): DashboardStats => {
    const bills = dataStore.getBills();
    const purchases = dataStore.getPurchases();
    const clients = dataStore.getClients();
    const items = dataStore.getItems();
    const reports = dataStore.getReports();

    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisMonthStart = new Date();
    thisMonthStart.setMonth(thisMonthStart.getMonth() - 1);
    const thisYearStart = new Date();
    thisYearStart.setFullYear(thisYearStart.getFullYear() - 1);

    const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0);
    const totalGSTOutput = bills.reduce((sum, bill) => sum + bill.cgst + bill.sgst + bill.igst, 0);
    const totalGSTInput = purchases.reduce((sum, purchase) => sum + purchase.cgst + purchase.sgst + purchase.igst, 0);

    const todaySales = bills
      .filter(bill => bill.date === today)
      .reduce((sum, bill) => sum + bill.grandTotal, 0);

    const weekSales = bills
      .filter(bill => new Date(bill.date) >= thisWeekStart)
      .reduce((sum, bill) => sum + bill.grandTotal, 0);

    const monthSales = bills
      .filter(bill => new Date(bill.date) >= thisMonthStart)
      .reduce((sum, bill) => sum + bill.grandTotal, 0);

    const yearSales = bills
      .filter(bill => new Date(bill.date) >= thisYearStart)
      .reduce((sum, bill) => sum + bill.grandTotal, 0);

    // Generate daily sales data for the last 30 days
    const dailySalesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayBills = bills.filter(bill => bill.date === dateStr);
      dailySalesData.push({
        date: dateStr,
        sales: dayBills.reduce((sum, bill) => sum + bill.grandTotal, 0),
        bills: dayBills.length
      });
    }

    // Top selling items
    const itemSales: { [key: string]: { quantity: number; revenue: number; name: string } } = {};
    bills.forEach(bill => {
      bill.items.forEach(item => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { quantity: 0, revenue: 0, name: item.description };
        }
        itemSales[item.id].quantity += item.qty;
        itemSales[item.id].revenue += item.amount;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lowStockItems = items.filter(item => item.stock <= item.minStock).length;
    const pendingReports = reports.filter(report => report.status === 'pending').length;

    return {
      totalSales,
      totalPurchases,
      totalGSTOutput,
      totalGSTInput,
      totalClients: clients.length,
      totalBills: bills.length,
      todaySales,
      weekSales,
      monthSales,
      yearSales,
      dailySalesData,
      topItems,
      lowStockItems,
      pendingReports
    };
  }
};
