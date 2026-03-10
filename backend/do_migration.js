const https = require('https');
require('dotenv').config();

const url = new URL(process.env.SUPABASE_URL);
const projectRef = url.hostname.split('.')[0];

const sql = `
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_time TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS closing_time TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS prep_time NUMERIC;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_address TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS trade_authority TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS trade_doc_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS kitchen_photo TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS allergen_info TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cooking_oil_type TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS fssai_doc_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
NOTIFY pgrst, 'reload schema';
`;

const body = JSON.stringify({ query: sql });

const options = {
    hostname: `${projectRef}.supabase.co`,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('RESPONSE:', data);
        if (res.statusCode === 200 || res.statusCode === 204) {
            console.log('\n✅ Migration successful! Schema updated.');
        } else {
            console.log('\n❌ Could not run via RPC. Manual SQL required.');
            printManualSQL();
        }
    });
});

req.on('error', (e) => {
    console.error('Request failed:', e.message);
    printManualSQL();
});

req.write(body);
req.end();

function printManualSQL() {
    console.log('\n========================================');
    console.log('PASTE THIS SQL IN SUPABASE SQL EDITOR:');
    console.log('========================================');
    console.log(sql);
}
