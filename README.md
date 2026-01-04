# 🥗 ส้มตำ POS - ระบบขายหน้าร้าน

ระบบ POS (Point of Sale) สำหรับร้านส้มตำ ออกแบบมาเพื่อการจัดการคำสั่งซื้อ การประมวลผลการชำระเงิน และการควบคุมดูแลระบบอย่างสมบูรณ์

## ✨ คุณสมบัติหลัก

### 🍽️ การจัดการเมนู
- แสดงเมนูทั้งหมดพร้อมรูปภาพและราคา
- จัดหมวดหมู่เมนู (ส้มตำ, ลาบ/น้ำตก, ต้ม/แกง, ย่าง/ทอด, ข้าว, เครื่องดื่ม)
- เลือกระดับความเผ็ด (ไม่เผ็ด, เผ็ดน้อย, เผ็ดปานกลาง, เผ็ดมาก, เผ็ดสุดๆ)
- เพิ่มส่วนเพิ่ม (ปลาร้า, ปูไข่, กุ้งสด, ไข่เค็ม, ฯลฯ)
- แสดงเมนูยอดนิยม

### 🛒 การประมวลผลคำสั่งซื้อ
- ตะกร้าสินค้าพร้อมคำนวณราคาอัตโนมัติ
- เพิ่ม/ลด/ลบรายการในตะกร้า
- ระบุหมายเลขโต๊ะและชื่อลูกค้า
- บันทึกหมายเหตุพิเศษ

### 💳 การจัดการชำระเงิน
- รองรับหลายช่องทาง (เงินสด, พร้อมเพย์, บัตรเครดิต)
- คำนวณภาษีมูลค่าเพิ่ม (VAT 7%)
- คำนวณเงินทอนอัตโนมัติ
- ปุ่มลัดเงินสด (฿20, ฿50, ฿100, ฿500, ฿1000)

### 📊 แดชบอร์ดผู้ดูแลระบบ
- สรุปยอดขายรายวัน/รายสัปดาห์/รายเดือน
- กราฟแสดงยอดขาย
- เมนูขายดี
- สถิติออเดอร์

### 🧾 การสร้างใบเสร็จ
- ใบเสร็จรูปแบบมาตรฐาน
- แสดงรายละเอียดครบถ้วน
- รองรับการพิมพ์

### 👨‍🍳 หน้าจอครัว
- แสดงออเดอร์ที่รอดำเนินการ
- อัปเดตสถานะแบบเรียลไทม์
- แบ่งคอลัมน์ตามสถานะ (รอทำ, กำลังทำ, พร้อมเสิร์ฟ)

### ⚙️ การตั้งค่าระบบ
- ตั้งค่าข้อมูลร้านค้า
- กำหนดอัตราภาษี
- ปรับแต่งข้อความใบเสร็จ

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Router** - Routing
- **Lucide React** - Icons
- **Recharts** - Charts
- **Font Prompt** - Thai Font

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **Prisma** - ORM
- **SQLite** - Database

## 📁 โครงสร้างโปรเจกต์

```
somtum-pos/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.ts            # Seed data
│   │   └── dev.db             # SQLite database
│   ├── src/
│   │   ├── routes/
│   │   │   ├── menu.ts        # Menu API
│   │   │   ├── order.ts       # Order API
│   │   │   ├── payment.ts     # Payment API
│   │   │   ├── dashboard.ts   # Dashboard API
│   │   │   └── setting.ts     # Settings API
│   │   └── index.ts           # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── Cart.tsx       # Shopping cart
│   │   │   ├── MenuCard.tsx   # Menu item card
│   │   │   ├── OrderCard.tsx  # Order card
│   │   │   └── Layout.tsx     # App layout
│   │   ├── pages/
│   │   │   ├── Home.tsx       # Home page
│   │   │   ├── POS.tsx        # POS page
│   │   │   ├── Kitchen.tsx    # Kitchen display
│   │   │   ├── Orders.tsx     # Order management
│   │   │   ├── MenuManagement.tsx
│   │   │   ├── Dashboard.tsx  # Dashboard
│   │   │   └── Settings.tsx   # Settings
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   ├── store/
│   │   │   └── cart.tsx       # Cart context
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript types
│   │   ├── lib/
│   │   │   └── utils.ts       # Utility functions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md
```

## 🚀 การติดตั้งและใช้งาน

### ความต้องการของระบบ
- Node.js 18+
- npm หรือ pnpm

### ติดตั้ง Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Backend จะทำงานที่ `http://localhost:3001`

### ติดตั้ง Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend จะทำงานที่ `http://localhost:5173`

## 📱 หน้าจอต่างๆ

| หน้าจอ | URL | คำอธิบาย |
|--------|-----|----------|
| หน้าแรก | `/` | แดชบอร์ดภาพรวม |
| ขายหน้าร้าน | `/pos` | หน้า POS สำหรับรับออเดอร์ |
| ครัว | `/kitchen` | หน้าจอสำหรับครัว |
| ออเดอร์ | `/orders` | จัดการออเดอร์ทั้งหมด |
| จัดการเมนู | `/menu` | จัดการเมนูอาหาร |
| แดชบอร์ด | `/dashboard` | รายงานและสถิติ |
| ตั้งค่า | `/settings` | ตั้งค่าระบบ |

## 🎨 ดีไซน์

- สีหลัก: ส้ม (#FF6B35) - สื่อถึงความสดใส อร่อย
- สีรอง: เขียว (#4CAF50) - สื่อถึงความสดใหม่
- ฟอนต์: Prompt - ฟอนต์ไทยที่อ่านง่าย
- UI: ทันสมัย, Responsive, ใช้งานง่าย

## 📄 API Endpoints

### Menu
- `GET /api/menu/categories` - รายการหมวดหมู่
- `GET /api/menu/items` - รายการเมนู
- `GET /api/menu/addons` - รายการส่วนเพิ่ม

### Order
- `POST /api/orders` - สร้างออเดอร์ใหม่
- `GET /api/orders` - รายการออเดอร์
- `GET /api/orders/:id` - รายละเอียดออเดอร์
- `PATCH /api/orders/:id/status` - อัปเดตสถานะ

### Payment
- `POST /api/payments` - บันทึกการชำระเงิน

### Dashboard
- `GET /api/dashboard/stats` - สถิติรวม
- `GET /api/dashboard/sales` - ยอดขาย
- `GET /api/dashboard/active-orders` - ออเดอร์ที่กำลังดำเนินการ

### Settings
- `GET /api/settings` - ดึงการตั้งค่า
- `PUT /api/settings` - บันทึกการตั้งค่า

## 📝 License

MIT License

## 👨‍💻 พัฒนาโดย

Manus AI Agent

BUGpairoj
https://www.youtube.com/c/BUGpairoj

⛔️คำเตือน!!⛔️
มันสร้างจาก AI อย่าพึ่งไว้ใจมันมากนัก
เอาเป็นแนวทางในการพัฒนาตัวเอง ดันตัวเองให้เก่งขึ้นๆ ไปอีก
อันนี้ไม่แนะนำให้เอาไปใช้ Production จริงเด้อพี่น้อง

---

🥗 **ส้มตำ POS** - ระบบขายหน้าร้านสำหรับร้านส้มตำ ใช้งานง่าย ครบครัน ทันสมัย
