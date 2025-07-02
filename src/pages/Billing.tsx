
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash, Plus, FileText, Download, Users, Search } from 'lucide-react';
import { BillItem, Bill, Client } from '../types';
import { calculateGST, convertToWords, generateBillNumber } from '../utils/calculations';
import { dataStore } from '../utils/dataStore';
import { downloadBillPDF } from '../utils/pdfGenerator';
import { exportBillToExcel } from '../utils/excelGenerator';
import { toast } from 'sonner';
import { getCurrentUser } from '../utils/auth';

const Billing: React.FC = () => {
  const [billData, setBillData] = useState<Partial<Bill>>({
    billNo: generateBillNumber(),
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientGSTIN: '',
    clientAddress: '',
    poNumber: '',
    siteAddress: '',
    items: [],
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    roundOff: 0,
    grandTotal: 0,
    amountInWords: '',
    isIGST: false
  });

  const [currentItem, setCurrentItem] = useState<BillItem>({
    id: '',
    description: '',
    unit: 'Nos.',
    hsn: '',
    qty: 1,
    rate: 0,
    amount: 0
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    setClients(dataStore.getClients());
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectClient = (client: Client) => {
    setBillData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientGSTIN: client.gstin,
      clientAddress: client.address,
      siteAddress: client.siteAddress || ''
    }));
    setSelectedClientId(client.id);
    setIsClientDialogOpen(false);
    toast.success(`Client ${client.name} selected`);
  };

  const addItem = () => {
    if (!currentItem.description || currentItem.rate <= 0) {
      toast.error('Please fill in all item details');
      return;
    }

    const newItem: BillItem = {
      ...currentItem,
      id: Date.now().toString(),
      amount: currentItem.qty * currentItem.rate
    };

    setBillData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setCurrentItem({
      id: '',
      description: '',
      unit: 'Nos.',
      hsn: '',
      qty: 1,
      rate: 0,
      amount: 0
    });

    toast.success('Item added to bill');
  };

  const removeItem = (id: string) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== id) || []
    }));
  };

  const calculateTotals = () => {
    const items = billData.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gst = calculateGST(subtotal, billData.isIGST);
    const totalGST = gst.cgst + gst.sgst + gst.igst;
    const beforeRound = subtotal + totalGST;
    const roundOff = Math.round(beforeRound) - beforeRound;
    const grandTotal = Math.round(beforeRound);

    setBillData(prev => ({
      ...prev,
      subtotal,
      ...gst,
      roundOff,
      grandTotal,
      amountInWords: convertToWords(grandTotal)
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [billData.items, billData.isIGST]);

  const saveClientIfNew = (bill: Bill) => {
    if (!bill.clientId && bill.clientName && bill.clientGSTIN) {
      const existingClient = dataStore.getClientByGSTIN(bill.clientGSTIN);
      if (!existingClient) {
        const newClient: Client = {
          id: Date.now().toString(),
          name: bill.clientName,
          gstin: bill.clientGSTIN,
          address: bill.clientAddress,
          siteAddress: bill.siteAddress,
          createdAt: new Date().toISOString(),
          lastBillDate: bill.date,
          totalBilled: bill.grandTotal
        };
        dataStore.saveClient(newClient);
        toast.success('New client saved automatically');
      }
    }
  };

  const generateBill = () => {
    if (!billData.clientName || !billData.items?.length) {
      toast.error('Please fill in client details and add items');
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('User session expired');
      return;
    }

    const completeBill: Bill = {
      id: Date.now().toString(),
      billNo: billData.billNo!,
      date: billData.date!,
      clientId: billData.clientId || '',
      clientName: billData.clientName!,
      clientGSTIN: billData.clientGSTIN!,
      clientAddress: billData.clientAddress!,
      poNumber: billData.poNumber!,
      siteAddress: billData.siteAddress || '',
      items: billData.items!,
      subtotal: billData.subtotal!,
      cgst: billData.cgst!,
      sgst: billData.sgst!,
      igst: billData.igst!,
      roundOff: billData.roundOff!,
      grandTotal: billData.grandTotal!,
      amountInWords: billData.amountInWords!,
      isIGST: billData.isIGST!,
      userId: currentUser.passcode,
      createdAt: new Date().toISOString()
    };

    // Save bill
    dataStore.saveBill(completeBill);
    
    // Save client if new
    saveClientIfNew(completeBill);

    // Update inventory (reduce stock)
    billData.items?.forEach(billItem => {
      const items = dataStore.getItems();
      const item = items.find(i => i.description === billItem.description);
      if (item && item.stock >= billItem.qty) {
        item.stock -= billItem.qty;
        dataStore.saveItem(item);
      }
    });

    toast.success('Bill generated and saved successfully!');
    
    // Reset form
    setBillData({
      billNo: generateBillNumber(),
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      clientGSTIN: '',
      clientAddress: '',
      poNumber: '',
      siteAddress: '',
      items: [],
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      roundOff: 0,
      grandTotal: 0,
      amountInWords: '',
      isIGST: false
    });
    setSelectedClientId('');
  };

  const exportToPDF = () => {
    if (!billData.items?.length) {
      toast.error('No items to export');
      return;
    }
    
    const bill = billData as Bill;
    downloadBillPDF(bill);
    toast.success('PDF exported successfully');
  };

  const exportToExcel = () => {
    if (!billData.items?.length) {
      toast.error('No items to export');
      return;
    }
    
    const bill = billData as Bill;
    exportBillToExcel(bill);
    toast.success('Excel exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-gray-600">Generate professional invoices with client management</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={generateBill} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Generate Bill
          </Button>
        </div>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Client Information
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Select Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Existing Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <Input
                      placeholder="Search by name or GSTIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                      <div className="space-y-2">
                        {filteredClients.map(client => (
                          <div
                            key={client.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => selectClient(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-600">GSTIN: {client.gstin}</div>
                            <div className="text-sm text-gray-500">{client.address}</div>
                            {client.totalBilled && (
                              <div className="text-sm text-green-600">
                                Total Billed: ₹{client.totalBilled.toLocaleString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No clients found. Create a new bill to add your first client.
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="billNo">Bill Number</Label>
              <Input
                id="billNo"
                value={billData.billNo}
                onChange={(e) => setBillData(prev => ({ ...prev, billNo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={billData.date}
                onChange={(e) => setBillData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                value={billData.poNumber}
                onChange={(e) => setBillData(prev => ({ ...prev, poNumber: e.target.value }))}
                placeholder="e.g., TELEPHONIC CONFIRMATION"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={billData.clientName}
                onChange={(e) => setBillData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="clientGSTIN">Client GSTIN *</Label>
              <Input
                id="clientGSTIN"
                value={billData.clientGSTIN}
                onChange={(e) => setBillData(prev => ({ ...prev, clientGSTIN: e.target.value }))}
                placeholder="e.g., 07GBVPS2158R1ZC"
              />
            </div>
            <div>
              <Label htmlFor="clientAddress">Client Address *</Label>
              <Textarea
                id="clientAddress"
                value={billData.clientAddress}
                onChange={(e) => setBillData(prev => ({ ...prev, clientAddress: e.target.value }))}
                rows={3}
                placeholder="Enter complete address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Items */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div>
              <Label>Description *</Label>
              <Input
                value={currentItem.description}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={currentItem.unit}
                onValueChange={(value) => setCurrentItem(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nos.">Nos.</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Meter">Meter</SelectItem>
                  <SelectItem value="Set">Set</SelectItem>
                  <SelectItem value="Piece">Piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>HSN/SAC</Label>
              <Input
                value={currentItem.hsn}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, hsn: e.target.value }))}
                placeholder="HSN code"
              />
            </div>
            <div>
              <Label>Qty *</Label>
              <Input
                type="number"
                value={currentItem.qty}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, qty: Number(e.target.value) }))}
                min="1"
              />
            </div>
            <div>
              <Label>Rate *</Label>
              <Input
                type="number"
                value={currentItem.rate}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, rate: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      {billData.items && billData.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bill Items ({billData.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Sr.No</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-left">Unit</th>
                    <th className="border border-gray-300 p-2 text-left">HSN/SAC</th>
                    <th className="border border-gray-300 p-2 text-right">Qty</th>
                    <th className="border border-gray-300 p-2 text-right">Rate</th>
                    <th className="border border-gray-300 p-2 text-right">Amount</th>
                    <th className="border border-gray-300 p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2">{index + 1}</td>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2">{item.unit}</td>
                      <td className="border border-gray-300 p-2">{item.hsn}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.qty}</td>
                      <td className="border border-gray-300 p-2 text-right">₹{item.rate.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2 text-right">₹{item.amount.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      {billData.items && billData.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Bill Summary
              <div className="flex items-center space-x-2">
                <Label htmlFor="igst-toggle">IGST (Inter-state)</Label>
                <Switch
                  id="igst-toggle"
                  checked={billData.isIGST}
                  onCheckedChange={(checked) => setBillData(prev => ({ ...prev, isIGST: checked }))}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{billData.subtotal?.toLocaleString()}</span>
              </div>
              {!billData.isIGST ? (
                <>
                  <div className="flex justify-between">
                    <span>Add: CGST 9%</span>
                    <span>₹{billData.cgst?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add: SGST 9%</span>
                    <span>₹{billData.sgst?.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Add: IGST 18%</span>
                  <span>₹{billData.igst?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Round off:</span>
                <span>{billData.roundOff && billData.roundOff > 0 ? '+' : ''}₹{billData.roundOff?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{billData.grandTotal?.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                <strong>Amount in words:</strong> {billData.amountInWords}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Billing;
