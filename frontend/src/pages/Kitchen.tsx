import { useEffect, useState } from 'react';
import { RefreshCw, Clock, ChefHat, CheckCircle, Bell, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTime, getSpicyLabel } from '@/lib/utils';
import { dashboardApi, orderApi } from '@/services/api';
import type { Order } from '@/types';

export function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await dashboardApi.getActiveOrders();
      setOrders(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      loadOrders();
      
      // Play sound for ready orders
      if (newStatus === 'ready') {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const OrderCard = ({ order, showActions = true }: { order: Order; showActions?: boolean }) => (
    <Card className={`transition-all ${
      order.status === 'ready' ? 'ring-2 ring-green-500 animate-pulse' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{order.orderNumber}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {order.tableNumber ? `โต๊ะ ${order.tableNumber}` : 'ไม่ระบุโต๊ะ'}
              <span className="mx-2">•</span>
              {formatTime(order.createdAt)}
            </div>
          </div>
          <Badge className={
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }>
            {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
            {order.status === 'preparing' && <ChefHat className="w-3 h-3 mr-1" />}
            {order.status === 'ready' && <CheckCircle className="w-3 h-3 mr-1" />}
            {order.status === 'pending' && 'รอทำ'}
            {order.status === 'preparing' && 'กำลังทำ'}
            {order.status === 'ready' && 'พร้อมเสิร์ฟ'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {order.orderItems.map(item => (
            <div key={item.id} className="p-3 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-2xl">{item.menuItem.category.icon}</span>
                    {item.menuItem.name}
                    <Badge variant="outline" className="ml-2">x{item.quantity}</Badge>
                  </div>
                  {item.spicyLevel > 0 && (
                    <div className="text-sm text-red-500 mt-1">
                      🌶️ {getSpicyLabel(item.spicyLevel)}
                    </div>
                  )}
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      + {item.addons.map(a => a.addon.name).join(', ')}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-sm text-orange-600 mt-1 font-medium">
                      📝 {item.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showActions && (
          <div className="mt-4 flex gap-2">
            {order.status === 'pending' && (
              <Button 
                className="flex-1" 
                onClick={() => handleStatusChange(order.id, 'preparing')}
              >
                <ChefHat className="w-4 h-4 mr-2" />
                เริ่มทำ
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button 
                className="flex-1" 
                variant="success"
                onClick={() => handleStatusChange(order.id, 'ready')}
              >
                <Bell className="w-4 h-4 mr-2" />
                พร้อมเสิร์ฟ
              </Button>
            )}
            {order.status === 'ready' && (
              <Button 
                className="flex-1" 
                variant="secondary"
                onClick={() => handleStatusChange(order.id, 'completed')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                เสร็จสิ้น
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-somtum-orange" />
            หน้าจอครัว
          </h1>
          <div className="text-sm text-muted-foreground">
            อัปเดตล่าสุด: {formatTime(lastUpdate)}
          </div>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Order Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <h2 className="font-bold text-lg">รอทำ</h2>
            <Badge variant="warning">{pendingOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {pendingOrders.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีออเดอร์รอทำ</p>
              </Card>
            )}
          </div>
        </div>

        {/* Preparing */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h2 className="font-bold text-lg">กำลังทำ</h2>
            <Badge variant="info">{preparingOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {preparingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {preparingOrders.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีออเดอร์กำลังทำ</p>
              </Card>
            )}
          </div>
        </div>

        {/* Ready */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h2 className="font-bold text-lg">พร้อมเสิร์ฟ</h2>
            <Badge variant="success">{readyOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {readyOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {readyOrders.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีออเดอร์พร้อมเสิร์ฟ</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
