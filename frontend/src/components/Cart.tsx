import { useState } from 'react';
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, Banknote, QrCode, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getSpicyLabel } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { orderApi, paymentApi } from '@/services/api';

interface CartProps {
  onOrderComplete?: (orderId: number) => void;
}

export function Cart({ onOrderComplete }: CartProps) {
  const {
    state,
    removeItem,
    updateQuantity,
    setTableNumber,
    setCustomerName,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
  } = useCart();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'promptpay' | 'credit_card'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: number } | null>(null);

  const handleCreateOrder = async () => {
    if (state.items.length === 0) return;

    setIsProcessing(true);
    try {
      const orderData = {
        tableNumber: state.tableNumber || undefined,
        customerName: state.customerName || undefined,
        items: state.items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          spicyLevel: item.spicyLevel,
          notes: item.notes || undefined,
          addons: item.selectedAddons,
        })),
        notes: state.notes || undefined,
      };

      const order = await orderApi.createOrder(orderData);
      
      // Process payment
      const paymentData = {
        orderId: order.id,
        method: paymentMethod,
        receivedAmount: paymentMethod === 'cash' ? parseFloat(receivedAmount) : undefined,
      };

      await paymentApi.processPayment(paymentData);
      
      setOrderSuccess({ orderNumber: order.orderNumber, orderId: order.id });
      clearCart();
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    if (orderSuccess && onOrderComplete) {
      onOrderComplete(orderSuccess.orderId);
    }
    setOrderSuccess(null);
    setIsPaymentOpen(false);
    setReceivedAmount('');
  };

  const changeAmount = paymentMethod === 'cash' && receivedAmount
    ? parseFloat(receivedAmount) - getTotal()
    : 0;

  const quickAmounts = [100, 500, 1000];

  if (state.items.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            ตะกร้าสินค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>ยังไม่มีรายการในตะกร้า</p>
            <p className="text-sm">เลือกเมนูเพื่อเริ่มสั่งอาหาร</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ตะกร้าสินค้า
              <Badge variant="orange">{getItemCount()}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <Trash2 className="w-4 h-4 mr-1" />
              ล้าง
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          {/* Customer Info */}
          <div className="px-6 pb-4 space-y-3">
            <Input
              placeholder="หมายเลขโต๊ะ"
              value={state.tableNumber}
              onChange={e => setTableNumber(e.target.value)}
            />
            <Input
              placeholder="ชื่อลูกค้า (ไม่บังคับ)"
              value={state.customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>

          <Separator />

          {/* Cart Items */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-4">
              {state.items.map((item, index) => (
                <div key={index} className="flex gap-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.menuItem.category.icon || '🍽️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium truncate">{item.menuItem.name}</h4>
                        {item.spicyLevel > 0 && (
                          <span className="text-xs text-red-500">
                            🌶️ {getSpicyLabel(item.spicyLevel)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {item.selectedAddons.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        + {item.selectedAddons.map(addonId => {
                          const addon = item.menuItem.addons.find(a => a.addonId === addonId);
                          return addon?.addon.name;
                        }).filter(Boolean).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📝 {item.notes}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-somtum-orange">
                        {formatCurrency(
                          (item.menuItem.price + 
                            item.selectedAddons.reduce((sum, addonId) => {
                              const addon = item.menuItem.addons.find(a => a.addonId === addonId);
                              return sum + (addon?.addon.price || 0);
                            }, 0)
                          ) * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Summary */}
          <div className="p-6 space-y-3 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span>รวมย่อย</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT 7%</span>
              <span>{formatCurrency(getTax())}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>รวมทั้งหมด</span>
              <span className="text-somtum-orange">{formatCurrency(getTotal())}</span>
            </div>
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={() => setIsPaymentOpen(true)}
            >
              ชำระเงิน
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          {orderSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">สั่งอาหารสำเร็จ!</h2>
              <p className="text-muted-foreground mb-4">
                หมายเลขออเดอร์: <span className="font-bold text-somtum-orange">{orderSuccess.orderNumber}</span>
              </p>
              <Button size="lg" onClick={handleCloseSuccess}>
                ปิด
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">ชำระเงิน</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Payment Method */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">วิธีการชำระเงิน</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-somtum-orange bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Banknote className="w-8 h-8" />
                      <span className="text-sm font-medium">เงินสด</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'promptpay'
                          ? 'border-somtum-orange bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <QrCode className="w-8 h-8" />
                      <span className="text-sm font-medium">พร้อมเพย์</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'border-somtum-orange bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-8 h-8" />
                      <span className="text-sm font-medium">บัตรเครดิต</span>
                    </button>
                  </div>
                </div>

                {/* Cash Payment */}
                {paymentMethod === 'cash' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">รับเงิน</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={receivedAmount}
                      onChange={e => setReceivedAmount(e.target.value)}
                      className="text-2xl text-center h-14"
                    />
                    <div className="flex gap-2">
                      {quickAmounts.map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          className="flex-1"
                          onClick={() => setReceivedAmount(amount.toString())}
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setReceivedAmount(Math.ceil(getTotal()).toString())}
                      >
                        พอดี
                      </Button>
                    </div>
                    {changeAmount > 0 && (
                      <div className="p-4 rounded-xl bg-green-50 text-center">
                        <span className="text-sm text-green-600">เงินทอน</span>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(changeAmount)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PromptPay */}
                {paymentMethod === 'promptpay' && (
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      สแกน QR Code เพื่อชำระเงิน
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex justify-between text-lg font-bold">
                    <span>ยอดชำระ</span>
                    <span className="text-somtum-orange">{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  size="lg"
                  className="w-full text-lg"
                  onClick={handleCreateOrder}
                  disabled={
                    isProcessing ||
                    (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < getTotal()))
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    'ยืนยันการชำระเงิน'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
