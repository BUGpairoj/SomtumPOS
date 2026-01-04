import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // สร้างหมวดหมู่
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'ส้มตำ', icon: '🥗', sortOrder: 1 }
    }),
    prisma.category.create({
      data: { name: 'ลาบ/น้ำตก', icon: '🍖', sortOrder: 2 }
    }),
    prisma.category.create({
      data: { name: 'ต้ม/แกง', icon: '🍲', sortOrder: 3 }
    }),
    prisma.category.create({
      data: { name: 'ย่าง/ทอด', icon: '🍗', sortOrder: 4 }
    }),
    prisma.category.create({
      data: { name: 'ข้าว', icon: '🍚', sortOrder: 5 }
    }),
    prisma.category.create({
      data: { name: 'เครื่องดื่ม', icon: '🥤', sortOrder: 6 }
    }),
  ]);

  console.log('✅ Categories created');

  // สร้าง Add-ons
  const addons = await Promise.all([
    prisma.addon.create({ data: { name: 'ไข่เค็ม', price: 10 } }),
    prisma.addon.create({ data: { name: 'ปลาร้า', price: 5 } }),
    prisma.addon.create({ data: { name: 'กุ้งแห้ง', price: 15 } }),
    prisma.addon.create({ data: { name: 'ปูไข่', price: 20 } }),
    prisma.addon.create({ data: { name: 'หมูยอ', price: 10 } }),
    prisma.addon.create({ data: { name: 'ข้าวเหนียว', price: 10 } }),
    prisma.addon.create({ data: { name: 'ผักสด', price: 10 } }),
    prisma.addon.create({ data: { name: 'น้ำแข็ง', price: 5 } }),
  ]);

  console.log('✅ Addons created');

  // สร้างเมนูส้มตำ
  const somtumMenus = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ส้มตำไทย',
        description: 'ส้มตำรสชาติดั้งเดิม หวาน เปรี้ยว เค็ม เผ็ด ครบรส',
        price: 45,
        categoryId: categories[0].id,
        isPopular: true,
        spicyLevel: 2,
        image: '/images/somtum-thai.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ส้มตำปูปลาร้า',
        description: 'ส้มตำใส่ปูและปลาร้า รสจัดจ้าน',
        price: 55,
        categoryId: categories[0].id,
        isPopular: true,
        spicyLevel: 3,
        image: '/images/somtum-poo.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ส้มตำปูม้า',
        description: 'ส้มตำใส่ปูม้าสด เนื้อแน่น',
        price: 80,
        categoryId: categories[0].id,
        spicyLevel: 2,
        image: '/images/somtum-poo-ma.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ตำข้าวโพด',
        description: 'ส้มตำข้าวโพดหวาน รสอร่อย',
        price: 50,
        categoryId: categories[0].id,
        spicyLevel: 1,
        image: '/images/tam-kao-pod.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ตำแตง',
        description: 'ส้มตำแตงกรอบ สดชื่น',
        price: 45,
        categoryId: categories[0].id,
        spicyLevel: 2,
        image: '/images/tam-taeng.jpg'
      }
    }),
  ]);

  // สร้างเมนูลาบ/น้ำตก
  const laabMenus = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ลาบหมู',
        description: 'ลาบหมูสับละเอียด รสจัดจ้าน',
        price: 60,
        categoryId: categories[1].id,
        isPopular: true,
        spicyLevel: 2,
        image: '/images/laab-moo.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ลาบเป็ด',
        description: 'ลาบเป็ดเนื้อนุ่ม หอมสมุนไพร',
        price: 70,
        categoryId: categories[1].id,
        spicyLevel: 2,
        image: '/images/laab-ped.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำตกหมู',
        description: 'เนื้อหมูย่างหั่นชิ้น คลุกน้ำยำ',
        price: 65,
        categoryId: categories[1].id,
        isPopular: true,
        spicyLevel: 2,
        image: '/images/namtok-moo.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำตกเนื้อ',
        description: 'เนื้อวัวย่างหั่นชิ้น คลุกน้ำยำ',
        price: 80,
        categoryId: categories[1].id,
        spicyLevel: 2,
        image: '/images/namtok-neua.jpg'
      }
    }),
  ]);

  // สร้างเมนูต้ม/แกง
  const soupMenus = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ต้มแซ่บกระดูกหมู',
        description: 'ต้มกระดูกหมูรสแซ่บ น้ำซุปเข้มข้น',
        price: 70,
        categoryId: categories[2].id,
        isPopular: true,
        spicyLevel: 3,
        image: '/images/tom-saab.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ต้มยำกุ้ง',
        description: 'ต้มยำกุ้งน้ำใส รสเปรี้ยวเผ็ด',
        price: 90,
        categoryId: categories[2].id,
        spicyLevel: 3,
        image: '/images/tom-yum.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'แกงอ่อมหมู',
        description: 'แกงอ่อมหมูใส่ผักชีลาว หอมสมุนไพร',
        price: 65,
        categoryId: categories[2].id,
        spicyLevel: 2,
        image: '/images/gang-om.jpg'
      }
    }),
  ]);

  // สร้างเมนูย่าง/ทอด
  const grillMenus = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ไก่ย่าง',
        description: 'ไก่ย่างหมักสมุนไพร หนังกรอบ เนื้อนุ่ม',
        price: 120,
        categoryId: categories[3].id,
        isPopular: true,
        spicyLevel: 0,
        image: '/images/gai-yang.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'คอหมูย่าง',
        description: 'คอหมูย่างหมักซอสพิเศษ',
        price: 80,
        categoryId: categories[3].id,
        isPopular: true,
        spicyLevel: 0,
        image: '/images/kor-moo.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ปลาดุกย่าง',
        description: 'ปลาดุกย่างเกลือ เนื้อแน่น',
        price: 100,
        categoryId: categories[3].id,
        spicyLevel: 0,
        image: '/images/pla-duk.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ไส้กรอกอีสาน',
        description: 'ไส้กรอกหมักข้าวเหนียว รสเปรี้ยว',
        price: 50,
        categoryId: categories[3].id,
        spicyLevel: 0,
        image: '/images/sai-krok.jpg'
      }
    }),
  ]);

  // สร้างเมนูข้าว
  const riceMenus = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ข้าวเหนียว',
        description: 'ข้าวเหนียวนึ่งร้อนๆ',
        price: 10,
        categoryId: categories[4].id,
        spicyLevel: 0,
        image: '/images/sticky-rice.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ข้าวสวย',
        description: 'ข้าวสวยหอมมะลิ',
        price: 10,
        categoryId: categories[4].id,
        spicyLevel: 0,
        image: '/images/rice.jpg'
      }
    }),
  ]);

  // สร้างเมนูเครื่องดื่ม
  const drinkMenus = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'น้ำมะนาว',
        description: 'น้ำมะนาวสดคั้น เย็นชื่นใจ',
        price: 25,
        categoryId: categories[5].id,
        spicyLevel: 0,
        image: '/images/lemon.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำอัญชัน',
        description: 'น้ำอัญชันมะนาว สีสวย สดชื่น',
        price: 30,
        categoryId: categories[5].id,
        spicyLevel: 0,
        image: '/images/butterfly-pea.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'ชาเย็น',
        description: 'ชาไทยเย็น หวานมัน',
        price: 30,
        categoryId: categories[5].id,
        spicyLevel: 0,
        image: '/images/thai-tea.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำเปล่า',
        description: 'น้ำดื่มสะอาด',
        price: 10,
        categoryId: categories[5].id,
        spicyLevel: 0,
        image: '/images/water.jpg'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'โค้ก',
        description: 'น้ำอัดลม',
        price: 20,
        categoryId: categories[5].id,
        spicyLevel: 0,
        image: '/images/coke.jpg'
      }
    }),
  ]);

  console.log('✅ Menu items created');

  // เชื่อม Add-ons กับเมนูส้มตำ
  for (const menu of somtumMenus) {
    await prisma.menuItemAddon.createMany({
      data: [
        { menuItemId: menu.id, addonId: addons[0].id }, // ไข่เค็ม
        { menuItemId: menu.id, addonId: addons[1].id }, // ปลาร้า
        { menuItemId: menu.id, addonId: addons[2].id }, // กุ้งแห้ง
        { menuItemId: menu.id, addonId: addons[3].id }, // ปูไข่
      ]
    });
  }

  // เชื่อม Add-ons กับเมนูลาบ
  for (const menu of laabMenus) {
    await prisma.menuItemAddon.createMany({
      data: [
        { menuItemId: menu.id, addonId: addons[5].id }, // ข้าวเหนียว
        { menuItemId: menu.id, addonId: addons[6].id }, // ผักสด
      ]
    });
  }

  console.log('✅ Menu-Addon relations created');

  // สร้างการตั้งค่าเริ่มต้น
  await prisma.setting.createMany({
    data: [
      { key: 'shop_name', value: 'ร้านส้มตำแซ่บนัว' },
      { key: 'shop_address', value: '123 ถนนอาหารอร่อย กรุงเทพฯ 10110' },
      { key: 'shop_phone', value: '02-123-4567' },
      { key: 'tax_rate', value: '7' },
      { key: 'currency', value: 'THB' },
      { key: 'receipt_footer', value: 'ขอบคุณที่มาอุดหนุนครับ/ค่ะ' },
    ]
  });

  console.log('✅ Settings created');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
