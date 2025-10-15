// Test Supabase Database Connection
// Run with: node scripts/test-db.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Make sure you have:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔄 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('venues').select('count');
    if (error) throw error;
    console.log('✅ Basic connection successful\n');

    // Test 2: Check if tables exist
    console.log('2. Checking database tables...');
    const tables = ['users', 'venues', 'matches', 'messages', 'likes', 'check_ins'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' - ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - ${err.message}`);
      }
    }

    // Test 3: Check demo venues
    console.log('\n3. Checking demo venues...');
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*');
    
    if (venuesError) {
      console.log('❌ Error fetching venues:', venuesError.message);
    } else {
      console.log(`✅ Found ${venues.length} demo venues:`);
      venues.forEach(venue => {
        console.log(`   - ${venue.name} (${venue.type})`);
      });
    }

    console.log('\n🎉 Database setup test completed!');
    console.log('\nNext steps:');
    console.log('1. Your database is ready to use');
    console.log('2. You can start testing the registration/login flow');
    console.log('3. Check your Supabase dashboard for real-time data');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you have the correct API keys in .env.local');
    console.log('2. Verify you ran the setup-database.sql in Supabase SQL Editor');
    console.log('3. Check your Supabase project is active');
  }
}

testDatabase();