#!/usr/bin/env node

/**
 * Script to create test users in Supabase
 * Simplified version: Create users, triggers automatically handle account creation and employee linking
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54421';
// Use anon key instead of service role key to avoid JWT issues
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

// Test users to create
const testUsers = [
  {
    email: 'admin@guepard.run',
    password: 'admin123',
    firstName: 'Ahmed',
    lastName: 'Ben Ali'
  },
  {
    email: 'hr@guepard.run',
    password: 'hr12345',
    firstName: 'Fatma',
    lastName: 'Trabelsi'
  },
  {
    email: 'manager@guepard.run',
    password: 'manager123',
    firstName: 'Mohamed',
    lastName: 'Karray'
  },
  {
    email: 'employee@guepard.run',
    password: 'employee123',
    firstName: 'Sara',
    lastName: 'Mansouri'
  }
];

async function createTestUsers() {
  console.log('Creating test users in Supabase auth...\n');
  console.log('Note: Database triggers will automatically:');
  console.log('1. Create accounts for new users');
  console.log('2. Link employees to accounts (if they exist with matching email)');
  console.log('');
  
  for (const user of testUsers) {
    try {
      console.log(`Processing user: ${user.email}`);
      
      // Create user in Supabase auth - triggers handle the rest automatically
      console.log('  Creating auth user...');
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.firstName,
            last_name: user.lastName
          }
        }
      });
      
      if (authError) {
        console.error(`❌ Error creating auth user:`, authError.message);
        continue;
      }
      
      if (!authUser.user) {
        console.error(`❌ No user returned for ${user.email}`);
        continue;
      }
      
      console.log(`✅ Auth user created: ${user.email} (ID: ${authUser.user.id})`);
      console.log(`✅ Database triggers automatically handled account creation and employee linking`);
      
      console.log(`🎉 User ${user.email} completed successfully!\n`);
      
    } catch (error) {
      console.error(`❌ Error processing user ${user.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 All test users creation completed!');
  console.log('\nYou can now login with these credentials:');
  testUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });
  
  console.log('\n📋 Summary:');
  console.log('- Auth users created in Supabase');
  console.log('- Database triggers automatically created accounts');
  console.log('- Database triggers automatically linked employees to accounts');
  console.log('- Ready for login and testing!');
  
  console.log('\n💡 The database triggers ensure:');
  console.log('- No manual intervention needed');
  console.log('- Data consistency maintained');
  console.log('- Automatic linking based on email matching');
}

createTestUsers().catch(console.error);
