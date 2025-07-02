import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Building, 
  Users, 
  Bell, 
  Shield, 
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'SECURE AUTOMATION & SAFETY SOLUTIONS',
    address: 'VILLAGE SUNEHTI, GOHANA ROAD\nSONIPAT, HARYANA - 131001',
    phone: '9354078266',
    email: 'info@secureautomation.com',
    gstin: '06BUIPA4572Q1Z7',
    pan: 'BUIPA4572Q',
    bankName: 'HDFC BANK',
    accountNumber: '1234567890',
    ifsc: 'HDFC0001234',
    branch: 'SONIPAT'
  });

  const [gstSettings, setGstSettings] = useState({
    defaultCGST: 9,
    defaultSGST: 9,
    defaultIGST: 18,
    autoCalculateGST: true,
    defaultHSN: '8518'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    paymentReminders: true,
    dailyReports: false,
    emailNotifications: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    autoLogout: true,
    requirePasswordChange: false
  });

  const handleSaveCompanyInfo = () => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    toast.success('Company information saved successfully!');
  };

  const handleSaveGSTSettings = () => {
    localStorage.setItem('gstSettings', JSON.stringify(gstSettings));
    toast.success('GST settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    toast.success('Notification settings saved successfully!');
  };

  const handleSaveSecurity = () => {
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    toast.success('Security settings saved successfully!');
  };

  const handleExportData = () => {
    const data = {
      bills: JSON.parse(localStorage.getItem('bills') || '[]'),
      purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
      clients: JSON.parse(localStorage.getItem('clients') || '[]'),
      items: JSON.parse(localStorage.getItem('items') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.bills) localStorage.setItem('bills', JSON.stringify(data.bills));
        if (data.purchases) localStorage.setItem('purchases', JSON.stringify(data.purchases));
        if (data.clients) localStorage.setItem('clients', JSON.stringify(data.clients));
        if (data.items) localStorage.setItem('items', JSON.stringify(data.items));
        
        toast.success('Data imported successfully!');
        window.location.reload();
      } catch (error) {
        toast.error('Invalid file format. Please select a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('bills');
      localStorage.removeItem('purchases');
      localStorage.removeItem('clients');
      localStorage.removeItem('items');
      toast.success('All data cleared successfully!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="gst" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            GST & Tax
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={companyInfo.gstin}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, gstin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={companyInfo.pan}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, pan: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={companyInfo.bankName}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={companyInfo.accountNumber}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={companyInfo.ifsc}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, ifsc: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={companyInfo.branch}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, branch: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompanyInfo} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Company Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GST & Tax Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cgst">Default CGST (%)</Label>
                  <Input
                    id="cgst"
                    type="number"
                    value={gstSettings.defaultCGST}
                    onChange={(e) => setGstSettings(prev => ({ ...prev, defaultCGST: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sgst">Default SGST (%)</Label>
                  <Input
                    id="sgst"
                    type="number"
                    value={gstSettings.defaultSGST}
                    onChange={(e) => setGstSettings(prev => ({ ...prev, defaultSGST: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="igst">Default IGST (%)</Label>
                  <Input
                    id="igst"
                    type="number"
                    value={gstSettings.defaultIGST}
                    onChange={(e) => setGstSettings(prev => ({ ...prev, defaultIGST: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultHSN">Default HSN Code</Label>
                <Input
                  id="defaultHSN"
                  value={gstSettings.defaultHSN}
                  onChange={(e) => setGstSettings(prev => ({ ...prev, defaultHSN: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoGST"
                  checked={gstSettings.autoCalculateGST}
                  onCheckedChange={(checked) => setGstSettings(prev => ({ ...prev, autoCalculateGST: checked }))}
                />
                <Label htmlFor="autoGST">Auto-calculate GST on bills</Label>
              </div>

              <Button onClick={handleSaveGSTSettings} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save GST Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStock">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
                  </div>
                  <Switch
                    id="lowStock"
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentReminders">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind about pending payments</p>
                  </div>
                  <Switch
                    id="paymentReminders"
                    checked={notificationSettings.paymentReminders}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dailyReports">Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive daily sales and inventory reports</p>
                  </div>
                  <Switch
                    id="dailyReports"
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, dailyReports: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoLogout">Auto Logout</Label>
                    <p className="text-sm text-muted-foreground">Automatically logout after inactivity</p>
                  </div>
                  <Switch
                    id="autoLogout"
                    checked={securitySettings.autoLogout}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, autoLogout: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="passwordChange">Require Password Change</Label>
                    <p className="text-sm text-muted-foreground">Force users to change passwords periodically</p>
                  </div>
                  <Switch
                    id="passwordChange"
                    checked={securitySettings.requirePasswordChange}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requirePasswordChange: checked }))}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Active Users</h4>
                </div>
                <p className="text-yellow-700 mt-1">5 users currently have access to the system</p>
                <div className="mt-2 space-y-1">
                  <Badge variant="outline">Pawan (Admin)</Badge>
                  <Badge variant="outline">Manish</Badge>
                  <Badge variant="outline">Bhavya</Badge>
                  <Badge variant="outline">Dev</Badge>
                  <Badge variant="outline">Santosh</Badge>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your business data as a backup file
                  </p>
                  <Button onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export All Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Restore data from a previously exported backup file
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-data"
                    />
                    <Button asChild variant="outline" className="flex items-center gap-2">
                      <Label htmlFor="import-data" className="cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Import Data
                      </Label>
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Danger Zone</h4>
                </div>
                <p className="text-red-700 mt-1">
                  This action will permanently delete all your data and cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllData}
                  className="mt-3 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;