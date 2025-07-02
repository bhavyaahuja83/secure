
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Edit, Trash, Plus, Package } from 'lucide-react';
import { Item } from '../types';
import { toast } from 'sonner';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState<Partial<Item>>({
    description: '',
    unit: 'Nos.',
    hsn: '',
    rate: 0,
    category: '',
    stock: 0,
    minStock: 10
  });

  useEffect(() => {
    // Mock data - replace with API call
    setItems([
      {
        id: '1',
        description: 'AMPLIFIER AHUJA TZA-7000DP',
        unit: 'Nos.',
        hsn: '8543',
        rate: 39750,
        category: 'Audio Equipment',
        stock: 5,
        minStock: 10
      },
      {
        id: '2',
        description: 'SPEAKERS AHUJA SRX-250DXM',
        unit: 'Nos.',
        hsn: '8518',
        rate: 10000,
        category: 'Audio Equipment',
        stock: 15,
        minStock: 5
      }
    ]);
  }, []);

  const addItem = () => {
    if (!newItem.description || !newItem.rate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: Item = {
      id: Date.now().toString(),
      description: newItem.description!,
      unit: newItem.unit!,
      hsn: newItem.hsn!,
      rate: newItem.rate!,
      category: newItem.category!,
      stock: newItem.stock!,
      minStock: newItem.minStock!
    };

    setItems(prev => [...prev, item]);
    setNewItem({
      description: '',
      unit: 'Nos.',
      hsn: '',
      rate: 0,
      category: '',
      stock: 0,
      minStock: 10
    });
    setIsAddDialogOpen(false);
    toast.success('Item added successfully');
  };

  const updateItem = () => {
    if (!editingItem) return;

    setItems(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
    toast.success('Item updated successfully');
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item deleted successfully');
  };

  const lowStockItems = items.filter(item => item.stock <= item.minStock);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your stock and inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={newItem.unit}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nos.">Nos.</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Meter">Meter</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hsn">HSN/SAC</Label>
                  <Input
                    id="hsn"
                    value={newItem.hsn}
                    onChange={(e) => setNewItem(prev => ({ ...prev, hsn: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate">Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={newItem.rate}
                    onChange={(e) => setNewItem(prev => ({ ...prev, rate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <Button onClick={addItem} className="w-full">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-red-700">{item.description}</span>
                  <span className="text-red-600 font-medium">
                    Stock: {item.stock} (Min: {item.minStock})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Description</th>
                  <th className="border border-gray-300 p-3 text-left">Category</th>
                  <th className="border border-gray-300 p-3 text-left">Unit</th>
                  <th className="border border-gray-300 p-3 text-left">HSN</th>
                  <th className="border border-gray-300 p-3 text-right">Rate</th>
                  <th className="border border-gray-300 p-3 text-right">Stock</th>
                  <th className="border border-gray-300 p-3 text-right">Min Stock</th>
                  <th className="border border-gray-300 p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className={item.stock <= item.minStock ? 'bg-red-50' : ''}>
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3">{item.category}</td>
                    <td className="border border-gray-300 p-3">{item.unit}</td>
                    <td className="border border-gray-300 p-3">{item.hsn}</td>
                    <td className="border border-gray-300 p-3 text-right">₹{item.rate.toLocaleString()}</td>
                    <td className="border border-gray-300 p-3 text-right">
                      <span className={item.stock <= item.minStock ? 'text-red-600 font-semibold' : ''}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-right">{item.minStock}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className="flex space-x-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-stock">Current Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingItem.stock}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, stock: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rate">Rate</Label>
                  <Input
                    id="edit-rate"
                    type="number"
                    value={editingItem.rate}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, rate: Number(e.target.value) } : null)}
                  />
                </div>
              </div>
              <Button onClick={updateItem} className="w-full">
                Update Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
