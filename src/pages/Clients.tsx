
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye, Trash } from 'lucide-react';
import { Client, Bill } from '../types';
import { dataStore } from '../utils/dataStore';
import { toast } from 'sonner';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clientBills, setClientBills] = useState<Bill[]>([]);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    gstin: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    siteAddress: ''
  });

  useEffect(() => {
    refreshClients();
  }, []);

  useEffect(() => {
    let filtered = clients;
    if (searchTerm) {
      filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const refreshClients = () => {
    const allClients = dataStore.getClients().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setClients(allClients);
    setFilteredClients(allClients);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gstin: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
      siteAddress: ''
    });
    setIsEditMode(false);
  };

  const handleCreateClient = () => {
    if (!formData.name || !formData.gstin || !formData.address) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const newClient: Client = {
        id: Date.now().toString(),
        name: formData.name!,
        gstin: formData.gstin!,
        address: formData.address!,
        phone: formData.phone || '',
        email: formData.email || '',
        contactPerson: formData.contactPerson || '',
        siteAddress: formData.siteAddress || '',
        createdAt: new Date().toISOString(),
        totalBilled: 0
      };

      dataStore.saveClient(newClient);
      toast.success('Client created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refreshClients();
    } catch (error) {
      toast.error('Failed to create client');
      console.error('Client creation error:', error);
    }
  };

  const handleEditClient = () => {
    if (!selectedClient || !formData.name || !formData.gstin || !formData.address) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const updatedClient: Client = {
        ...selectedClient,
        name: formData.name!,
        gstin: formData.gstin!,
        address: formData.address!,
        phone: formData.phone || '',
        email: formData.email || '',
        contactPerson: formData.contactPerson || '',
        siteAddress: formData.siteAddress || ''
      };

      dataStore.saveClient(updatedClient);
      toast.success('Client updated successfully');
      setSelectedClient(null);
      resetForm();
      refreshClients();
    } catch (error) {
      toast.error('Failed to update client');
      console.error('Client update error:', error);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    const bills = dataStore.getBills().filter(bill => bill.clientId === client.id);
    setClientBills(bills);
  };

  const handleEditMode = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      gstin: client.gstin,
      address: client.address,
      phone: client.phone || '',
      email: client.email || '',
      contactPerson: client.contactPerson || '',
      siteAddress: client.siteAddress || ''
    });
    setIsEditMode(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
          <p className="text-gray-600">Manage your client database</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN *</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="Enter GSTIN"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <Label htmlFor="siteAddress">Site Address</Label>
                <Textarea
                  id="siteAddress"
                  value={formData.siteAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
                  placeholder="Enter site address (if different)"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClient}>
                  Create Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, GSTIN, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-sm text-gray-600">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ₹{clients.reduce((sum, client) => sum + (client.totalBilled || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {clients.filter(client => client.lastBillDate === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-sm text-gray-600">Billed Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left">Client Name</th>
                  <th className="border border-gray-200 p-3 text-left">GSTIN</th>
                  <th className="border border-gray-200 p-3 text-left">Contact</th>
                  <th className="border border-gray-200 p-3 text-right">Total Billed</th>
                  <th className="border border-gray-200 p-3 text-left">Last Bill</th>
                  <th className="border border-gray-200 p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3">
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {client.contactPerson && (
                            <div className="text-sm text-gray-500">Contact: {client.contactPerson}</div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-200 p-3 font-mono text-sm">{client.gstin}</td>
                      <td className="border border-gray-200 p-3">
                        <div className="text-sm">
                          {client.phone && <div>{client.phone}</div>}
                          {client.email && <div className="text-gray-500">{client.email}</div>}
                        </div>
                      </td>
                      <td className="border border-gray-200 p-3 text-right font-medium">
                        ₹{(client.totalBilled || 0).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {client.lastBillDate ? (
                          <Badge variant="secondary">
                            {new Date(client.lastBillDate).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No bills</Badge>
                        )}
                      </td>
                      <td className="border border-gray-200 p-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMode(client)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="border border-gray-200 p-8 text-center text-gray-500">
                      No clients found. Add your first client to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      {selectedClient && !isEditMode && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Client Details - {selectedClient.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedClient.name}</p>
                    <p><span className="font-medium">GSTIN:</span> {selectedClient.gstin}</p>
                    <p><span className="font-medium">Address:</span> {selectedClient.address}</p>
                    {selectedClient.siteAddress && (
                      <p><span className="font-medium">Site Address:</span> {selectedClient.siteAddress}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    {selectedClient.phone && <p><span className="font-medium">Phone:</span> {selectedClient.phone}</p>}
                    {selectedClient.email && <p><span className="font-medium">Email:</span> {selectedClient.email}</p>}
                    {selectedClient.contactPerson && <p><span className="font-medium">Contact Person:</span> {selectedClient.contactPerson}</p>}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Billing History</h4>
                {clientBills.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-2 text-left">Bill No</th>
                          <th className="border border-gray-200 p-2 text-left">Date</th>
                          <th className="border border-gray-200 p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientBills.map((bill) => (
                          <tr key={bill.id}>
                            <td className="border border-gray-200 p-2">{bill.billNo}</td>
                            <td className="border border-gray-200 p-2">{new Date(bill.date).toLocaleDateString()}</td>
                            <td className="border border-gray-200 p-2 text-right">₹{bill.grandTotal.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No bills found for this client.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Client Dialog */}
      {selectedClient && isEditMode && (
        <Dialog open={isEditMode} onOpenChange={() => {
          setIsEditMode(false);
          setSelectedClient(null);
          resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Client - {selectedClient.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Client Name *</Label>
                  <Input
                    id="editName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="editGstin">GSTIN *</Label>
                  <Input
                    id="editGstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="Enter GSTIN"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editAddress">Address *</Label>
                <Textarea
                  id="editAddress"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editContactPerson">Contact Person</Label>
                <Input
                  id="editContactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <Label htmlFor="editSiteAddress">Site Address</Label>
                <Textarea
                  id="editSiteAddress"
                  value={formData.siteAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
                  placeholder="Enter site address (if different)"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditMode(false);
                  setSelectedClient(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleEditClient}>
                  Update Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Clients;
