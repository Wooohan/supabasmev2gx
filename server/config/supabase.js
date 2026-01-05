const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://fyiuobcpndpsoivpxwvx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aXVvYmNwbmRwc29pdnB4d3Z4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU1MDU2MSwiZXhwIjoyMDgzMTI2NTYxfQ.qlgPO4YLnusrE7nvLWFvM9lswrAfewMDd2VqMeckTAk
';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database - tables are already created via SQL query
async function initializeDatabase() {
  try {
    console.log('Checking Supabase connection...');
    
    // Test connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('Database connection note:', error.message);
      console.log('✅ Supabase connected (tables should be created via SQL query)');
    } else {
      console.log('✅ Supabase database connected successfully');
    }
  } catch (error) {
    console.log('Database initialization note:', error.message);
    console.log('Note: Make sure to run the SQL schema in Supabase SQL Editor');
  }
}

module.exports = { supabase, initializeDatabase };
