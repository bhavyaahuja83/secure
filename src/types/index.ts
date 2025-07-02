export interface User {
  passcode: string;
  name: string;
}

export interface Item {
  id: string;
  description: string;
  unit: string;
  hsn: string;
  rate: number;
  category: string;
  stock: number;
  minStock: number;
  sellingRate?: number;
  purchaseRate?: number;
  lastPurchaseDate?: string;
  createdAt?: string;
}

export interface BillItem {
  id: string;
  description: string;
  unit: string;
  hsn: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Bill {
  id: string;
  billNo: string;
  date: string;
  clientId: string;
  clientName: string;
  clientGSTIN: string;
  clientAddress: string;
  poNumber: string;
  siteAddress: string;
  items: BillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
  isIGST: boolean;
  userId: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  gstin: string;
  address: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  poNumbers?: string[];
  siteAddress?: string;
  createdAt: string;
  lastBillDate?: string;
  totalBilled?: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierName: string;
  supplierGSTIN: string;
  billNo: string;
  items: PurchaseItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  isIGST: boolean;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  hsn: string;
}

export interface GSTEntry {
  id: string;
  type: 'input' | 'output';
  billId: string;
  billNo: string;
  date: string;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  userId: string;
}

export interface TechnicianReport {
  id: string;
  technicianName: string;
  clientId: string;
  clientName: string;
  siteAddress: string;
  reportType: 'installation' | 'maintenance' | 'repair' | 'inspection';
  description: string;
  images: string[];
  status: 'pending' | 'acknowledged' | 'completed';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  workHours?: number;
  materialUsed?: BillItem[];
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalGSTOutput: number;
  totalGSTInput: number;
  totalClients: number;
  totalBills: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  yearSales: number;
  dailySalesData: { date: string; sales: number; bills: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  lowStockItems: number;
  pendingReports: number;
}
