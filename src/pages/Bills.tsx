
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Download, 
  FileText, 
  Calendar,
  IndianRupee,
  Building2,
  Filter
} from 'lucide-react';
import { Bill } from '../types';
import { dataStore } from '../utils/dataStore';
import { downloadBillPDF } from '../utils/pdfGenerator';
import { exportBillToExcel } from '../utils/excelGenerator';
import { toast } from 'sonner';
import CreateBill from '../components/CreateBill';

const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    const filtered = bills.filter(bill =>
      bill.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.clientGSTIN.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBills(filtered);
  }, [bills, searchTerm]);

  const loadBills = () => {
    const loadedBills = dataStore.getBills();
    setBills(loadedBills);
  };

  const handleCreateSuccess = () => {
    loadBills();
    setIsCreateDialogOpen(false);
    toast.success('Bill created successfully!');
  };

  const handleDownloadPDF = (bill: Bill) => {
    try {
      const success = downloadBillPDF(bill);
      if (success) {
        toast.success('PDF downloaded successfully');
      } else {
        toast.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadExcel = (bill: Bill) => {
    try {
      exportBillToExcel(bill);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const thisMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.date);
    const now = new Date();
    return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthBills.reduce((sum, bill) => sum + bill.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills & Invoices</h1>
          <p className="text-gray-600">Manage all your billing and invoice records</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2">
              <Plus className="w-5 h-5 mr-2" />
              Create New Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
            </DialogHeader>
            <CreateBill onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-3xl font-bold text-gray-900">{bills.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-purple-600">{thisMonthBills.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(thisMonthRevenue)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by client name, bill number, or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="px-4 py-2">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills ({filteredBills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
              <p className="text-gray-600 mb-4">
                {bills.length === 0 
                  ? "Get started by creating your first bill"
                  : "No bills match your search criteria"
                }
              </p>
              {bills.length === 0 && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Bill
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bill No.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">GSTIN</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">GST Type</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-blue-600">{bill.billNo}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(bill.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{bill.clientName}</div>
                          <div className="text-sm text-gray-500">
                            {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-mono text-sm">
                        {bill.clientGSTIN}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(bill.grandTotal)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={bill.isIGST ? "destructive" : "default"}>
                          {bill.isIGST ? 'IGST' : 'CGST+SGST'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(bill)}
                            className="px-3 py-1 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadExcel(bill)}
                            className="px-3 py-1 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bills;
