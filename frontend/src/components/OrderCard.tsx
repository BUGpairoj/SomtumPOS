import { useState } from 'react';
import { Clock, ChefHat, CheckCircle, XCircle, Printer, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatTime, getStatusLabel, getStatusColor, getSpicyLabel, getPaymentMethodLabel } from '@/lib/utils';
import { orderApi, paymentApi } from '@/services/api';
import type { Order, Receipt } from '@/types';

interface OrderCardProps {
  order: Order;
  onStatusChange?: () => void;
  compact?: boolean;
}

export function OrderCard({ order, onStatusChange, compact = false }: OrderCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    preparing: <ChefHat className="w-4 h-4" />,
    ready: <CheckCircle className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await orderApi.updateStatus(order.id, newStatus);
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReceipt = async () => {
    try {
      const data = await paymentApi.getReceipt(order.id);
      setReceipt(data as any);
      setIsReceiptOpen(true);
    } catch (error) {
      console.error('Failed to fetch receipt:', error);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getNextStatus = () => {
    switch (order.status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  if (compact) {
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg ${
          order.status === 'ready' ? 'ring-2 ring-green-500 animate-pulse-glow' : ''
        }`}
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-lg">{order.orderNumber}</div>
              {order.tableNumber && (
                <div className="text-sm text-muted-foreground">โต๊ะ {order.tableNumber}</div>
              )}
            </div>
            <Badge className={getStatusColor(order.status)}>
              {statusIcons[order.status]}
              <span className="ml-1">{getStatusLabel(order.status)}</span>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {order.orderItems.length} รายการ • {formatTime(order.createdAt)}
          </div>
          <div className="font-bold text-somtum-orange">{formatCurrency(order.total)}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`transition-all ${
        order.status === 'ready' ? 'ring-2 ring-green-500' : ''
      }`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-xl">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground">
                {order.tableNumber ? `โต๊ะ ${order.tableNumber}` : 'ไม่ระบุโต๊ะ'}
                {order.customerName && ` • ${order.customerName}`}
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-sm py-1 px-3`}>
              {statusIcons[order.status]}
              <span className="ml-1">{getStatusLabel(order.status)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {order.orderItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.menuItem.name} x{item.quantity}
                  {item.spicyLevel > 0 && (
                    <span className="text-red-500 ml-1">🌶️</span>
                  )}
                </span>
                <span>{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
            {order.orderItems.length > 3 && (
              <div className="text-sm text-muted-foreground">
                +{order.orderItems.length - 3} รายการอื่นๆ
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">{formatTime(order.createdAt)}</span>
            <span className="font-bold text-lg text-somtum-orange">{formatCurrency(order.total)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(true)}>
              <Eye className="w-4 h-4 mr-1" />
              ดูรายละเอียด
            </Button>
            {order.paymentStatus === 'paid' && (
              <Button variant="outline" size="sm" onClick={handleViewReceipt}>
                <Printer className="w-4 h-4 mr-1" />
                ใบเสร็จ
              </Button>
            )}
            {nextStatus && order.status !== 'cancelled' && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleStatusChange(nextStatus)}
                disabled={isLoading}
              >
                {nextStatus === 'preparing' && 'เริ่มทำ'}
                {nextStatus === 'ready' && 'พร้อมเสิร์ฟ'}
                {nextStatus === 'completed' && 'เสร็จสิ้น'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              รายละเอียดออเดอร์ {order.orderNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge className={`${getStatusColor(order.status)} text-sm py-1 px-3`}>
                {statusIcons[order.status]}
                <span className="ml-1">{getStatusLabel(order.status)}</span>
              </Badge>
              <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {order.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">โต๊ะ:</span>
                <span className="ml-2 font-medium">{order.tableNumber || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ลูกค้า:</span>
                <span className="ml-2 font-medium">{order.customerName || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">เวลาสั่ง:</span>
                <span className="ml-2 font-medium">{formatTime(order.createdAt)}</span>
              </div>
              {order.payment && (
                <div>
                  <span className="text-muted-foreground">ชำระด้วย:</span>
                  <span className="ml-2 font-medium">{getPaymentMethodLabel(order.payment.method)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">รายการอาหาร</h4>
              {order.orderItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">
                      {item.menuItem.name} x{item.quantity}
                    </div>
                    {item.spicyLevel > 0 && (
                      <div className="text-xs text-red-500">
                        🌶️ {getSpicyLabel(item.spicyLevel)}
                      </div>
                    )}
                    {item.addons.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        + {item.addons.map(a => a.addon.name).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-muted-foreground">📝 {item.notes}</div>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>รวมย่อย</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT 7%</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>ส่วนลด</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-somtum-orange">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {nextStatus && order.status !== 'cancelled' && (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => {
                  handleStatusChange(nextStatus);
                  setIsDetailOpen(false);
                }}
                disabled={isLoading}
              >
                {nextStatus === 'preparing' && 'เริ่มทำอาหาร'}
                {nextStatus === 'ready' && 'อาหารพร้อมเสิร์ฟ'}
                {nextStatus === 'completed' && 'เสร็จสิ้น'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm">
          {receipt && (
            <div className="font-mono text-sm">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">{receipt.shopName}</h2>
                <p className="text-xs">{receipt.shopAddress}</p>
                <p className="text-xs">โทร: {receipt.shopPhone}</p>
              </div>

              <Separator className="my-3" />

              <div className="text-xs space-y-1 mb-3">
                <div>เลขที่: {receipt.orderNumber}</div>
                <div>วันที่: {new Date(receipt.date).toLocaleString('th-TH')}</div>
                {receipt.tableNumber && <div>โต๊ะ: {receipt.tableNumber}</div>}
                {receipt.customerName && <div>ลูกค้า: {receipt.customerName}</div>}
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                {receipt.items.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                    {item.addons.length > 0 && (
                      <div className="text-xs text-muted-foreground pl-2">
                        {item.addons.map(a => `+ ${a.name}`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>รวมย่อย</span>
                  <span>{formatCurrency(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT 7%</span>
                  <span>{formatCurrency(receipt.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>รวมทั้งหมด</span>
                  <span>{formatCurrency(receipt.total)}</span>
                </div>
              </div>

              {receipt.payment && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-xs">
                    <div>ชำระด้วย: {getPaymentMethodLabel(receipt.payment.method)}</div>
                    {receipt.payment.receivedAmount && (
                      <>
                        <div>รับเงิน: {formatCurrency(receipt.payment.receivedAmount)}</div>
                        <div>เงินทอน: {formatCurrency(receipt.payment.changeAmount || 0)}</div>
                      </>
                    )}
                  </div>
                </>
              )}

              <Separator className="my-3" />

              <p className="text-center text-xs">{receipt.footer}</p>

              <Button className="w-full mt-4" onClick={handlePrintReceipt}>
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์ใบเสร็จ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
