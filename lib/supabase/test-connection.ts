import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhgpswjsphnkrkvibvsx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ3Bzd2pzcGhua3JrdmlidnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTY2OTEsImV4cCI6MjA3Njc5MjY5MX0.xl-BKaYIfIq1HyE2koON9yUJrD5jR-wi72lYmeGTjUU';

export async function testSupabaseConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('venues').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful!');
    return { success: true, data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: 'Failed to connect to Supabase' };
  }
}

export async function testDatabaseSchema() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test if main tables exist
    const tables = ['users', 'venues', 'matches', 'messages', 'likes', 'check_ins'];
    const results = [];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          results.push({ table, exists: false, error: error.message });
        } else {
          results.push({ table, exists: true });
        }
      } catch (err) {
        results.push({ table, exists: false, error: 'Connection failed' });
      }
    }
    
    console.log('Database schema test results:', results);
    return results;
  } catch (error) {
    console.error('Schema test failed:', error);
    return [];
  }
}