
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Users, 
  ShoppingCart,
  IndianRupee,
  Calendar,
  Building2,
  Package,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dataStore } from '../utils/dataStore';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeFrame, setTimeFrame] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, [timeFrame, customDateRange]);

  const loadStats = () => {
    const dashboardStats = dataStore.getDashboardStats();
    
    // Filter data based on selected time frame
    let filteredStats = { ...dashboardStats };
    
    if (timeFrame === 'custom' && customDateRange) {
      // Apply custom date range filtering
      const startDate = customDateRange.from;
      const endDate = customDateRange.to;
      
      filteredStats.dailySalesData = dashboardStats.dailySalesData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= startDate && dayDate <= endDate;
      });
    } else {
      // Apply predefined time frame filtering
      const days = timeFrame === '7days' ? 7 : timeFrame === '30days' ? 30 : 90;
      filteredStats.dailySalesData = dashboardStats.dailySalesData.slice(-days);
    }
    
    setStats(filteredStats);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!stats) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Business analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {timeFrame === 'custom' && (
            <DatePickerWithRange 
              onDateChange={setCustomDateRange}
              className="w-60"
            />
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalSales)}</p>
                <p className="text-sm text-gray-500 mt-1">All time revenue</p>
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
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalPurchases)}</p>
                <p className="text-sm text-gray-500 mt-1">All time expenses</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
                <p className="text-sm text-gray-500 mt-1">Active customers</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalBills}</p>
                <p className="text-sm text-gray-500 mt-1">Generated invoices</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daily Sales Trend</CardTitle>
            <div className="text-sm text-gray-500">
              {timeFrame === 'custom' && customDateRange 
                ? `${customDateRange.from?.toLocaleDateString()} - ${customDateRange.to?.toLocaleDateString()}`
                : `Last ${timeFrame.replace('days', '')} days`
              }
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'Sales']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GST Output</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalGSTOutput)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GST Input</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalGSTInput)}</p>
              </div>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-600">{stats.pendingReports}</p>
              </div>
              <Package className="w-5 h-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
