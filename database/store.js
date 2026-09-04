const fs = require('fs');
const path = require('path');
const couchbase = require('couchbase');

const DB_FILE = path.join(__dirname, 'db_data.json');
const COUCHBASE_DOC_KEY = 'appdata';

// In-memory cache to avoid re-reading DB on every request
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

// Couchbase Setup
let cbCluster = null;
let cbCollection = null;
let isCouchbaseConnected = false;
let hasAttemptedConnection = false;

async function connectCouchbase() {
  if (isCouchbaseConnected) return;
  if (hasAttemptedConnection) return;
  hasAttemptedConnection = true;
  const connStr = process.env.COUCHBASE_URI;
  const username = process.env.COUCHBASE_USER;
  const password = process.env.COUCHBASE_PASSWORD;
  const bucketName = process.env.COUCHBASE_BUCKET || 'quotation_app';
  if (!connStr || !username || !password) return;
  try {
    const certPath = path.join(__dirname, 'couchbase-root-ca.pem');
    const options = {
      username,
      password,
      configProfile: 'wanDevelopment',
    };
    if (fs.existsSync(certPath)) {
      options.trustStorePath = certPath;
    }
    cbCluster = await couchbase.connect(connStr, options);
    const bucket = cbCluster.bucket(bucketName);
    cbCollection = bucket.defaultCollection();
    isCouchbaseConnected = true;
    console.log(`✅ Connected to Couchbase (bucket: ${bucketName}) for persistent storage.`);
  } catch (err) {
    console.error('❌ Couchbase connection error:', err.constructor.name, '-', err.message || err);
  }
}






// Initial seed data - Ganesh Gouri Industries (Gouri Aqua Plast) - ZERO prices!
const initialData = {
  users: [
    {
      id: "usr_admin",
      name: "Ganesh Gouri Admin",
      email: "admin@quotation.com",
      mobile: "+919699910491",
      passwordHash: "$2a$10$41/Sb9f79KHF0jXWjzvrDe7fm.2Yv5EVxWuf9snFP1pSt8FDoOHKm", // "admin123"
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
      passwordHash: "$2a$10$41/Sb9f79KHF0jXWjzvrDe7fm.2Yv5EVxWuf9snFP1pSt8FDoOHKm", // "admin123"
      role: "customer",
      companyName: "Shende Constructions",
      companyAddress: "12 Civil Lines, Nagpur, Maharashtra",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_7249722749",
      userId: "7249722749",
      name: "Gouri Aqua Plast User",
      email: "user7249722749@gouriaquaplast.com",
      mobile: "7249722749",
      passwordHash: "$2a$10$41/Sb9f79KHF0jXWjzvrDe7fm.2Yv5EVxWuf9snFP1pSt8FDoOHKm", // "123456" / "admin123"
      role: "customer",
      status: "active",
      companyName: "Gouri Aqua Plast",
      companyAddress: "Nagpur, Maharashtra",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_7768807208",
      userId: "7768807208",
      name: "Gouri Aqua Plast Customer",
      email: "user7768807208@gouriaquaplast.com",
      mobile: "7768807208",
      passwordHash: "$2a$10$41/Sb9f79KHF0jXWjzvrDe7fm.2Yv5EVxWuf9snFP1pSt8FDoOHKm",
      role: "customer",
      status: "active",
      companyName: "Gouri Aqua Plast",
      companyAddress: "Nagpur, Maharashtra",
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: "cat_faucets",
      name: "FAUCETS",
      image: "https://www.ganeshgouriindustries.com/images/index/new-product/faucet.png",
      description: "Premium Edge, Smart, and Regular series bathroom & kitchen faucets, bib taps, and valves."
    },
    {
      id: "cat_household",
      name: "HOUSEHOLD PRODUCTS",
      image: "/images/categories/cat_household.png",
      description: "Durable multipurpose and construction ghamelas and household plastic products."
    },
    {
      id: "cat_drip",
      name: "DRIP IRRIGATION SYSTEM",
      image: "/images/categories/cat_drip.png",
      description: "High-efficiency drip irrigation pipes and lateral systems for modern farming."
    },
    {
      id: "cat_tanks",
      name: "Water Storage Tanks",
      image: "/images/categories/cat_tanks.png",
      description: "Multi-layer water storage tanks for domestic, commercial, and industrial use. ISO 9001 certified."
    },
    {
      id: "cat_cpvc",
      name: "CPVC Pipes & Fittings",
      image: "/images/categories/cat_cpvc.png",
      description: "Hot & cold water CPVC piping systems for residential and commercial plumbing."
    },
    {
      id: "cat_upvc",
      name: "UPVC Pipes & Fittings",
      image: "/images/categories/cat_upvc.png",
      description: "Lead-free, UV stabilized ASTM UPVC pipes for potable water and plumbing applications."
    },
    {
      id: "cat_swr",
      name: "SWR Drainage Pipes & Fittings",
      image: "/images/categories/cat_swr.png",
      description: "Soil, waste, and rainwater drainage pipe systems for buildings and infrastructure."
    },
    {
      id: "cat_casing",
      name: "UPVC CASING PIPES",
      image: "/images/categories/cat_casing.png",
      description: "Bore well casing pipes in blue colour for tube well applications."
    },
    {
      id: "cat_agri",
      name: "Agriculture Pipes & Fittings",
      image: "https://www.ganeshgouriindustries.com/images/index/new-product/Agri-Pipes.png",
      description: "Durable agriculture PVC pipes for farming irrigation and water supply."
    },
    {
      id: "cat_hdpe",
      name: "HDPE PIPE & FITTINGS",
      image: "/images/categories/cat_hdpe.png",
      description: "High-density polyethylene pipes for agriculture water supply and industrial use."
    },
    {
      id: "cat_sprinkler",
      name: "Sprinkler Pipes & Fittings",
      image: "/images/categories/cat_sprinkler.png",
      description: "Lightweight sprinkler irrigation pipes for efficient farm water distribution."
    },
    {
      id: "cat_column",
      name: "UPVC COLUMN PIPES",
      image: "/images/categories/cat_column.png",
      description: "High-strength column pipes for submersible pump installations in bore wells."
    },
    {
      id: "cat_sanitary",
      name: "Toilet Seat Cover & Flushing Cistern",
      image: "https://www.ganeshgouriindustries.com/images/index/SANITARY-WARE.png",
      description: "Moulded toilet seat covers and flushing cisterns for modern bathrooms."
    },
    {
      id: "cat_eco_drainage",
      name: "Eco Drainage Pipes",
      image: "/images/categories/cat_eco_drainage.png",
      description: "Eco-friendly lightweight drainage pipes for residential and commercial buildings."
    },
    {
      id: "cat_garden",
      name: "Garden, Braided & LDPE Pipes",
      image: "/images/categories/cat_garden.png",
      description: "Flexible garden hose pipes, braided pipes, and LDPE pipes for domestic & outdoor use."
    },
    {
      id: "cat_dwc",
      name: "DWC",
      image: "/images/categories/cat_dwc.png",
      description: "Double Wall Corrugated (DWC) pipes for underground cable protection and drainage.",
      uom: "MTR"
    }
  ],
  products: [
    {
      id: "prod_faucet_1",
      name: "EDGE SERIES SHORT BODY TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES SHORT BODY TAP.png",
      description: "EDGE SERIES SHORT BODY TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_2",
      name: "EDGE SERIES LONG BODY TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES LONG BODY TAP.png",
      description: "EDGE SERIES LONG BODY TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_3",
      name: "EDGE SERIES SWAN NECK",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES SWAN NECK.png",
      description: "EDGE SERIES SWAN NECK high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_4",
      name: "EDGE SERIES ANGULAR VALVE",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES ANGULAR VALVE.png",
      description: "EDGE SERIES ANGULAR VALVE high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_5",
      name: "EDGE SERIES PILLAR TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES PILLAR TAP.png",
      description: "EDGE SERIES PILLAR TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_6",
      name: "EDGE SERIES 2 WAY BIB TAB",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES 2 WAY BIB TAB.png",
      description: "EDGE SERIES 2 WAY BIB TAB high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_7",
      name: "EDGE SERIES SINK TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/EDGE SERIES SINK TAP.png",
      description: "EDGE SERIES SINK TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_8",
      name: "SMART SERIES SHORT BODY BIB TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES SHORT BODY BIB TAP.png",
      description: "SMART SERIES SHORT BODY BIB TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_9",
      name: "SMART SERIES LONG BODY BIB TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES LONG BODY BIB TAP.png",
      description: "SMART SERIES LONG BODY BIB TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_10",
      name: "SMART SERIES PILLAR TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES PILLAR TAP.png",
      description: "SMART SERIES PILLAR TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_11",
      name: "SMART SERIES SINK TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES SINK TAP.png",
      description: "SMART SERIES SINK TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_12",
      name: "SMART SERIES SWAN NECK",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES SWAN NECK.png",
      description: "SMART SERIES SWAN NECK high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_13",
      name: "SMART SERIES ANGULAR VALVE",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES ANGULAR VALVE.png",
      description: "SMART SERIES ANGULAR VALVE high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_14",
      name: "SMART SERIES 2 WAY ANGULAR VALVE",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES 2 WAY ANGULAR VALVE.png",
      description: "SMART SERIES 2 WAY ANGULAR VALVE high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_15",
      name: "SMART SERIES 2 WAY BIB TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/SMART SERIES 2 WAY BIB TAP.png",
      description: "SMART SERIES 2 WAY BIB TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_16",
      name: "REGULAR SERIES SHORT BODY BIB TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES SHORT BODY BIB TAP.png",
      description: "REGULAR SERIES SHORT BODY BIB TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_17",
      name: "REGULAR SERIES LONG BODY BIB TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES LONG BODY BIB TAP.png",
      description: "REGULAR SERIES LONG BODY BIB TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_18",
      name: "REGULAR SERIES PILLAR TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES PILLAR TAP.png",
      description: "REGULAR SERIES PILLAR TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_19",
      name: "REGULAR SERIES SINK TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES SINK TAP.png",
      description: "REGULAR SERIES SINK TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_20",
      name: "REGULAR SERIES SWAN NECK",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES SWAN NECK.png",
      description: "REGULAR SERIES SWAN NECK high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_21",
      name: "REGULAR SERIES ANGULAR VALVE",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES ANGULAR VALVE.png",
      description: "REGULAR SERIES ANGULAR VALVE high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_22",
      name: "REGULAR SERIES 2 WAY ANGULAR VALVE",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES 2 WAY ANGULAR VALVE.png",
      description: "REGULAR SERIES 2 WAY ANGULAR VALVE high quality faucet.",
      sizes: ["1/2 inch"]
    },
    {
      id: "prod_faucet_23",
      name: "REGULAR SERIES 2 WAY BIB TAP",
      categoryId: "cat_faucets",
      categoryName: "FAUCETS",
      image: "/images/faucets/REGULAR SERIES 2 WAY BIB TAP.png",
      description: "REGULAR SERIES 2 WAY BIB TAP high quality faucet.",
      sizes: ["1/2 inch"]
    },

    {
      id: "prod_household_1",
      name: "CONSTRUCTION GHAMELA SHIVA",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/CONSTRUCTION GHAMELA SHIVA.png",
      description: "CONSTRUCTION GHAMELA SHIVA high durability ghamela.",
      sizes: ["15 Inch"]
    },
    {
      id: "prod_household_2",
      name: "MULTIPURPOSE GHAMELA GOURI",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/MULTIPURPOSE GHAMELA GOURI.png",
      description: "MULTIPURPOSE GHAMELA GOURI high durability ghamela.",
      sizes: ["15 Inch"]
    },
    {
      id: "prod_household_3",
      name: "MULTIPURPOSE GHAMELA KRISHNA",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/MULTIPURPOSE GHAMELA KRISHNA.png",
      description: "MULTIPURPOSE GHAMELA KRISHNA high durability ghamela.",
      sizes: ["16 Inch"]
    },
    {
      id: "prod_household_4",
      name: "MULTIPURPOSE GHAMELA RAGHAV",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/MULTIPURPOSE GHAMELA RAGHAV.png",
      description: "MULTIPURPOSE GHAMELA RAGHAV high durability ghamela.",
      sizes: ["18 Inch"]
    },
    {
      id: "prod_household_5",
      name: "MULTIPURPOSE GHAMELA ANIKET",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/MULTIPURPOSE GHAMELA ANIKET.png",
      description: "MULTIPURPOSE GHAMELA ANIKET high durability ghamela.",
      sizes: ["20 Inch"]
    },
    {
      id: "prod_household_6",
      name: "MULTIPURPOSE GHAMELA TEJASWI",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/MULTIPURPOSE GHAMELA TEJASWI.png",
      description: "MULTIPURPOSE GHAMELA TEJASWI high durability ghamela.",
      sizes: ["17 Inch"]
    },
    {
      id: "prod_household_7",
      name: "MULTIPURPOSE GHAMELA GAJRAJ",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/MULTIPURPOSE GHAMELA GAJRAJ.png",
      description: "MULTIPURPOSE GHAMELA GAJRAJ high durability ghamela.",
      sizes: ["22 Inch"]
    },
    {
      id: "prod_household_8",
      name: "AQUA PLAST GHAMELA 16",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/AQUA PLAST GHAMELA 16.png",
      description: "AQUA PLAST GHAMELA 16 high durability ghamela.",
      sizes: ["16 Inch"]
    },
    {
      id: "prod_household_9",
      name: "AQUA PLAST GHAMELA 17",
      categoryId: "cat_household",
      categoryName: "HOUSEHOLD PRODUCTS",
      image: "/images/household/AQUA PLAST GHAMELA 17.png",
      description: "AQUA PLAST GHAMELA 17 high durability ghamela.",
      sizes: ["17 Inch"]
    },

    {
      id: "prod_drip_round_isi_1",
      name: "ROUND DRIPLINE 12MM ISI",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ISI",
      image: "/images/drip/ROUND DRIPLINE 12MM ISI.png",
      description: "ROUND DRIPLINE 12MM ISI certified.",
      sizes: ["12-4-30 CLASS 1","12-4-40 CLASS 1","12-4-50 CLASS 1","12-4-30 CLASS 3","12-4-40 CLASS 3","12-4-50 CLASS 3","12-4-30 CLASS 2","12-4-40 CLASS 2","12-4-50 CLASS 2"]
    },
    {
      id: "prod_drip_round_isi_2",
      name: "ROUND DRIPLINE 16MM ISI",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ISI",
      image: "/images/drip/ROUND DRIPLINE 16MM ISI.png",
      description: "ROUND DRIPLINE 16MM ISI certified.",
      sizes: ["16-4-30 CLASS 1","16-4-40 CLASS 1","16-4-50 CLASS 1","16-4-30 CLASS 2","16-4-40 CLASS 2","16-4-50 CLASS 2"]
    },
    {
      id: "prod_drip_round_isi_3",
      name: "20MM ROUND INLINE PIPE ISI",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ISI",
      image: "/images/drip/20MM ROUND INLINE PIPE ISI.png",
      description: "20mm Round Inline Drip Pipe ISI certified.",
      sizes: ["20-4-30 CLASS-1","20-4-40 CLASS-1","20-4-50 CLASS-1"]
    },
    {
      id: "prod_drip_flat_isi_1",
      name: "FLAT DRIPLINE 12MM ISI",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "FLAT DRIP ISI",
      image: "/images/drip/FLAT DRIPLINE 12MM ISI.png",
      description: "FLAT DRIPLINE 12MM ISI certified.",
      sizes: ["12-4-30 CLASS 2","12-4-40 CLASS 2","12-4-50 CLASS 2","12-4-30 CLASS 3","12-4-40 CLASS 3","12-4-50 CLASS 3"]
    },
    {
      id: "prod_drip_flat_isi_2",
      name: "FLAT DRIPLINE 16MM ISI",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "FLAT DRIP ISI",
      image: "/images/drip/FLAT DRIPLINE 16MM ISI.png",
      description: "FLAT DRIPLINE 16MM ISI certified.",
      sizes: ["16-4-30 CLASS 1","16-4-40 CLASS 1","16-4-50 CLASS 1","16-4-30 CLASS 2","16-4-40 CLASS 2","16-4-50 CLASS 2"]
    },
    {
      id: "prod_drip_flat_isi_3",
      name: "FLAT DRIPLINE 20MM ISI",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "FLAT DRIP ISI",
      image: "/images/drip/FLAT DRIPLINE 20MM ISI.png",
      description: "FLAT DRIPLINE 20MM ISI certified.",
      sizes: ["20-4-30 CLASS 1","20-4-40 CLASS 1","20-4-50 CLASS 1"]
    },
    {
      id: "prod_drip_round_online_1",
      name: "12MM PLAIN LATERAL ONLINE PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ONLINE / HYDROCOL (LATERAL)",
      image: "/images/drip/12MM PLAIN LATERAL ONLINE PIPE.png",
      description: "12mm Plain Lateral Online Drip Pipe.",
      sizes: ["CLASS-2"]
    },
    {
      id: "prod_drip_round_online_2",
      name: "16MM PLAIN LATERAL ONLINE PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ONLINE / HYDROCOL (LATERAL)",
      image: "/images/drip/16MM PLAIN LATERAL ONLINE PIPE.png",
      description: "16mm Plain Lateral Online Drip Pipe.",
      sizes: ["CLASS-2"]
    },
    {
      id: "prod_drip_round_online_3",
      name: "20MM PLAIN LATERAL ONLINE PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ONLINE / HYDROCOL (LATERAL)",
      image: "/images/drip/20MM PLAIN LATERAL ONLINE PIPE.png",
      description: "20mm Plain Lateral Online Drip Pipe.",
      sizes: ["CLASS-2"]
    },
    {
      id: "prod_drip_round_online_4",
      name: "32MM PLAIN LATERAL ONLINE PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "ROUND DRIP ONLINE / HYDROCOL (LATERAL)",
      image: "/images/drip/32MM PLAIN LATERAL ONLINE PIPE.png",
      description: "32mm Plain Lateral Online Drip Pipe.",
      sizes: ["CLASS-1","CLASS-2"]
    },
    {
      id: "prod_drip_flat_pepsi_1",
      name: "12MM FLAT EMITTING PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "FLAT DRIP (PEPSI) - INLINE",
      image: "/images/drip/12MM FLAT EMITTING PIPE.png",
      description: "12mm Flat Emitting Pipe (Pepsi Inline).",
      sizes: ["2/4 40 14KG 0.2","2/4 40 17KG 0.4","2/4 30 17KG 0.4","2/4 40 14KG 0.3","2/4 40 14KG 0.4"]
    },
    {
      id: "prod_drip_flat_pepsi_2",
      name: "16MM FLAT EMITTING PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "FLAT DRIP (PEPSI) - INLINE",
      image: "/images/drip/16MM FLAT EMITTING PIPE.png",
      description: "16mm Flat Emitting Pipe (Pepsi Inline).",
      sizes: ["2/4 30 8KG 0.2","2/4 40 8KG 0.2","2/4 40 9KG 0.2","2/4 30 10KG 0.2","2/4 40 10KG 0.2","2/4 40 14KG 0.4","2/4 40 17KG 0.5","2/4 40 12KG 0.25","2/4 30 12KG 0.25","2/4 30 14KG 0.4","2/4 40 14KG 0.4","2/4 30 14KG 0.3"]
    },
    {
      id: "prod_drip_flat_pepsi_3",
      name: "20MM FLAT EMITTING PIPE",
      categoryId: "cat_drip",
      categoryName: "DRIP IRRIGATION SYSTEM",
      subCategory: "FLAT DRIP (PEPSI) - INLINE",
      image: "/images/drip/20MM FLAT EMITTING PIPE.png",
      description: "20mm Flat Emitting Pipe (Pepsi Inline).",
      sizes: ["20-4-30 CLASS-2","20-4-40 CLASS-2","20-4-50 CLASS-2"]
    },

    {
      id: "prod_tank_1",
      name: "HDPE 10L GOLD GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Blow 10 Layer Gold.png",
      description: "HDPE 10L GOLD GAP water storage tank. Available in 300L, 500L, 750L, 1000L, 1500L, 2000L.",
      sizes: ["300L", "500L", "750L", "1000L", "1500L", "2000L"],
      sizeProductCodes: {
        "300L": "FG-400128",
        "500L": "FG-400124",
        "750L": "FG-400125",
        "1000L": "FG-400126",
        "1500L": "FG-400085",
        "2000L": "FG-400084"
      }
    },
    {
      id: "prod_tank_2",
      name: "HDPE 10L ORG GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Blow 10 Layer Ora.png",
      description: "HDPE 10L ORG GAP water storage tank. Available in 500L, 750L, 1000L.",
      sizes: ["500L", "750L", "1000L"],
      sizeProductCodes: {
        "500L": "FG-400131",
        "750L": "FG-400132",
        "1000L": "FG-400130"
      }
    },
    {
      id: "prod_tank_3",
      name: "HDPE 6L WHITE GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Blow 6 Layer White.png",
      description: "HDPE 6L WHITE GAP water storage tank. Available in 200L, 300L, 500L, 750L, 1000L, 1500L, 2000L.",
      sizes: ["200L", "300L", "500L", "750L", "1000L", "1500L", "2000L"],
      sizeProductCodes: {
        "200L": "FG-400138",
        "300L": "FG-400137",
        "500L": "FG-400134",
        "750L": "FG-400135",
        "1000L": "FG-400127",
        "1500L": "FG-400136",
        "2000L": "FG-400133"
      }
    },

    {
      id: "prod_tank_5",
      name: "HDPE 6L ORG GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Blow 6 Layer Ora.png",
      description: "HDPE 6L ORG GAP water storage tank. Available in 500L, 750L, 1000L.",
      sizes: ["500L", "750L", "1000L"],
      sizeProductCodes: {
        "500L": "FG-400139",
        "750L": "FG-401589",
        "1000L": "FG-401590"
      }
    },

    {
      id: "prod_tank_8",
      name: "HDPE LOFT WHITE GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Loft Tank White.png",
      description: "HDPE LOFT WHITE GAP water storage tank. Available in 200L, 300L, 500L, 1000L.",
      sizes: ["200L", "300L", "500L", "1000L"],
      sizeProductCodes: {
        "200L": "FG-400098",
        "300L": "FG-400097",
        "500L": "FG-400096",
        "1000L": "FG-401819"
      }
    },
    {
      id: "prod_tank_9",
      name: "10L ROTO T3 ORANGE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 10 Layer T3 Ora.png",
      description: "10L ROTO T3 ORANGE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-401658",
        "750L": "FG-401659",
        "1000L": "FG-401660",
        "5000L": "FG-401674"
      }
    },
    {
      id: "prod_tank_10",
      name: "6L ROTO MARBLE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 6 Layer Double Puff Marble.png",
      description: "6L ROTO MARBLE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400056",
        "750L": "FG-400055",
        "1000L": "FG-400054",
        "1500L": "FG-400053",
        "2000L": "FG-400052",
        "3000L": "FG-400051",
        "5000L": "FG-400050"
      }
    },
    {
      id: "prod_tank_11",
      name: "6L ROTO WHITE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 6 Layer Double Puff White.png",
      description: "6L ROTO WHITE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400070",
        "750L": "FG-400069",
        "1000L": "FG-400068",
        "1500L": "FG-400067",
        "2000L": "FG-400066",
        "3000L": "FG-400065",
        "5000L": "FG-400064"
      }
    },
    {
      id: "prod_tank_12",
      name: "4L ROTO MARBLE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 4 Layer Double Puff Marble.png",
      description: "4L ROTO MARBLE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400028",
        "750L": "FG-400027",
        "1000L": "FG-400026",
        "1500L": "FG-400025",
        "2000L": "FG-400024",
        "3000L": "FG-400023",
        "5000L": "FG-400022"
      }
    },
    {
      id: "prod_tank_13",
      name: "4L ROTO WHITE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 4 Layer Double Puff White.png",
      description: "4L ROTO WHITE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400035",
        "750L": "FG-400034",
        "1000L": "FG-400033",
        "1500L": "FG-400032",
        "2000L": "FG-400031",
        "3000L": "FG-400030",
        "5000L": "FG-400029"
      }
    },
    {
      id: "prod_tank_14",
      name: "3L ROTO WHITE GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 3 Layer White.png",
      description: "3L ROTO WHITE GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400021",
        "750L": "FG-400020",
        "1000L": "FG-400019",
        "1500L": "FG-400018",
        "2000L": "FG-400017",
        "3000L": "FG-400016",
        "5000L": "FG-400015"
      }
    },
    {
      id: "prod_tank_15",
      name: "2L ROTO BLACK ISI GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 2 Layer ISI Black.png",
      description: "2L ROTO BLACK ISI GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400014",
        "750L": "FG-400013",
        "1000L": "FG-400012",
        "1500L": "FG-400011",
        "2000L": "FG-400010",
        "3000L": "FG-400009",
        "5000L": "FG-400008"
      }
    },

    {
      id: "prod_tank_17",
      name: "ROTO UNDERGROUND TANK",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Underground Tank Black.png",
      description: "ROTO UNDERGROUND TANK water storage tank. Available in 1000L, 2000L.",
      sizes: ["1000L", "2000L"],
      sizeProductCodes: {
        "1000L": "FG-401580",
        "2000L": "FG-401581"
      }
    },

    {
      id: "prod_tank_19",
      name: "3L ROTO ORG GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 3 Layer Ora.png",
      description: "3L ROTO ORG GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400101",
        "750L": "FG-400102",
        "1000L": "FG-400100",
        "1500L": "FG-400103",
        "2000L": "FG-400104",
        "3000L": "FG-400105",
        "5000L": "FG-400106"
      },
      subcategoryId: "subcat_tanks_roto"
    },
    {
      id: "prod_tank_20",
      name: "3L ROTO BLACK GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 3 Layer Black.png",
      description: "3L ROTO BLACK GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400107",
        "750L": "FG-400108",
        "1000L": "FG-400109",
        "1500L": "FG-400110",
        "2000L": "FG-400111",
        "3000L": "FG-400112",
        "5000L": "FG-400113"
      },
      subcategoryId: "subcat_tanks_roto"
    },
    {
      id: "prod_tank_21",
      name: "6L ROTO MARBLE DOUBLE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 6 Layer Double Puff Marble.png",
      description: "6L ROTO MARBLE DOUBLE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400049",
        "750L": "FG-400048",
        "1000L": "FG-400047",
        "1500L": "FG-400046",
        "2000L": "FG-400045",
        "3000L": "FG-400044",
        "5000L": "FG-400043"
      },
      subcategoryId: "subcat_tanks_roto"
    },
    {
      id: "prod_tank_22",
      name: "6L ROTO WHITE DOUBLE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 6 Layer Double Puff White.png",
      description: "6L ROTO WHITE DOUBLE FOAM GAP water storage tank. Available in 500L, 750L, 1000L, 1500L, 2000L, 3000L, 5000L.",
      sizes: ["500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
      sizeProductCodes: {
        "500L": "FG-400063",
        "750L": "FG-400062",
        "1000L": "FG-400061",
        "1500L": "FG-400060",
        "2000L": "FG-400059",
        "3000L": "FG-400058",
        "5000L": "FG-400057"
      },
      subcategoryId: "subcat_tanks_roto"
    },
    {
      id: "prod_tank_23",
      name: "6L ROTO ORG DOUBLE FOAM GAP",
      categoryId: "cat_tanks",
      categoryName: "Water Storage Tanks",
      image: "/images/tanks/Roto 6 Layer Double Puff Ora.png",
      description: "6L ROTO ORG DOUBLE FOAM GAP water storage tank. Available in 500L, 750L, 1000L.",
      sizes: ["500L", "750L", "1000L"],
      sizeProductCodes: {
        "500L": "FG-401588",
        "750L": "FG-401593",
        "1000L": "FG-401587"
      },
      subcategoryId: "subcat_tanks_roto"
    },
    {
      id: "prod_11",
      name: "CPVC SDR 11 Pipes",
      categoryId: "cat_cpvc",
      categoryName: "CPVC Pipes & Fittings",
      image: "/images/categories/cat_cpvc.png",
      description: "Hot & cold water CPVC pipes. Temperature resistant up to 93°C. ISI certified."
    },
    {
      id: "prod_12",
      name: "CPVC Pipe Fittings (Elbow, Tee, Union)",
      categoryId: "cat_cpvc",
      categoryName: "CPVC Pipes & Fittings",
      image: "/images/categories/cat_cpvc.png",
      description: "CPVC fittings including elbows, tees, unions, brass transition fittings."
    },
    {
      id: "prod_13",
      name: "UPVC Plumbing Pipes (Sch 40 & 80)",
      categoryId: "cat_upvc",
      categoryName: "UPVC Pipes & Fittings",
      image: "/images/categories/cat_upvc.png",
      description: "Lead-free, UV stabilized ASTM UPVC pipes. Sizes 15mm to 50mm, lengths 3m & 6m."
    },
    {
      id: "prod_14",
      name: "UPVC Pipe Fittings",
      categoryId: "cat_upvc",
      categoryName: "UPVC Pipes & Fittings",
      image: "/images/categories/cat_upvc.png",
      description: "Full range of UPVC fittings - elbows, tees, couplers, reducers."
    },
    {
      id: "prod_15",
      name: "SWR Drainage Pipes",
      categoryId: "cat_swr",
      categoryName: "SWR Drainage Pipes & Fittings",
      image: "/images/categories/cat_swr.png",
      description: "Soil, waste and rainwater drainage pipes. Sizes 75mm to 160mm. Type A & Type B."
    },
    {
      id: "prod_16",
      name: "SWR Drainage Fittings",
      categoryId: "cat_swr",
      categoryName: "SWR Drainage Pipes & Fittings",
      image: "/images/categories/cat_swr.png",
      description: "Complete SWR fittings range - bends, junctions, traps, couplers for drainage systems."
    },
    {
      id: "prod_casing_1",
      name: "CASING PIPE BLUE THD",
      categoryId: "cat_casing",
      categoryName: "UPVC CASING PIPES",
      image: "/images/casing/CASING PIPE BLUE THD.png",
      description: "CASING PIPE BLUE THD for bore wells.",
      sizes: ["35MM TYPE CM-SCH-80-3M","40MM TYPE CM-SCH-80-3M","50MM TYPE CM-SCH-80-3M","100MM TYPE CM-SCH-80-3M","125MM TYPE CM-SCH-80-3M","150MM TYPE CM-SCH-80-3M","175MM TYPE CM-SCH-80-3M","200MM TYPE CM-SCH-80-3M","125MM TYPE CS-SCH-40-3M","150MM TYPE CS-SCH-40-3M","175MM TYPE CS-SCH-40-3M","200MM TYPE CS-SCH-40-3M","115MM TYPE CM-3M","140MM TYPE CS-SCH-40-5M","140MM TYPE CS-SCH-80-5M"]
    },
    {
      id: "prod_casing_2",
      name: "3M CASING PIPE",
      categoryId: "cat_casing",
      categoryName: "UPVC CASING PIPES",
      image: "/images/casing/3M CASING PIPE.png",
      description: "3M UPVC Casing Pipe for bore wells.",
      sizes: ["35MM","40MM","50MM","100MM","125MM","150MM","175MM","200MM"]
    },
    {
      id: "prod_agri_1",
      name: "6M PVC PIPE ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/6M PVC PIPE ISI.png",
      description: "6M PVC PIPE ISI for agriculture irrigation and piping systems.",
      sizes: ["20MM","25MM","32MM","40MM","50MM","63MM","75MM","90MM","110MM","125MM","140MM","160MM","180MM","200MM","225MM","250MM"]
    },
    {
      id: "prod_agri_2",
      name: "6M PVC PIPE",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/6M PVC PIPE.png",
      description: "6M PVC PIPE for agriculture irrigation and piping systems.",
      sizes: ["20MM","25MM","32MM","40MM","50MM","63MM","75MM","90MM","110MM","125MM","140MM","160MM","180MM","200MM","225MM","250MM"]
    },
    {
      id: "prod_agri_3",
      name: "3M PVC PIPE ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/3M PVC PIPE ISI.png",
      description: "3M PVC PIPE ISI for agriculture irrigation and piping systems.",
      sizes: ["20MM","25MM","32MM","40MM","50MM","63MM"]
    },
    {
      id: "prod_agri_4",
      name: "3M PVC PIPE",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/3M PVC PIPE.png",
      description: "3M PVC PIPE for agriculture irrigation and piping systems.",
      sizes: ["20MM","25MM","32MM","40MM","50MM","63MM"]
    },
    {
      id: "prod_agri_5",
      name: "6M ECO PVC PIPE",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/6M ECO PVC PIPE.png",
      description: "6M ECO PVC PIPE for agriculture irrigation and piping systems.",
      sizes: ["63MM","75MM","90MM","110MM"]
    },
    {
      id: "prod_agri_6",
      name: "AGRI REDUCER TEE PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI REDUCER TEE PN6.png",
      description: "AGRI REDUCER TEE PN6 for agriculture irrigation and piping systems.",
      sizes: ["63 X 40","63 X 50","75 X 50","75 X 63","90 X 63","90 X 75","110 X 75","110 X 90","140 X 90","140 X 110","160 X 110","160 X 140"]
    },
    {
      id: "prod_agri_7",
      name: "LAPETA (LDPE) AGRICULTURE PIPE",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/LAPETA (LDPE) AGRICULTURE PIPE.png",
      description: "LAPETA (LDPE) AGRICULTURE PIPE for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","65MM","75MM","100MM"]
    },
    {
      id: "prod_agri_8",
      name: "AGRI ELBOW PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI ELBOW PN6.png",
      description: "AGRI ELBOW PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_9",
      name: "AGRI TEE PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI TEE PN6.png",
      description: "AGRI TEE PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_10",
      name: "AGRI F.T.A PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI F.T.A PN6.png",
      description: "AGRI F.T.A PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM"]
    },
    {
      id: "prod_agri_11",
      name: "PN6 - END CAP (THREADED) ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN6 - END CAP (THREADED) ISI.png",
      description: "PN6 - END CAP (THREADED) ISI for agriculture irrigation and piping systems.",
      sizes: ["63MM","75MM","90MM","110MM"]
    },
    {
      id: "prod_agri_12",
      name: "SERVICE SADDLE PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/SERVICE SADDLE PN6.png",
      description: "SERVICE SADDLE PN6 for agriculture irrigation and piping systems.",
      sizes: ["75 X 20","75 X 25","75 X 32","110 X 32"]
    },
    {
      id: "prod_agri_13",
      name: "AGRI COUPLER PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI COUPLER PN6.png",
      description: "AGRI COUPLER PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_14",
      name: "AGRI SHOE BEND PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI SHOE BEND PN6.png",
      description: "AGRI SHOE BEND PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_15",
      name: "AGRI END CAP PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI END CAP PN6.png",
      description: "AGRI END CAP PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM"]
    },
    {
      id: "prod_agri_16",
      name: "AGRI M.T.A PN6",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/AGRI M.T.A PN6.png",
      description: "AGRI M.T.A PN6 for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM"]
    },
    {
      id: "prod_agri_17",
      name: "PN10 - ELBOW ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - ELBOW ISI.png",
      description: "PN10 - ELBOW ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_18",
      name: "PN10 - UNION ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - UNION ISI.png",
      description: "PN10 - UNION ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_19",
      name: "PN10 - TEE ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - TEE ISI.png",
      description: "PN10 - TEE ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_20",
      name: "PN10 - COUPLER ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - COUPLER ISI.png",
      description: "PN10 - COUPLER ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_21",
      name: "PN10 - MTA ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - MTA ISI.png",
      description: "PN10 - MTA ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_22",
      name: "PN10 - FTA ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - FTA ISI.png",
      description: "PN10 - FTA ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_23",
      name: "PN10 - END CAP ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - END CAP ISI.png",
      description: "PN10 - END CAP ISI for agriculture irrigation and piping systems.",
      sizes: ["25MM","32MM"]
    },
    {
      id: "prod_agri_24",
      name: "PN10 - REDUCING BUSH ISI",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/PN10 - REDUCING BUSH ISI.png",
      description: "PN10 - REDUCING BUSH ISI for agriculture irrigation and piping systems.",
      sizes: ["32 X 20","32 X 25"]
    },
    {
      id: "prod_agri_25",
      name: "REDUCER (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/REDUCER (LW).png",
      description: "REDUCER (LW) for agriculture irrigation and piping systems.",
      sizes: ["50 X 40","63 X 40","63 X 50","75 X 40","75 X 63","90 X 50","90 X 63","90 X 75","110 X 63","110 X 75","110 X 90","140 X 110","160 X 110","160 X 140"]
    },
    {
      id: "prod_agri_26",
      name: "REDUCING BUSH (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/REDUCING BUSH (LW).png",
      description: "REDUCING BUSH (LW) for agriculture irrigation and piping systems.",
      sizes: ["63 X 40","63 X 50","75 X 40","75 X 63","90 X 50","90 X 63","90 X 75","110 X 63","110 X 75","110 X 90"]
    },
    {
      id: "prod_agri_27",
      name: "TEE (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/TEE (LW).png",
      description: "TEE (LW) for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_28",
      name: "COUPLER (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/COUPLER (LW).png",
      description: "COUPLER (LW) for agriculture irrigation and piping systems.",
      sizes: ["75MM","90MM","110MM"]
    },
    {
      id: "prod_agri_29",
      name: "FABRICATED COUPLER (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/FABRICATED COUPLER (LW).png",
      description: "FABRICATED COUPLER (LW) for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_30",
      name: "FABRICATED COUPLER 6KG (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/FABRICATED COUPLER 6KG (LW).png",
      description: "FABRICATED COUPLER 6KG (LW) for agriculture irrigation and piping systems.",
      sizes: ["140MM","160MM"]
    },
    {
      id: "prod_agri_31",
      name: "ELBOW 90 (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/ELBOW 90 (LW).png",
      description: "ELBOW 90 (LW) for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_32",
      name: "END CAP (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/END CAP (LW).png",
      description: "END CAP (LW) for agriculture irrigation and piping systems.",
      sizes: ["40MM","50MM","63MM","75MM","90MM","110MM","140MM","160MM"]
    },
    {
      id: "prod_agri_33",
      name: "LONG BEND (LW)",
      categoryId: "cat_agri",
      categoryName: "Agriculture Pipes & Fittings",
      image: "/images/agri/LONG BEND (LW).png",
      description: "LONG BEND (LW) for agriculture irrigation and piping systems.",
      sizes: ["63MM","75MM","90MM","110MM"]
    },
    {
      id: "prod_hdpe_1",
      name: "PE-100 OD PIPE ISI",
      categoryId: "cat_hdpe",
      categoryName: "HDPE PIPE & FITTINGS",
      image: "/images/hdpe/PE-100 OD PIPE ISI.png",
      description: "PE-100 OD Pipe ISI certified HDPE pipe.",
      sizes: ["20MM", "25MM", "32MM", "40MM", "50MM", "63MM", "75MM", "90MM", "110MM", "125MM", "140MM", "160MM", "180MM", "200MM", "225MM", "250MM"]
    },
    {
      id: "prod_hdpe_2",
      name: "PE-63 OD PIPE ISI",
      categoryId: "cat_hdpe",
      categoryName: "HDPE PIPE & FITTINGS",
      image: "/images/hdpe/PE-63 OD PIPE ISI.png",
      description: "PE-63 OD Pipe ISI certified HDPE pipe.",
      sizes: ["25MM", "32MM", "40MM", "50MM", "63MM", "75MM", "90MM", "110MM"]
    },
    {
      id: "prod_hdpe_3",
      name: "PE-80 OD PIPE ISI",
      categoryId: "cat_hdpe",
      categoryName: "HDPE PIPE & FITTINGS",
      image: "/images/hdpe/PE-80 OD PIPE ISI.png",
      description: "PE-80 OD Pipe ISI certified HDPE pipe.",
      sizes: ["20MM", "25MM", "32MM", "40MM", "50MM", "63MM", "75MM", "90MM", "110MM"]
    },
    {
      id: "prod_hdpe_4",
      name: "HDPE END CAP",
      categoryId: "cat_hdpe",
      categoryName: "HDPE PIPE & FITTINGS",
      image: "/images/hdpe/HDPE END CAP.png",
      description: "HDPE End Cap fitting.",
      sizes: ["90MM", "110MM"]
    },
    {
      id: "prod_hdpe_5",
      name: "PE-63 ID PIPE",
      categoryId: "cat_hdpe",
      categoryName: "HDPE PIPE & FITTINGS",
      image: "/images/hdpe/PE-63 ID PIPE.png",
      description: "PE-63 ID Pipe.",
      sizes: ["40MM", "50MM", "63MM"]
    },
    {
      id: "prod_hdpe_6",
      name: "MDPE PIPE",
      categoryId: "cat_hdpe",
      categoryName: "HDPE PIPE & FITTINGS",
      image: "/images/hdpe/MDPE PIPE.png",
      description: "Medium Density Polyethylene Pipe.",
      sizes: ["20MM"]
    },
    {
      id: "prod_sprinkler_1",
      name: "6M SPRINKLER PIPE ISI",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/6M SPRINKLER PIPE ISI.png",
      description: "6M SPRINKLER PIPE ISI for sprinkler irrigation systems.",
      sizes: ["63MM L TYPE","63MM C TYPE","75MM L TYPE","75MM C TYPE"]
    },
    {
      id: "prod_sprinkler_2",
      name: "6M SPRINKLER PIPE",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/6M SPRINKLER PIPE.png",
      description: "6M SPRINKLER PIPE for sprinkler irrigation systems.",
      sizes: ["63MM L TYPE","63MM C TYPE","75MM L TYPE","75MM C TYPE"]
    },
    {
      id: "prod_sprinkler_3",
      name: "30 NOS SPRINKLER SET ISI",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/30 NOS SPRINKLER SET ISI.png",
      description: "30 NOS SPRINKLER SET ISI for sprinkler irrigation systems.",
      sizes: ["63MM L TYPE","63MM C TYPE","75MM L TYPE","75MM C TYPE"]
    },
    {
      id: "prod_sprinkler_4",
      name: "30 NOS SPRINKLER SET",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/30 NOS SPRINKLER SET.png",
      description: "30 NOS SPRINKLER SET for sprinkler irrigation systems.",
      sizes: ["63MM L TYPE","63MM C TYPE","75MM L TYPE","75MM C TYPE"]
    },
    {
      id: "prod_sprinkler_5",
      name: "SPRINKLER TEE ISI",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER TEE ISI.png",
      description: "SPRINKLER TEE ISI for sprinkler irrigation systems.",
      sizes: ["63MM","75MM"]
    },
    {
      id: "prod_sprinkler_6",
      name: "SPRINKLER FITTINGS ADAPTOR",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS ADAPTOR.png",
      description: "SPRINKLER FITTINGS ADAPTOR for sprinkler irrigation systems.",
      sizes: ["63MM C TYPE","75MM C TYPE","75MM P TYPE"]
    },
    {
      id: "prod_sprinkler_7",
      name: "SPRINKLER FITTINGS BEND",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS BEND.png",
      description: "SPRINKLER FITTINGS BEND for sprinkler irrigation systems.",
      sizes: ["63MM C TYPE","75MM C TYPE","75MM L TYPE"]
    },
    {
      id: "prod_sprinkler_8",
      name: "SPRINKLER FITTINGS END CAP",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS END CAP.png",
      description: "SPRINKLER FITTINGS END CAP for sprinkler irrigation systems.",
      sizes: ["75MM L TYPE","75MM C TYPE","63MM C TYPE"]
    },
    {
      id: "prod_sprinkler_9",
      name: "SPRINKLER FITTINGS LATCH & CLAMP",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS LATCH & CLAMP.png",
      description: "SPRINKLER FITTINGS LATCH & CLAMP for sprinkler irrigation systems.",
      sizes: ["75MM P TYPE","63MM P TYPE"]
    },
    {
      id: "prod_sprinkler_10",
      name: "SPRINKLER FITTINGS PCN",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS PCN.png",
      description: "SPRINKLER FITTINGS PCN for sprinkler irrigation systems.",
      sizes: ["63MM C TYPE","75MM C TYPE","75MM L TYPE"]
    },
    {
      id: "prod_sprinkler_11",
      name: "SPRINKLER FITTINGS NOZZELGUN METAL",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS NOZZELGUN METAL.png",
      description: "SPRINKLER FITTINGS NOZZELGUN METAL for sprinkler irrigation systems.",
      sizes: ["20MM"]
    },
    {
      id: "prod_sprinkler_12",
      name: "SPRINKLER FITTINGS GI RISER PIPE",
      categoryId: "cat_sprinkler",
      categoryName: "Sprinkler Pipes & Fittings",
      image: "/images/sprinkler/SPRINKLER FITTINGS GI RISER PIPE.png",
      description: "SPRINKLER FITTINGS GI RISER PIPE for sprinkler irrigation systems.",
      sizes: ["75MM C TYPE","20MM L TYPE"]
    },
    {
      id: "prod_column_1",
      name: "COLOUMN PIPE ECO V4",
      categoryId: "cat_column",
      categoryName: "UPVC COLUMN PIPES",
      image: "/images/column/COLOUMN PIPE ECO V4.png",
      description: "COLOUMN PIPE ECO V4 for submersible pump systems.",
      sizes: ["33MM 12.5KG COUPLER TYPE","33MM 12.5KG BELL END TYPE","42MM 10KG COUPLER TYPE","42MM 12.5KG COUPLER TYPE","42MM 12.5KG BELL END TYPE","48MM 12.5KG COUPLER TYPE","60MM 12.5KG COUPLER TYPE"]
    },
    {
      id: "prod_column_2",
      name: "COLOUMN PIPE MEDIUM",
      categoryId: "cat_column",
      categoryName: "UPVC COLUMN PIPES",
      image: "/images/column/COLOUMN PIPE MEDIUM.png",
      description: "COLOUMN PIPE MEDIUM for submersible pump systems.",
      sizes: ["33MM 18KG COUPLER TYPE","42MM 18KG COUPLER TYPE","48MM 18KG COUPLER TYPE","60MM 15KG COUPLER TYPE","75MM 10KG COUPLER TYPE"]
    },
    {
      id: "prod_column_3",
      name: "COLOUMN PIPE STANDARD",
      categoryId: "cat_column",
      categoryName: "UPVC COLUMN PIPES",
      image: "/images/column/COLOUMN PIPE STANDARD.png",
      description: "COLOUMN PIPE STANDARD for submersible pump systems.",
      sizes: ["33MM 25KG COUPLER TYPE","42MM 25KG COUPLER TYPE","48MM 25KG COUPLER TYPE","60MM 20KG COUPLER TYPE","75MM 20KG COUPLER TYPE"]
    },
    {
      id: "prod_column_4",
      name: "3M STANDARD PLUS PIPE",
      categoryId: "cat_column",
      categoryName: "UPVC COLUMN PIPES",
      image: "/images/column/3M STANDARD PLUS PIPE.png",
      description: "3M Standard Plus UPVC Column Pipe for submersible pump systems.",
      sizes: ["60MM 25 COUPLER TYPE"]
    },
    {
      id: "prod_column_5",
      name: "COLOUMN PIPE HEAVY",
      categoryId: "cat_column",
      categoryName: "UPVC COLUMN PIPES",
      image: "/images/column/COLOUMN PIPE HEAVY.png",
      description: "COLOUMN PIPE HEAVY for submersible pump systems.",
      sizes: ["42MM 30KG COUPLER TYPE","48MM 30KG COUPLER TYPE","60MM 30KG COUPLER TYPE"]
    },
    {
      id: "prod_column_6",
      name: "COLOUMN PIPE MEDIUM PLUS",
      categoryId: "cat_column",
      categoryName: "UPVC COLUMN PIPES",
      image: "/images/column/COLOUMN PIPE MEDIUM PLUS.png",
      description: "COLOUMN PIPE MEDIUM PLUS for submersible pump systems.",
      sizes: ["60MM 18KG COUPLER TYPE"]
    },
    {
      id: "prod_sanitary_1",
      name: "SINGLE SIDE HANDLE FLUSH 8L",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/SINGLE SIDE HANDLE FLUSH 8L.png",
      description: "8 Litre Single Side Handle Flushing Cistern.",
      sizes: ["8L"]
    },
    {
      id: "prod_sanitary_2",
      name: "CENTER SINGLE PUSH FLUSH 8L",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/CENTER SINGLE PUSH FLUSH 8L.png",
      description: "8 Litre Center Single Push Flushing Cistern.",
      sizes: ["8L"]
    },
    {
      id: "prod_sanitary_3",
      name: "DUAL FLUSH 10L",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/DUAL FLUSH 10L.png",
      description: "10 Litre Dual Flush Cistern.",
      sizes: ["10L"]
    },
    {
      id: "prod_sanitary_4",
      name: "EWC SEAT COVER (WITH JET)",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/EWC SEAT COVER (WITH JET).png",
      description: "EWC Toilet Seat Cover with integrated jet spray.",
      sizes: ["Standard"]
    },
    {
      id: "prod_sanitary_5",
      name: "DUAL FLUSH DUAL COLOUR (PREMIUM 10L)",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/DUAL FLUSH DUAL COLOUR (PREMIUM 10L).png",
      description: "10 Litre Premium Dual Colour Dual Flush Cistern.",
      sizes: ["10L"]
    },
    {
      id: "prod_sanitary_6",
      name: "DUAL FLUSH DUAL COLOUR (ECONOMY 10L)",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/DUAL FLUSH DUAL COLOUR (ECONOMY 10L).png",
      description: "10 Litre Economy Dual Colour Dual Flush Cistern.",
      sizes: ["10L"]
    },
    {
      id: "prod_sanitary_7",
      name: "EWC SEAT COVER (WITHOUT JET)",
      categoryId: "cat_sanitary",
      categoryName: "Toilet Seat Cover & Flushing Cistern",
      image: "/images/sanitary/EWC SEAT COVER (WITHOUT JET).png",
      description: "EWC Toilet Seat Cover without jet spray.",
      sizes: ["Standard"]
    },
    {
      id: "prod_eco_1",
      name: "SELFIT PIPE",
      categoryId: "cat_eco_drainage",
      categoryName: "Eco Drainage Pipes",
      image: "/images/eco_drainage/SELFIT PIPE.png",
      description: "Eco Drainage Selfit Pipe.",
      sizes: ["110MM", "160MM", "200MM", "250MM"]
    },
    {
      id: "prod_eco_2",
      name: "RINGFIT PIPE",
      categoryId: "cat_eco_drainage",
      categoryName: "Eco Drainage Pipes",
      image: "/images/eco_drainage/RINGFIT PIPE.png",
      description: "Eco Drainage Ringfit Pipe.",
      sizes: ["110MM", "160MM", "200MM", "250MM"]
    },
    {
      id: "prod_garden_1",
      name: "ORA FLOW - HEAVY DUTY PIPE",
      categoryId: "cat_garden",
      categoryName: "Garden, Braided & LDPE Pipes",
      image: "/images/garden/ORA FLOW - HEAVY DUTY PIPE.png",
      description: "Ora Flow Heavy Duty Garden Pipe.",
      sizes: ["15MM", "20MM", "25MM", "32MM"]
    },
    {
      id: "prod_garden_2",
      name: "GAP-ORA BRAIDED PIPE",
      categoryId: "cat_garden",
      categoryName: "Garden, Braided & LDPE Pipes",
      image: "/images/garden/GAP-ORA BRAIDED PIPE.png",
      description: "GAP-ORA BRAIDED PIPE.",
      sizes: ["15MM 1/2", "20MM 3/4", "25MM 1", "32MM 1 1/4"]
    },
    {
      id: "prod_garden_3",
      name: "GARDEN FOAM PIPES",
      categoryId: "cat_garden",
      categoryName: "Garden, Braided & LDPE Pipes",
      image: "/images/garden/GARDEN FOAM PIPES.png",
      description: "GARDEN FOAM PIPES.",
      sizes: ["15MM 1/2", "20MM 3/4", "20MM 3/4 20MTR", "25MM 1", "32MM 1 1/4"]
    },
    {
      id: "prod_garden_4",
      name: "BRAIDED PIPE",
      categoryId: "cat_garden",
      categoryName: "Garden, Braided & LDPE Pipes",
      image: "/images/garden/BRAIDED PIPE.png",
      description: "Reinforced Braided Garden Pipe.",
      sizes: ["15MM 1/2", "20MM 3/4", "25MM 1", "32MM 1 1/4"]
    },
    {
      id: "prod_garden_5",
      name: "LEVEL PIPE",
      categoryId: "cat_garden",
      categoryName: "Garden, Braided & LDPE Pipes",
      image: "/images/garden/LEVEL PIPE.png",
      description: "Transparent Level Pipe for construction & garden work.",
      sizes: ["6MM"]
    },
    {
      id: "prod_garden_6",
      name: "GARDEN PIPES SUPER FLOW",
      categoryId: "cat_garden",
      categoryName: "Garden, Braided & LDPE Pipes",
      image: "/images/garden/GARDEN PIPES SUPER FLOW.png",
      description: "GARDEN PIPES SUPER FLOW.",
      sizes: ["15MM 1/2", "20MM 3/4", "20MM 3/4 15MTR", "25MM 1", "32MM 1 1/4", "40MM 1 1/2"]
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

function seedProducts(data) {
  data.products = data.products.map(prod => {
    if (prod.sizes) return prod;
    if (prod.categoryId === 'cat_tanks') {
      prod.sizes = ["200L", "300L", "500L", "750L", "1000L", "1500L", "2000L", "5000L"];
    } else if (['cat_cpvc', 'cat_upvc', 'cat_swr', 'cat_casing', 'cat_agri', 'cat_hdpe', 'cat_sprinkler', 'cat_column', 'cat_eco_drainage', 'cat_garden'].includes(prod.categoryId)) {
      prod.sizes = ["1/2 inch", "3/4 inch", "1 inch", "1 1/4 inch", "1 1/2 inch", "1.5 inch", "2 inch", "2 1/2 inch", "3 inch", "4 inch", "5 inch", "6 inch"];
    } else {
      prod.sizes = ["Standard"];
    }
    return prod;
  });
  return data;
}

async function readData() {
  // Return cached data if still fresh
  if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedData;
  }

  let fileData = null;
  // Load from local DB_FILE if exists
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      fileData = JSON.parse(raw);
    }
  } catch (e) {
    console.error('❌ Failed to read DB_FILE:', e);
  }

  await connectCouchbase();
  let cbData = null;

  if (isCouchbaseConnected) {
    try {
      const result = await cbCollection.get(COUCHBASE_DOC_KEY);
      cbData = result.value;
    } catch (err) {
      if (err.constructor && err.constructor.name === 'DocumentNotFoundError') {
        const seeded = fileData || seedProducts({ ...initialData });
        await cbCollection.upsert(COUCHBASE_DOC_KEY, seeded);
        cbData = seeded;
      } else {
        console.error('❌ Couchbase read error:', err.message || err);
      }
    }
  }

  // Merge fileData and cbData so added products/categories are never lost across logouts/logins
  let finalData = cbData || fileData || seedProducts({ ...initialData });

  if (fileData && cbData) {
    // Merge products
    const productMap = new Map();
    (fileData.products || []).forEach(p => productMap.set(p.id, p));
    (cbData.products || []).forEach(p => productMap.set(p.id, p));
    finalData.products = Array.from(productMap.values());

    // Merge categories
    const catMap = new Map();
    (fileData.categories || []).forEach(c => catMap.set(c.id, c));
    (cbData.categories || []).forEach(c => catMap.set(c.id, c));
    finalData.categories = Array.from(catMap.values());

    // Merge subcategories
    const subCatMap = new Map();
    (fileData.subCategories || []).forEach(s => subCatMap.set(s.id, s));
    (cbData.subCategories || []).forEach(s => subCatMap.set(s.id, s));
    finalData.subCategories = Array.from(subCatMap.values());

    // Merge users
    const userMap = new Map();
    (fileData.users || []).forEach(u => userMap.set(u.id, u));
    (cbData.users || []).forEach(u => userMap.set(u.id, u));
    finalData.users = Array.from(userMap.values());
  }

  // Auto-sync merged dataset back to disk so db_data.json is always complete
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(finalData, null, 2));
  } catch (e) {}

  cachedData = finalData;
  cacheTimestamp = Date.now();
  return finalData;
}

async function writeData(data) {
  // Invalidate in-memory cache on write so next read gets fresh data
  cachedData = data;
  cacheTimestamp = Date.now();

  // 1. Local disk JSON write (guarantees local db_data.json is always synced)
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Auto-synced changes to db_data.json');
  } catch (err) {
    console.error('❌ Local DB write error:', err);
  }

  // 2. Couchbase Cloud Persistence Sync
  await connectCouchbase();
  if (isCouchbaseConnected) {
    try {
      await cbCollection.upsert(COUCHBASE_DOC_KEY, data);
      console.log('✅ Auto-synced changes to Couchbase cluster.');
    } catch (err) {
      console.error('❌ Couchbase write error:', err.message || err);
    }
  }
}

module.exports = {
  readData,
  writeData
};
