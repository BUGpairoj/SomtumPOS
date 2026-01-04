import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getSpicyLabel(level: number): string {
  const labels = ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดปานกลาง', 'เผ็ด', 'เผ็ดมาก', 'เผ็ดสุดๆ']
  return labels[level] || labels[0]
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'รอดำเนินการ',
    preparing: 'กำลังทำ',
    ready: 'พร้อมเสิร์ฟ',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'เงินสด',
    promptpay: 'พร้อมเพย์',
    credit_card: 'บัตรเครดิต',
  }
  return labels[method] || method
}
