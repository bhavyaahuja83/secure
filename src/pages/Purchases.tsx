
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Upload, 
  FileText, 
  Camera,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { Purchase, PurchaseItem } from '../types';
import { dataStore } from '../utils/dataStore';
import { processImageOCR } from '../utils/ocrProcessor';
import { toast } from 'sonner';

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [ocrImage, setOcrImage] = useState<File | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  // Form state
  const [purchaseData, setPurchaseData] = useState<Partial<Purchase>>({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    supplierGSTIN: '',
    billNo: '',
    items: [],
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0,
    isIGST: false
  });

  const [currentItem, setCurrentItem] = useState<PurchaseItem>({
    id: '',
    description: '',
    qty: 1,
    rate: 0,
    amount: 0,
    hsn: ''
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    const filtered = purchases.filter(purchase =>
      purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplierGSTIN.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [purchases, searchTerm]);

  const loadPurchases = () => {
    const loadedPurchases = dataStore.getPurchases();
    setPurchases(loadedPurchases);
  };

  const addItem = () => {
    if (!currentItem.description || currentItem.rate <= 0) {
      toast.error('Please fill in all item details');
      return;
    }

    const newItem: PurchaseItem = {
      ...currentItem,
      id: Date.now().toString(),
      amount: currentItem.qty * currentItem.rate
    };

    setPurchaseData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setCurrentItem({
      id: '',
      description: '',
      qty: 1,
      rate: 0,
      amount: 0,
      hsn: ''
    });

    calculateTotals();
    toast.success('Item added to purchase');
  };

  const removeItem = (id: string) => {
    setPurchaseData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== id) || []
    }));
    calculateTotals();
  };

  const calculateTotals = () => {
    const items = purchaseData.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gstRate = 0.18; // 18% GST
    
    let cgst = 0, sgst = 0, igst = 0;
    
    if (purchaseData.isIGST) {
      igst = subtotal * gstRate;
    } else {
      cgst = subtotal * (gstRate / 2);
      sgst = subtotal * (gstRate / 2);
    }
    
    const grandTotal = subtotal + cgst + sgst + igst;

    setPurchaseData(prev => ({
      ...prev,
      subtotal,
      cgst,
      sgst,
      igst,
      grandTotal
    }));
  };

  const savePurchase = () => {
    if (!purchaseData.supplierName || !purchaseData.items?.length) {
      toast.error('Please fill in supplier details and add items');
      return;
    }

    const completePurchase: Purchase = {
      id: Date.now().toString(),
      date: purchaseData.date!,
      supplierName: purchaseData.supplierName!,
      supplierGSTIN: purchaseData.supplierGSTIN!,
      billNo: purchaseData.billNo!,
      items: purchaseData.items!,
      subtotal: purchaseData.subtotal!,
      cgst: purchaseData.cgst!,
      sgst: purchaseData.sgst!,
      igst: purchaseData.igst!,
      grandTotal: purchaseData.grandTotal!,
      isIGST: purchaseData.isIGST!,
      createdAt: new Date().toISOString()
    };

    dataStore.savePurchase(completePurchase);

    // Update inventory (increase stock)
    purchaseData.items?.forEach(purchaseItem => {
      const items = dataStore.getItems();
      let item = items.find(i => i.description === purchaseItem.description);
      
      if (item) {
        item.stock += purchaseItem.qty;
        item.lastPurchaseDate = purchaseData.date;
        item.purchaseRate = purchaseItem.rate;
      } else {
        // Create new item
        item = {
          id: Date.now().toString(),
          description: purchaseItem.description,
          unit: 'Nos.',
          hsn: purchaseItem.hsn,
          rate: purchaseItem.rate * 1.3, // 30% markup
          category: 'General',
          stock: purchaseItem.qty,
          minStock: 5,
          sellingRate: purchaseItem.rate * 1.3, // 30% markup
          purchaseRate: purchaseItem.rate,
          lastPurchaseDate: purchaseData.date,
          createdAt: new Date().toISOString()
        };
      }
      
      dataStore.saveItem(item);
    });

    toast.success('Purchase saved successfully!');
    loadPurchases();
    setIsCreateDialogOpen(false);
    
    // Reset form
    setPurchaseData({
      date: new Date().toISOString().split('T')[0],
      supplierName: '',
      supplierGSTIN: '',
      billNo: '',
      items: [],
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      grandTotal: 0,
      isIGST: false
    });
  };

  const handleOCRUpload = async () => {
    if (!ocrImage) {
      toast.error('Please select an image');
      return;
    }

    setOcrProcessing(true);
    try {
      const extractedData = await processImageOCR(ocrImage);
      
      // Populate form with extracted data
      setPurchaseData(prev => ({
        ...prev,
        supplierName: extractedData.supplierName || prev.supplierName,
        supplierGSTIN: extractedData.supplierGSTIN || prev.supplierGSTIN,
        billNo: extractedData.billNo || prev.billNo,
        date: extractedData.date || prev.date,
        items: extractedData.items || prev.items,
        subtotal: extractedData.subtotal || prev.subtotal,
        cgst: extractedData.cgst || prev.cgst,
        sgst: extractedData.sgst || prev.sgst,
        igst: extractedData.igst || prev.igst,
        grandTotal: extractedData.grandTotal || prev.grandTotal,
        isIGST: extractedData.isIGST ?? prev.isIGST
      }));

      toast.success('OCR processing completed! Please review the extracted data.');
      setIsOCRDialogOpen(false);
    } catch (error) {
      toast.error('OCR processing failed. Please try again.');
      console.error('OCR Error:', error);
    } finally {
      setOcrProcessing(false);
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

  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0);
  const thisMonthPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthPurchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600">Manage supplier bills and inventory updates</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                OCR Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Bill for OCR Processing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ocr-file">Select Bill Image</Label>
                  <Input
                    id="ocr-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setOcrImage(e.target.files?.[0] || null)}
                  />
                </div>
                {ocrImage && (
                  <div>
                    <p className="text-sm text-gray-600">Selected: {ocrImage.name}</p>
                  </div>
                )}
                <Button 
                  onClick={handleOCRUpload} 
                  disabled={!ocrImage || ocrProcessing}
                  className="w-full"
                >
                  {ocrProcessing ? 'Processing...' : 'Process with OCR'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Purchase</DialogTitle>
              </DialogHeader>
              
              {/* Purchase Form */}
              <div className="space-y-6">
                {/* Supplier Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Supplier Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierName">Supplier Name *</Label>
                      <Input
                        id="supplierName"
                        value={purchaseData.supplierName}
                        onChange={(e) => setPurchaseData(prev => ({ ...prev, supplierName: e.target.value }))}
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierGSTIN">Supplier GSTIN</Label>
                      <Input
                        id="supplierGSTIN"
                        value={purchaseData.supplierGSTIN}
                        onChange={(e) => setPurchaseData(prev => ({ ...prev, supplierGSTIN: e.target.value }))}
                        placeholder="e.g., 07GBVPS2158R1ZC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billNo">Bill Number *</Label>
                      <Input
                        id="billNo"
                        value={purchaseData.billNo}
                        onChange={(e) => setPurchaseData(prev => ({ ...prev, billNo: e.target.value }))}
                        placeholder="Enter bill number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={purchaseData.date}
                        onChange={(e) => setPurchaseData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Add Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <Label>Description *</Label>
                        <Input
                          value={currentItem.description}
                          onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Item description"
                        />
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
                {purchaseData.items && purchaseData.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase Items ({purchaseData.items.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left">Description</th>
                              <th className="border border-gray-300 p-2 text-left">HSN</th>
                              <th className="border border-gray-300 p-2 text-right">Qty</th>
                              <th className="border border-gray-300 p-2 text-right">Rate</th>
                              <th className="border border-gray-300 p-2 text-right">Amount</th>
                              <th className="border border-gray-300 p-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseData.items.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-300 p-2">{item.description}</td>
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
                                    <Trash2 className="w-4 h-4" />
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

                {/* Totals and Save */}
                {purchaseData.items && purchaseData.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-w-md ml-auto">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{purchaseData.subtotal?.toLocaleString()}</span>
                        </div>
                        {!purchaseData.isIGST ? (
                          <>
                            <div className="flex justify-between">
                              <span>Add: CGST 9%</span>
                              <span>₹{purchaseData.cgst?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Add: SGST 9%</span>
                              <span>₹{purchaseData.sgst?.toLocaleString()}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span>Add: IGST 18%</span>
                            <span>₹{purchaseData.igst?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Grand Total:</span>
                          <span>₹{purchaseData.grandTotal?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6 space-x-3">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={savePurchase} className="bg-green-600 hover:bg-green-700">
                          Save Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalPurchases)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(thisMonthTotal)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-blue-600">{purchases.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by supplier name, bill number, or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases List */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchases ({filteredPurchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
              <p className="text-gray-600 mb-4">
                {purchases.length === 0 
                  ? "Get started by adding your first purchase"
                  : "No purchases match your search criteria"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bill No.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">GSTIN</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">GST Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-blue-600">{purchase.billNo}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(purchase.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{purchase.supplierName}</div>
                          <div className="text-sm text-gray-500">
                            {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-mono text-sm">
                        {purchase.supplierGSTIN || '-'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-red-600">
                          {formatCurrency(purchase.grandTotal)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={purchase.isIGST ? "destructive" : "default"}>
                          {purchase.isIGST ? 'IGST' : 'CGST+SGST'}
                        </Badge>
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

export default Purchases;
