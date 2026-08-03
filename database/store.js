const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db_data.json');

// Initial seed data - Ganesh Gouri Industries (Gouri Aqua Plast) - ZERO prices!
const initialData = {
  users: [
    {
      id: "usr_admin",
      name: "Ganesh Gouri Admin",
      email: "admin@quotation.com",
      mobile: "+919699910491",
      passwordHash: "$2a$10$wN1iN61K4aF3z44/m.z7yeT2n3TzD5Lg20uV4N4W2n2v0Qz.e7D1e", // "admin123"
      role: "admin",
      companyName: "Ganesh Gouri Industries Pvt. Ltd.",
      companyAddress: "KH. NO. 55/3, Lihigaon, Kamptee, Nagpur, Maharashtra, 441001",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_demo",
      name: "Ramesh Shende",
      email: "john@example.com",
      mobile: "+919876543210",
      passwordHash: "$2a$10$wN1iN61K4aF3z44/m.z7yeT2n3TzD5Lg20uV4N4W2n2v0Qz.e7D1e", // "admin123"
      role: "customer",
      companyName: "Shende Constructions",
      companyAddress: "12 Civil Lines, Nagpur, Maharashtra",
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: "cat_tanks",
      name: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/10-layer-orange-water-tank.webp",
      description: "Multi-layer water storage tanks for domestic, commercial, and industrial use. ISO 9001 certified."
    },
    {
      id: "cat_upvc",
      name: "UPVC Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/upvc-pipes-fittings.webp",
      description: "Lead-free, UV stabilized ASTM UPVC pipes for potable water and plumbing applications."
    },
    {
      id: "cat_cpvc",
      name: "CPVC Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/cpvc-pipe-fittings.webp",
      description: "Hot & cold water CPVC piping systems for residential and commercial plumbing."
    },
    {
      id: "cat_swr",
      name: "SWR Drainage Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/swr-drainage-pipes-fittings.webp",
      description: "Soil, waste, and rainwater drainage pipe systems for buildings and infrastructure."
    },
    {
      id: "cat_agri",
      name: "Agriculture Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/agriculture-pipes-fittings.webp",
      description: "Durable agriculture PVC pipes for farming irrigation and water supply."
    },
    {
      id: "cat_hdpe",
      name: "HDPE Pipes",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/hdpe-pipes.webp",
      description: "High-density polyethylene pipes for agriculture water supply and industrial use."
    },
    {
      id: "cat_accessories",
      name: "Plumbing Accessories",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/solvent-cement.webp",
      description: "Solvent cement, flushing cisterns, toilet seat covers, and PTMT taps."
    }
  ],
  products: [
    {
      id: "prod_1",
      name: "10 Layer Ora Water Tank",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/10-layer-orange-water-tank.webp",
      description: "Premium 10-layer orange water storage tank with anti-bacterial protection. Available in 500L to 10000L."
    },
    {
      id: "prod_2",
      name: "10 Layer Gold Water Tank",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/10-layer-gold-water-tank.webp",
      description: "10-layer gold series water tank with UV protection and food-grade inner layer."
    },
    {
      id: "prod_3",
      name: "3 Layer Water Tank",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/3-layer-water-tank.webp",
      description: "Triple layer water tank with black middle layer for UV protection. ISI certified."
    },
    {
      id: "prod_4",
      name: "2 Layer Roto Water Tank",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/2-layer-roto-water-storage-tank.webp",
      description: "Durable 2-layer rotomoulded water storage tank for residential use."
    },
    {
      id: "prod_5",
      name: "4 Layer Puff Water Tank",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/4-layer-puff-roto-water-storage-tank.webp",
      description: "4-layer puff insulated rotomoulded tank keeping water cool in summer."
    },
    {
      id: "prod_6",
      name: "Loft Water Tank",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/loft-water-storage-tank.webp",
      description: "Compact loft tank designed for overhead installations. Available 200L to 500L."
    },
    {
      id: "prod_7",
      name: "UPVC Plumbing Pipes (Sch 40 & 80)",
      categoryId: "cat_upvc",
      categoryName: "UPVC Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/upvc-pipes-fittings.webp",
      description: "Lead-free, UV stabilized ASTM UPVC pipes. Sizes 15mm to 50mm, lengths 3m & 6m."
    },
    {
      id: "prod_8",
      name: "UPVC Pipe Fittings (Elbow, Tee, Coupler)",
      categoryId: "cat_upvc",
      categoryName: "UPVC Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/upvc-pipes-fittings.webp",
      description: "Complete range of UPVC fittings - elbows, tees, couplers, reducers. 15mm to 50mm."
    },
    {
      id: "prod_9",
      name: "CPVC Pipes (SDR 11 Series)",
      categoryId: "cat_cpvc",
      categoryName: "CPVC Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/cpvc-pipe-fittings.webp",
      description: "Hot & cold water CPVC pipes. Temperature resistant up to 93°C. ISI certified."
    },
    {
      id: "prod_10",
      name: "CPVC Pipe Fittings (Full Range)",
      categoryId: "cat_cpvc",
      categoryName: "CPVC Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/cpvc-pipe-fittings.webp",
      description: "CPVC fittings including elbows, tees, unions, valves. Compatible with SDR 11 pipes."
    },
    {
      id: "prod_11",
      name: "SWR Drainage Pipes",
      categoryId: "cat_swr",
      categoryName: "SWR Drainage Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/swr-drainage-pipes-fittings.webp",
      description: "Soil, waste and rainwater drainage pipes. Sizes 75mm to 160mm. Type A & Type B."
    },
    {
      id: "prod_12",
      name: "SWR Drainage Fittings",
      categoryId: "cat_swr",
      categoryName: "SWR Drainage Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/swr-drainage-pipes-fittings.webp",
      description: "Complete SWR fittings range - bends, junctions, traps, couplers for drainage systems."
    },
    {
      id: "prod_13",
      name: "Agriculture PVC Pipes",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/agriculture-pipes-fittings.webp",
      description: "Heavy-duty agriculture PVC pipes for farm irrigation and water distribution."
    },
    {
      id: "prod_14",
      name: "Sprinkler Irrigation Pipes",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/sprinkler-irrigation-pipes.webp",
      description: "Lightweight sprinkler system pipes for efficient farm water distribution."
    },
    {
      id: "prod_15",
      name: "HDPE Pipes (Agriculture Grade)",
      categoryId: "cat_hdpe",
      categoryName: "HDPE Pipes",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/hdpe-pipes.webp",
      description: "High-density polyethylene pipes for agriculture water supply. Flexible and durable."
    },
    {
      id: "prod_16",
      name: "Casing Pipes (Blue)",
      categoryId: "cat_hdpe",
      categoryName: "HDPE Pipes",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/casing-pipes.webp",
      description: "Bore well casing pipes in blue colour. Suitable for tube well applications."
    },
    {
      id: "prod_17",
      name: "Column Pipes",
      categoryId: "cat_hdpe",
      categoryName: "HDPE Pipes",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/column-pipes.webp",
      description: "Column pipes for submersible pump installations in bore wells."
    },
    {
      id: "prod_18",
      name: "Solvent Cement (Gouri Aqua Plast)",
      categoryId: "cat_accessories",
      categoryName: "Plumbing Accessories",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/solvent-cement.webp",
      description: "Heavy-duty solvent cement for leak-proof jointing of UPVC and CPVC pipes."
    },
    {
      id: "prod_19",
      name: "Flushing Cistern",
      categoryId: "cat_accessories",
      categoryName: "Plumbing Accessories",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/flushing-cistern.webp",
      description: "Durable plastic flushing cistern for toilet installations."
    },
    {
      id: "prod_20",
      name: "Plastic Toilet Seat Cover",
      categoryId: "cat_accessories",
      categoryName: "Plumbing Accessories",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/plastic-toilet-seat-cover.webp",
      description: "High-quality moulded plastic toilet seat covers for residential bathrooms."
    },
    {
      id: "prod_21",
      name: "PTMT Water Tap (Aqua Plast)",
      categoryId: "cat_accessories",
      categoryName: "Plumbing Accessories",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/ptmt-water-tap.webp",
      description: "Corrosion-free PTMT water taps for kitchen and bathroom applications."
    },
    {
      id: "prod_22",
      name: "Garden, Braided & LDPE Pipes",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/garden-braided-ldpe-pipes.webp",
      description: "Flexible garden hose pipes, braided pipes, and LDPE pipes for domestic & garden use."
    },
    {
      id: "prod_23",
      name: "Eco Drainage Pipes",
      categoryId: "cat_swr",
      categoryName: "SWR Drainage Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/assets/img/product/eco-drainage-pipes.webp",
      description: "Eco-friendly lightweight drainage pipes for residential and commercial buildings."
    }
  ],
  favorites: {
    "usr_demo": ["prod_1", "prod_7"]
  },
  carts: {
    "usr_demo": [
      { productId: "prod_1", quantity: 20 },
      { productId: "prod_9", quantity: 100 }
    ]
  },
  orders: [
    {
      id: "ord_1001",
      orderNo: "QT-2026-1001",
      userId: "usr_demo",
      userName: "Ramesh Shende",
      userEmail: "john@example.com",
      userMobile: "+919876543210",
      companyName: "Shende Constructions",
      companyAddress: "12 Civil Lines, Nagpur, Maharashtra",
      items: [
        {
          productId: "prod_1",
          productName: "10 Layer Ora Water Tank",
          quantity: 50,
          image: "https://www.ganeshgouriindustries.com/assets/img/product/10-layer-orange-water-tank.webp"
        },
        {
          productId: "prod_7",
          productName: "UPVC Plumbing Pipes (Sch 40 & 80)",
          quantity: 500,
          image: "https://www.ganeshgouriindustries.com/assets/img/product/upvc-pipes-fittings.webp"
        }
      ],
      status: "Pending",
      notes: "Urgent: Required for new construction site in Kamptee Road.",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "ord_1002",
      orderNo: "QT-2026-1002",
      userId: "usr_demo",
      userName: "Ramesh Shende",
      userEmail: "john@example.com",
      userMobile: "+919876543210",
      companyName: "Shende Constructions",
      companyAddress: "12 Civil Lines, Nagpur, Maharashtra",
      items: [
        {
          productId: "prod_9",
          productName: "CPVC Pipes (SDR 11 Series)",
          quantity: 200,
          image: "https://www.ganeshgouriindustries.com/assets/img/product/cpvc-pipe-fittings.webp"
        },
        {
          productId: "prod_18",
          productName: "Solvent Cement (Gouri Aqua Plast)",
          quantity: 50,
          image: "https://www.ganeshgouriindustries.com/assets/img/product/solvent-cement.webp"
        }
      ],
      status: "Dispatched",
      notes: "Dispatched via Gouri logistics from Nagpur warehouse.",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif_1",
      title: "Welcome to Gouri Aqua Plast",
      message: "Explore our full range of Water Storage Tanks, UPVC, CPVC, SWR Pipes & Fittings. ISO 9001 certified quality!",
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
