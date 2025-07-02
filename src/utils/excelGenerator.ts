
import * as XLSX from 'xlsx';
import { Bill, Purchase, DashboardStats } from '../types';

export const exportBillToExcel = (bill: Bill) => {
  const workbook = XLSX.utils.book_new();
  
  // Create bill data
  const billData = [
    ['SECURE AUTOMATION & SAFETY SOLUTIONS'],
    ['208, 2ND Floor, Opp. Kamla Nehru Park, Gurugram'],
    ['GSM: 98911344011, 991145999'],
    [''],
    ['INVOICE'],
    [''],
    ['Bill No:', bill.billNo, '', 'Date:', new Date(bill.date).toLocaleDateString()],
    ['PO Number:', bill.poNumber, '', 'Client:', bill.clientName],
    ['Client GSTIN:', bill.clientGSTIN],
    ['Address:', bill.clientAddress],
    [''],
    ['Sr.No', 'Description', 'Unit', 'HSN/SAC', 'Qty', 'Rate', 'Amount'],
    ...bill.items.map((item, index) => [
      index + 1,
      item.description,
      item.unit,
      item.hsn,
      item.qty,
      item.rate,
      item.amount
    ]),
    [''],
    ['', '', '', '', '', 'Subtotal:', bill.subtotal],
    ['', '', '', '', '', bill.isIGST ? 'IGST 18%:' : 'CGST 9%:', bill.isIGST ? bill.igst : bill.cgst],
    ...(bill.isIGST ? [] : [['', '', '', '', '', 'SGST 9%:', bill.sgst]]),
    ['', '', '', '', '', 'Round off:', bill.roundOff],
    ['', '', '', '', '', 'Grand Total:', bill.grandTotal],
    [''],
    ['Amount in words:', bill.amountInWords]
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(billData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bill');
  
  XLSX.writeFile(workbook, `Bill-${bill.billNo}.xlsx`);
};

export const exportSalesReport = (stats: DashboardStats) => {
  const workbook = XLSX.utils.book_new();
  
  // Sales Summary
  const summaryData = [
    ['Sales Report - ' + new Date().toLocaleDateString()],
    [''],
    ['Total Sales:', stats.totalSales],
    ['Total Bills:', stats.totalBills],
    ['Today Sales:', stats.todaySales],
    ['This Week:', stats.weekSales],
    ['This Month:', stats.monthSales],
    ['This Year:', stats.yearSales],
    [''],
    ['Top Selling Items:'],
    ['Item', 'Quantity Sold', 'Revenue'],
    ...stats.topItems.map(item => [item.name, item.quantity, item.revenue])
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Daily Sales Data
  const dailyData = [
    ['Date', 'Sales Amount', 'Number of Bills'],
    ...stats.dailySalesData.map(day => [day.date, day.sales, day.bills])
  ];
  
  const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Sales');
  
  XLSX.writeFile(workbook, `Sales-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
};
