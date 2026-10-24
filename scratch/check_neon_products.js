const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT jsonb_array_length(data->'products') as total, updated_at FROM app_state WHERE key = 'appdata'`;
  console.log('Neon DB Status:', rows);
  
  const prodRow = await sql`SELECT data->'products' as products FROM app_state WHERE key = 'appdata'`;
  const prods = prodRow[0].products;
  console.log('Total products in Neon DB:', prods.length);

  const p3 = prods.find(p => p.id === 'prod_agri_3');
  const p4 = prods.find(p => p.id === 'prod_agri_4');
  console.log('p3:', p3.name, 'sizeProductCodes:', p3.sizeProductCodes);
  console.log('p4:', p4.name, 'sizeProductCodes:', p4.sizeProductCodes);

  const deletedIds = [
    'prod_solvent_9',
    'prod_drip_round_isi_3',
    'prod_drip_flat_isi_1',
    'prod_drip_flat_isi_2',
    'prod_drip_flat_isi_3',
    'prod_drip_round_online_1',
    'prod_drip_round_online_2',
    'prod_drip_round_online_3',
    'prod_drip_round_online_4'
  ];
  const foundDeleted = prods.filter(p => deletedIds.includes(p.id));
  console.log('Deleted products remaining:', foundDeleted.length);
}

check().catch(console.error);
