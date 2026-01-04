import { useEffect, useState } from 'react';
import { Save, Store, Receipt, Percent, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { settingsApi } from '@/services/api';
import type { Settings as SettingsType } from '@/types';

export function Settings() {
  const [settings, setSettings] = useState<SettingsType>({
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    tax_rate: '7',
    currency: 'THB',
    receipt_footer: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getAll();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await settingsApi.updateAll(settings as any);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-somtum-orange" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              บันทึกการตั้งค่า
            </>
          )}
        </Button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">
          ✓ บันทึกการตั้งค่าเรียบร้อยแล้ว
        </div>
      )}

      <div className="space-y-6">
        {/* Shop Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              ข้อมูลร้านค้า
            </CardTitle>
            <CardDescription>
              ข้อมูลพื้นฐานของร้านที่จะแสดงในใบเสร็จ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อร้าน</label>
              <Input
                value={settings.shop_name}
                onChange={e => setSettings({ ...settings, shop_name: e.target.value })}
                placeholder="ร้านส้มตำแซ่บนัว"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ที่อยู่</label>
              <Input
                value={settings.shop_address}
                onChange={e => setSettings({ ...settings, shop_address: e.target.value })}
                placeholder="123 ถนนอาหารอร่อย กรุงเทพฯ 10110"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
              <Input
                value={settings.shop_phone}
                onChange={e => setSettings({ ...settings, shop_phone: e.target.value })}
                placeholder="02-123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              การตั้งค่าภาษี
            </CardTitle>
            <CardDescription>
              กำหนดอัตราภาษีมูลค่าเพิ่ม (VAT)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">อัตราภาษี (%)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.tax_rate}
                  onChange={e => setSettings({ ...settings, tax_rate: e.target.value })}
                  className="w-32"
                  min="0"
                  max="100"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                อัตราภาษีมูลค่าเพิ่มมาตรฐานของประเทศไทยคือ 7%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              การตั้งค่าใบเสร็จ
            </CardTitle>
            <CardDescription>
              ปรับแต่งข้อความที่แสดงในใบเสร็จ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ข้อความท้ายใบเสร็จ</label>
              <Input
                value={settings.receipt_footer}
                onChange={e => setSettings({ ...settings, receipt_footer: e.target.value })}
                placeholder="ขอบคุณที่มาอุดหนุนครับ/ค่ะ"
              />
              <p className="text-sm text-muted-foreground">
                ข้อความนี้จะแสดงที่ด้านล่างของใบเสร็จทุกใบ
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>ตัวอย่างใบเสร็จ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs mx-auto p-6 border-2 border-dashed rounded-xl font-mono text-sm">
              <div className="text-center mb-4">
                <div className="font-bold text-lg">{settings.shop_name || 'ชื่อร้าน'}</div>
                <div className="text-xs text-muted-foreground">{settings.shop_address || 'ที่อยู่ร้าน'}</div>
                <div className="text-xs text-muted-foreground">โทร: {settings.shop_phone || '-'}</div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>ส้มตำไทย x1</span>
                  <span>฿45</span>
                </div>
                <div className="flex justify-between">
                  <span>ไก่ย่าง x1</span>
                  <span>฿120</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>รวมย่อย</span>
                  <span>฿165</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT {settings.tax_rate}%</span>
                  <span>฿{(165 * parseFloat(settings.tax_rate || '7') / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>รวมทั้งหมด</span>
                  <span>฿{(165 + 165 * parseFloat(settings.tax_rate || '7') / 100).toFixed(0)}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="text-center text-xs text-muted-foreground">
                {settings.receipt_footer || 'ข้อความท้ายใบเสร็จ'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
