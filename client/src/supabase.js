import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase credentials
const SUPABASE_URL = 'https://riflxhbxduomczyszbmw.supabase.co';  // From dashboard
const SUPABASE_ANON_KEY = 'sb_publishable_7u3Cw97RkUPhkGr0kCTYFA_LhXqFTle';  // Public anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);