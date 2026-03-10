/**
 * NutriKart — Schema Migration Script
 * Run: node run_migration.js
 * Adds all missing columns to the 'restaurants' table in Supabase.
 */
const { Client } = require('pg');
require('dotenv').config();

// Build the Postgres connection string from Supabase project ID
const SUPABASE_URL = process.env.SUPABASE_URL; // e.g. https://kvvzsslchxdaroygizka.supabase.co
const projectRef = SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

if (!projectRef) {
    console.error('Could not parse Supabase project reference from SUPABASE_URL');
    process.exit(1);
}

// Supabase Postgres direct connection string
const connectionString = `postgresql://postgres:${encodeURIComponent(process.env.DB_PASSWORD || 'postgres')}@db.${projectRef}.supabase.co:5432/postgres`;

// If DB_PASSWORD env is not set, we need a different approach using the REST API
// Let's use the Supabase Management API or the supabase-js client with exec_sql rpc
// Since the pg approach needs DB_PASSWORD, we'll use supabase-js with a custom admin query

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const columnsToAdd = [
    { name: 'contact_number', type: 'TEXT' },
    { name: 'owner_name', type: 'TEXT' },
    { name: 'owner_phone', type: 'TEXT' },
    { name: 'owner_email', type: 'TEXT' },
    { name: 'opening_time', type: 'TEXT' },
    { name: 'closing_time', type: 'TEXT' },
    { name: 'prep_time', type: 'NUMERIC' },
    { name: 'owner_address', type: 'TEXT' },
    { name: 'trade_authority', type: 'TEXT' },
    { name: 'trade_doc_url', type: 'TEXT' },
    { name: 'aadhaar_front_url', type: 'TEXT' },
    { name: 'aadhaar_back_url', type: 'TEXT' },
    { name: 'kitchen_photo', type: 'TEXT' },
    { name: 'allergen_info', type: 'TEXT' },
    { name: 'cooking_oil_type', type: 'TEXT' },
    { name: 'fssai_doc_url', type: 'TEXT' },
    { name: 'approved_at', type: 'TIMESTAMPTZ' },
];

async function migrate() {
    console.log('Testing which columns already exist...');

    // Get the current columns by doing a dummy select
    const { data, error } = await supabase.from('restaurants').select('*').limit(1);

    let existingCols = [];
    if (error) {
        // Try to parse which column is missing from the error
        console.log('Initial read error:', error.message);
    } else if (data && data.length > 0) {
        existingCols = Object.keys(data[0]);
        console.log('Existing columns:', existingCols);
    } else {
        console.log('Table is empty but accessible. Will test missing columns individually.');
    }

    // Test each new column with individual SELECT queries to detect missing ones
    const missing = [];
    for (const col of columnsToAdd) {
        if (existingCols.includes(col.name)) {
            console.log(`✓ Column '${col.name}' already exists`);
            continue;
        }
        const { error: testErr } = await supabase.from('restaurants').select(col.name).limit(1);
        if (testErr && testErr.message && testErr.message.includes(col.name)) {
            console.log(`✗ Missing column: '${col.name}'`);
            missing.push(col);
        } else {
            console.log(`✓ Column '${col.name}' exists`);
        }
    }

    if (missing.length === 0) {
        console.log('\n✅ All columns already exist in the database!');
        console.log('The issue is that your running backend process has a schema cache issue.');
        console.log('Please restart your backend (Ctrl+C in backend terminal then npm run dev).');
        return;
    }

    console.log(`\n❌ ${missing.length} missing columns detected: ${missing.map(c => c.name).join(', ')}`);
    console.log('\nTo add these columns, run the following SQL in your Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
    console.log('═'.repeat(80));

    let sql = '';
    for (const col of missing) {
        sql += `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};\n`;
    }
    sql += `\n-- Notify PostgREST to reload its schema cache\nNOTIFY pgrst, 'reload schema';`;

    console.log(sql);
    console.log('═'.repeat(80));
    console.log('\nCopy 👆 that SQL and paste it into the Supabase SQL Editor, then click "Run".');
    console.log('After that, restart your backend server.\n');
}

migrate().catch(console.error);
