require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('COLOQUE_SUA_URL_AQUI')) {
    console.warn('⚠️ AVISO: SUPABASE_URL ou SUPABASE_KEY não configuradas corretamente no arquivo .env!');
}

// Cria o cliente Supabase
const supabase = createClient(supabaseUrl || 'https://fake.supabase.co', supabaseKey || 'fake-key');

module.exports = supabase;
