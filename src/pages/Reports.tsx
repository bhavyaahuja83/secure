import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Filter
} from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import { Bill, Purchase, Client, Item } from '../types';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const Reports: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState('sales');

  useEffect(() => {
    setBills(dataStore.getBills());
    setPurchases(dataStore.getPurchases());
    setClients(dataStore.getClients());
    setItems(dataStore.getItems());
  }, []);

  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.date);
    return (!dateRange.from || billDate >= dateRange.from) && 
           (!dateRange.to || billDate <= dateRange.to);
  });

  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    return (!dateRange.from || purchaseDate >= dateRange.from) && 
           (!dateRange.to || purchaseDate <= dateRange.to);
  });

  const salesStats = {
    totalSales: filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0),
    totalBills: filteredBills.length,
    avgBillValue: filteredBills.length > 0 ? filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0) / filteredBills.length : 0,
    totalGST: filteredBills.reduce((sum, bill) => sum + bill.cgst + bill.sgst + bill.igst, 0)
  };

  const purchaseStats = {
    totalPurchases: filteredPurchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0),
    totalPurchaseOrders: filteredPurchases.length,
    avgPurchaseValue: filteredPurchases.length > 0 ? filteredPurchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0) / filteredPurchases.length : 0,
    totalGSTInput: filteredPurchases.reduce((sum, purchase) => sum + purchase.cgst + purchase.sgst + purchase.igst, 0)
  };

  const topClients = clients
    .map(client => ({
      ...client,
      totalBilled: filteredBills
        .filter(bill => bill.clientId === client.id)
        .reduce((sum, bill) => sum + bill.grandTotal, 0),
      totalOrders: filteredBills.filter(bill => bill.clientId === client.id).length
    }))
    .filter(client => client.totalBilled > 0)
    .sort((a, b) => b.totalBilled - a.totalBilled)
    .slice(0, 10);

  const topItems = items
    .map(item => {
      const soldQuantity = filteredBills.reduce((sum, bill) => {
        const billItem = bill.items.find(bi => bi.description.toLowerCase().includes(item.description.toLowerCase()));
        return sum + (billItem ? billItem.qty : 0);
      }, 0);
      const revenue = filteredBills.reduce((sum, bill) => {
        const billItem = bill.items.find(bi => bi.description.toLowerCase().includes(item.description.toLowerCase()));
        return sum + (billItem ? billItem.amount : 0);
      }, 0);
      return { ...item, soldQuantity, revenue };
    })
    .filter(item => item.soldQuantity > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const lowStockItems = items.filter(item => item.stock <= item.minStock);

  const handleExportReport = async () => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (reportType) {
        case 'sales':
          data = filteredBills.map(bill => ({
            'Bill No': bill.billNo,
            'Date': bill.date,
            'Client': bill.clientName,
            'Subtotal': bill.subtotal,
            'CGST': bill.cgst,
            'SGST': bill.sgst,
            'IGST': bill.igst,
            'Grand Total': bill.grandTotal
          }));
          filename = 'sales-report';
          break;
        case 'purchases':
          data = filteredPurchases.map(purchase => ({
            'Date': purchase.date,
            'Supplier': purchase.supplierName,
            'Bill No': purchase.billNo,
            'Subtotal': purchase.subtotal,
            'CGST': purchase.cgst,
            'SGST': purchase.sgst,
            'IGST': purchase.igst,
            'Grand Total': purchase.grandTotal
          }));
          filename = 'purchase-report';
          break;
        case 'inventory':
          data = items.map(item => ({
            'Description': item.description,
            'Category': item.category,
            'Stock': item.stock,
            'Min Stock': item.minStock,
            'Status': item.stock <= item.minStock ? 'Low Stock' : 'Good',
            'Rate': item.rate
          }));
          filename = 'inventory-report';
          break;
        case 'clients':
          data = topClients.map(client => ({
            'Client Name': client.name,
            'GSTIN': client.gstin,
            'Total Orders': client.totalOrders,
            'Total Billed': client.totalBilled,
            'Phone': client.phone || '',
            'Email': client.email || ''
          }));
          filename = 'client-report';
          break;
      }

      // Create Excel file
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={dateRange.from?.toISOString().split('T')[0] || ''}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
            className="w-40"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateRange.to?.toISOString().split('T')[0] || ''}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
            className="w-40"
          />
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="purchases">Purchase Report</SelectItem>
              <SelectItem value="inventory">Inventory Report</SelectItem>
              <SelectItem value="clients">Client Report</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesStats.totalSales.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats.totalBills} bills this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{purchaseStats.totalPurchases.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {purchaseStats.totalPurchaseOrders} orders this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(salesStats.totalSales - purchaseStats.totalPurchases).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats.totalSales > purchaseStats.totalPurchases ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GST Liability</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(salesStats.totalGST - purchaseStats.totalGSTInput).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Output - Input GST
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="clients">Client Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.soldQuantity}</TableCell>
                        <TableCell>₹{item.revenue.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.slice(0, 5).map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billNo}</TableCell>
                        <TableCell>{bill.clientName}</TableCell>
                        <TableCell>₹{bill.grandTotal.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Low Stock Alert
                <Badge variant="destructive">{lowStockItems.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.minStock}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Low Stock</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Avg Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.totalOrders}</TableCell>
                      <TableCell>₹{client.totalBilled.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{(client.totalBilled / client.totalOrders).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.slice(0, 10).map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                      <TableCell>{purchase.billNo}</TableCell>
                      <TableCell>₹{purchase.grandTotal.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;