import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { dashboardApi } from '@/services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { 
  DashboardOverview, 
  TopItem, 
  CategoryBreakdown, 
  PaymentBreakdown,
  DailySales,
  HourlySales 
} from '@/types';

const COLORS = ['#FF6B35', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#E91E63'];

export function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const days = parseInt(period);
      const [
        overviewData,
        topItemsData,
        categoryData,
        paymentData,
        dailyData,
        hourlyData,
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getTopItems(10, days),
        dashboardApi.getCategoryBreakdown(days),
        dashboardApi.getPaymentBreakdown(days),
        dashboardApi.getSalesByDay(days),
        dashboardApi.getSalesByHour(),
      ]);

      setOverview(overviewData);
      setTopItems(topItemsData as any);
      setCategoryBreakdown(categoryData);
      setPaymentBreakdown(paymentData);
      setDailySales(dailyData);
      setHourlySales(hourlyData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentPieData = paymentBreakdown ? [
    { name: 'เงินสด', value: paymentBreakdown.cash.amount, count: paymentBreakdown.cash.count },
    { name: 'พร้อมเพย์', value: paymentBreakdown.promptpay.amount, count: paymentBreakdown.promptpay.count },
    { name: 'บัตรเครดิต', value: paymentBreakdown.credit_card.amount, count: paymentBreakdown.credit_card.count },
  ].filter(d => d.value > 0) : [];

  const categoryPieData = categoryBreakdown.map(cat => ({
    name: cat.name,
    value: cat.revenue,
    quantity: cat.quantity,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="7">7 วัน</TabsTrigger>
            <TabsTrigger value="30">30 วัน</TabsTrigger>
            <TabsTrigger value="90">90 วัน</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ยอดขายวันนี้</span>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold">{formatCurrency(overview.today.revenue)}</div>
              {parseFloat(overview.comparison.revenueChange) !== 0 && (
                <div className={`text-sm flex items-center gap-1 mt-1 ${
                  parseFloat(overview.comparison.revenueChange) > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {parseFloat(overview.comparison.revenueChange) > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(parseFloat(overview.comparison.revenueChange))}% จากเมื่อวาน
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ออเดอร์วันนี้</span>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold">{overview.today.orders}</div>
              {parseFloat(overview.comparison.ordersChange) !== 0 && (
                <div className={`text-sm flex items-center gap-1 mt-1 ${
                  parseFloat(overview.comparison.ordersChange) > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {parseFloat(overview.comparison.ordersChange) > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(parseFloat(overview.comparison.ordersChange))}% จากเมื่อวาน
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ค่าเฉลี่ย/ออเดอร์</span>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold">{formatCurrency(overview.today.avgOrderValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">รอดำเนินการ</span>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-3xl font-bold">{overview.today.pending + overview.today.preparing}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {overview.today.ready} พร้อมเสิร์ฟ
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              ยอดขายรายวัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                />
                <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'ยอดขาย']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                />
                <Bar dataKey="revenue" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ยอดขายรายชั่วโมง (วันนี้)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlySales.filter(h => h.hour >= 8 && h.hour <= 22)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'ยอดขาย' : 'ออเดอร์'
                  ]}
                  labelFormatter={(label) => `${label}:00 น.`}
                />
                <Line type="monotone" dataKey="orders" stroke="#4CAF50" strokeWidth={2} dot={{ fill: '#4CAF50' }} />
                <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>เมนูขายดี</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.quantity} ชิ้น</div>
                    <div className="text-sm text-somtum-orange">{formatCurrency(item.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              วิธีชำระเงิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                ไม่มีข้อมูล
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>ยอดขายตามหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryBreakdown.map((cat, index) => (
              <div key={cat.id} className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="text-3xl mb-2">{cat.icon || '📁'}</div>
                <div className="font-medium">{cat.name}</div>
                <div className="text-lg font-bold text-somtum-orange">
                  {formatCurrency(cat.revenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cat.quantity} ชิ้น
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
