import { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrderCard } from '@/components/OrderCard';
import { orderApi } from '@/services/api';
import type { Order } from '@/types';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [selectedDate]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderApi.getOrders({ date: selectedDate });
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">จัดการออเดอร์</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="pl-10 w-40"
              />
            </div>
            <Button variant="outline" onClick={loadOrders} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ค้นหาออเดอร์..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">
              ทั้งหมด ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending">
              รอดำเนินการ ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              กำลังทำ ({statusCounts.preparing})
            </TabsTrigger>
            <TabsTrigger value="ready">
              พร้อมเสิร์ฟ ({statusCounts.ready})
            </TabsTrigger>
            <TabsTrigger value="completed">
              เสร็จสิ้น ({statusCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              ยกเลิก ({statusCounts.cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Grid */}
      <ScrollArea className="flex-1 p-4 lg:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">ไม่พบออเดอร์</p>
            <p className="text-sm">ลองเปลี่ยนตัวกรองหรือวันที่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusChange={loadOrders}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
