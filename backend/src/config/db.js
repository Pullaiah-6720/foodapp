const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const fetch = require('node-fetch');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(
    supabaseUrl || "https://placeholder-url.supabase.co",
    supabaseKey || "placeholder-key",
    {
        global: {
            fetch: fetch
        }
    }
);

module.exports = supabase;
