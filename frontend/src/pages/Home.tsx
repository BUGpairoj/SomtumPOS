import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ClipboardList, 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  ChefHat
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { dashboardApi } from '@/services/api';
import type { DashboardOverview, Order } from '@/types';

export function Home() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [overviewData, ordersData] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getActiveOrders(),
      ]);
      setOverview(overviewData);
      setActiveOrders(ordersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { to: '/pos', icon: ShoppingBag, label: 'ขายหน้าร้าน', color: 'from-orange-500 to-red-500' },
    { to: '/kitchen', icon: ChefHat, label: 'หน้าจอครัว', color: 'from-green-500 to-emerald-500' },
    { to: '/orders', icon: ClipboardList, label: 'จัดการออเดอร์', color: 'from-blue-500 to-indigo-500' },
    { to: '/dashboard', icon: BarChart3, label: 'ดูรายงาน', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          สวัสดี! 👋
        </h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับสู่ระบบ POS ร้านส้มตำแซ่บนัว
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map(action => (
          <Link key={action.to} to={action.to}>
            <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-xl overflow-hidden">
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <action.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg">{action.label}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ยอดขายวันนี้</span>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(overview.today.revenue)}</div>
              {parseFloat(overview.comparison.revenueChange) !== 0 && (
                <div className={`text-sm flex items-center gap-1 ${
                  parseFloat(overview.comparison.revenueChange) > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {overview.comparison.revenueChange}% จากเมื่อวาน
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ออเดอร์วันนี้</span>
                <ClipboardList className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{overview.today.orders}</div>
              <div className="text-sm text-muted-foreground">
                เฉลี่ย {formatCurrency(overview.today.avgOrderValue)}/ออเดอร์
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">รอดำเนินการ</span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{overview.today.pending + overview.today.preparing}</div>
              <div className="text-sm text-muted-foreground">
                {overview.today.pending} รอ, {overview.today.preparing} กำลังทำ
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">เสร็จสิ้น</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{overview.today.completed}</div>
              <div className="text-sm text-muted-foreground">
                {overview.today.ready} พร้อมเสิร์ฟ
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ออเดอร์ที่กำลังดำเนินการ</span>
            <Link to="/orders">
              <Button variant="outline" size="sm">ดูทั้งหมด</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>ไม่มีออเดอร์ที่กำลังดำเนินการ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.slice(0, 6).map(order => (
                <div
                  key={order.id}
                  className={`p-4 rounded-xl border-2 ${
                    order.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                    order.status === 'preparing' ? 'border-blue-200 bg-blue-50' :
                    'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{order.orderNumber}</div>
                      {order.tableNumber && (
                        <div className="text-sm text-muted-foreground">โต๊ะ {order.tableNumber}</div>
                      )}
                    </div>
                    <Badge className={
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {order.status === 'pending' && 'รอดำเนินการ'}
                      {order.status === 'preparing' && 'กำลังทำ'}
                      {order.status === 'ready' && 'พร้อมเสิร์ฟ'}
                    </Badge>
                  </div>
                  <div className="text-sm mb-2">
                    {order.orderItems.map(item => (
                      <span key={item.id} className="mr-2">
                        {item.menuItem.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="font-bold text-somtum-orange">
                    {formatCurrency(order.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
