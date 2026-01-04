import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  UtensilsCrossed,
  ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'หน้าแรก' },
  { to: '/pos', icon: ShoppingBag, label: 'ขายหน้าร้าน' },
  { to: '/kitchen', icon: ChefHat, label: 'ครัว' },
  { to: '/orders', icon: ClipboardList, label: 'ออเดอร์' },
  { to: '/menu', icon: UtensilsCrossed, label: 'จัดการเมนู' },
  { to: '/dashboard', icon: BarChart3, label: 'แดชบอร์ด' },
  { to: '/settings', icon: Settings, label: 'ตั้งค่า' },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white shadow-xl z-50 flex flex-col">
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-somtum-orange to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg">
              🥗
            </div>
            <div className="hidden lg:block">
              <h1 className="font-bold text-xl text-gradient">ส้มตำ POS</h1>
              <p className="text-xs text-muted-foreground">ระบบขายหน้าร้าน</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                  'hover:bg-orange-50 hover:text-somtum-orange',
                  isActive
                    ? 'bg-gradient-to-r from-somtum-orange to-orange-500 text-white shadow-lg'
                    : 'text-gray-600'
                )
              }
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t hidden lg:block">
          <div className="text-xs text-muted-foreground text-center">
            <p>Somtum POS v1.0</p>
            <p>© 2024 แซ่บนัว</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 lg:ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
