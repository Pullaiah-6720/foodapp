const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

(async () => {
    try {
        console.log("Starting DB migration...");

        // Let's create a single SQL script string
        const sql = `
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS contact_number TEXT;
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_name TEXT;
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_phone TEXT;
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_email TEXT;
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_time TIME;
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS closing_time TIME;
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
            ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
            
            -- Request PostgREST to reload its schema cache so the new columns are immediately available
            NOTIFY pgrst, 'reload schema';
        `;

        // The JS client cannot execute raw SQL without an RPC endpoint. 
        // We will do a generic insert query to check if the schema is cached correctly
        // We'll create a dummy record if we have an API, but since we cannot alter schema natively via JS,
        // we can tell the user they need to run these commands in the Supabase SQL editor.

    } catch (err) {
        console.error(err);
    }
})();
