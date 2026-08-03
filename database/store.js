const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db_data.json');

// Initial seed data with ZERO prices!
const initialData = {
  users: [
    {
      id: "usr_admin",
      name: "Admin User",
      email: "admin@quotation.com",
      mobile: "+1234567890",
      passwordHash: "$2a$10$wN1iN61K4aF3z44/m.z7yeT2n3TzD5Lg20uV4N4W2n2v0Qz.e7D1e", // "admin123"
      role: "admin",
      companyName: "Quotation App Admin Corp",
      companyAddress: "100 Tech Park, Silicon Valley",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_demo",
      name: "John Customer",
      email: "john@example.com",
      mobile: "+1987654321",
      passwordHash: "$2a$10$wN1iN61K4aF3z44/m.z7yeT2n3TzD5Lg20uV4N4W2n2v0Qz.e7D1e", // "admin123"
      role: "customer",
      companyName: "Apex Logistics Ltd",
      companyAddress: "45 Industrial Zone, Sector 4",
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: "cat_1",
      name: "Industrial Safety",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80",
      description: "Personal protective equipment and workplace safety gear."
    },
    {
      id: "cat_2",
      name: "Office Electronics",
      image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
      description: "Premium hardware, monitors, and networking equipment."
    },
    {
      id: "cat_3",
      name: "Heavy Machinery Parts",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
      description: "Hydraulic valves, pumps, bearings, and structural spares."
    },
    {
      id: "cat_4",
      name: "Packaging Materials",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80",
      description: "Corrugated boxes, bubble wraps, pallets, and shipping straps."
    }
  ],
  products: [
    {
      id: "prod_1",
      name: "Pro-Grade Heavy Duty Safety Helmet",
      categoryId: "cat_1",
      categoryName: "Industrial Safety",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80",
      description: "Impact-resistant ABS shell with 6-point textile suspension for maximum comfort."
    },
    {
      id: "prod_2",
      name: "High-Visibility Reflective Vest (Class 3)",
      categoryId: "cat_1",
      categoryName: "Industrial Safety",
      image: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&q=80",
      description: "Breathable polyester fabric with 2-inch reflective stripes for high visibility."
    },
    {
      id: "prod_3",
      name: "Ergonomic Mesh Task Chair",
      categoryId: "cat_2",
      categoryName: "Office Electronics",
      image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&q=80",
      description: "Adjustable lumbar support, breathable mesh back, and 3D armrests."
    },
    {
      id: "prod_4",
      name: "Dual-Band Enterprise Wi-Fi 6 Router",
      categoryId: "cat_2",
      categoryName: "Office Electronics",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80",
      description: "High-density multi-gigabit throughput with advanced firewall & mesh support."
    },
    {
      id: "prod_5",
      name: "Precision Hydraulic Pressure Control Valve",
      categoryId: "cat_3",
      categoryName: "Heavy Machinery Parts",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80",
      description: "Forged alloy steel body rated for high pressure fluid distribution systems."
    },
    {
      id: "prod_6",
      name: "Heavy-Duty Ceramic Ball Bearings (Set of 10)",
      categoryId: "cat_3",
      categoryName: "Heavy Machinery Parts",
      image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&q=80",
      description: "Low-friction silicon nitride ceramic balls with heat-treated steel races."
    },
    {
      id: "prod_7",
      name: "Triple-Wall Heavy Duty Corrugated Boxes",
      categoryId: "cat_4",
      categoryName: "Packaging Materials",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80",
      description: "Burst-resistant multi-layer cardboard built for international freight shipping."
    },
    {
      id: "prod_8",
      name: "Biodegradable Cushioning Air Pillows (Roll)",
      categoryId: "cat_4",
      categoryName: "Packaging Materials",
      image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&q=80",
      description: "Eco-friendly protective packaging film for fragile product transit."
    }
  ],
  favorites: {
    "usr_demo": ["prod_1", "prod_3"]
  },
  carts: {
    "usr_demo": [
      { productId: "prod_1", quantity: 50 },
      { productId: "prod_4", quantity: 10 }
    ]
  },
  orders: [
    {
      id: "ord_1001",
      orderNo: "QT-2026-1001",
      userId: "usr_demo",
      userName: "John Customer",
      userEmail: "john@example.com",
      userMobile: "+1987654321",
      companyName: "Apex Logistics Ltd",
      companyAddress: "45 Industrial Zone, Sector 4",
      items: [
        {
          productId: "prod_1",
          productName: "Pro-Grade Heavy Duty Safety Helmet",
          quantity: 100,
          image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80"
        },
        {
          productId: "prod_2",
          productName: "High-Visibility Reflective Vest (Class 3)",
          quantity: 200,
          image: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&q=80"
        }
      ],
      status: "Pending", // Pending, Dispatched, Cancelled
      notes: "Urgent dispatch requested for site opening next week.",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "ord_1002",
      orderNo: "QT-2026-1002",
      userId: "usr_demo",
      userName: "John Customer",
      userEmail: "john@example.com",
      userMobile: "+1987654321",
      companyName: "Apex Logistics Ltd",
      companyAddress: "45 Industrial Zone, Sector 4",
      items: [
        {
          productId: "prod_5",
          productName: "Precision Hydraulic Pressure Control Valve",
          quantity: 15,
          image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80"
        }
      ],
      status: "Dispatched",
      notes: "Dispatched via Express Cargo Truck #TRK-882",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif_1",
      title: "New Category Added",
      message: "Check out our newly added Industrial Safety catalog!",
      targetUser: "all",
      createdAt: new Date().toISOString()
    }
  ]
};

function readData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("DB read error, using initial data:", err);
    return initialData;
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("DB write error:", err);
  }
}

module.exports = {
  readData,
  writeData
};
