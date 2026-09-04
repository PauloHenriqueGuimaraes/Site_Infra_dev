require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
const supabaseKey = String(process.env.SUPABASE_KEY || '').trim();
const isConfigured = Boolean(supabaseUrl && supabaseKey);

const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseKey, {
          auth: {
              persistSession: false,
              autoRefreshToken: false
          }
      })
    : null;

if (!isConfigured) {
    console.warn('Supabase não configurado. Preencha SUPABASE_URL e SUPABASE_KEY no arquivo .env.');
}

module.exports = { supabase, isConfigured };
