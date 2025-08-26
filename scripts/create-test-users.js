#!/usr/bin/env node

/**
 * Script to create test users in Supabase
 * Run this after seeding your database to create the auth users
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54421';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nk0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
    password: 'hr123',
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
  console.log('Creating test users in Supabase auth...');
  
  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      // Create user in Supabase auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName
        }
      });
      
      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message);
        continue;
      }
      
      console.log(`✅ Created auth user: ${user.email} (ID: ${authUser.user.id})`);
      
      // Update the accounts table to link the auth_user_id
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ auth_user_id: authUser.user.id })
        .eq('email', user.email);
      
      if (updateError) {
        console.error(`Error updating account ${user.email}:`, updateError.message);
      } else {
        console.log(`✅ Linked account ${user.email} to auth user`);
      }
      
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Test users creation completed!');
  console.log('\nYou can now login with these credentials:');
  testUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });
}

createTestUsers().catch(console.error);
