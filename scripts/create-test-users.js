#!/usr/bin/env node

/**
 * Script to create test users in Supabase
 * Run this after seeding your database to create the auth users
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Test user credentials
    const testUsers = [
      {
        email: 'admin@guepard.run',
        password: 'admin123',
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        role: 'OWNER'
      },
      {
        email: 'hr@guepard.run',
        password: 'hr123',
        firstName: 'Fatma',
        lastName: 'Trabelsi',
        role: 'HR'
      },
      {
        email: 'manager@guepard.run',
        password: 'manager123',
        firstName: 'Mohamed',
        lastName: 'Karray',
        role: 'MANAGER'
      },
      {
        email: 'employee@guepard.run',
        password: 'employee123',
        firstName: 'Sara',
        lastName: 'Mansouri',
        role: 'EMPLOYEE'
      }
    ];

    for (const user of testUsers) {
      console.log(`Creating user: ${user.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName
        }
      });

      if (authError) {
        console.error(`Error creating auth user for ${user.email}:`, authError);
        continue;
      }

      console.log(`Auth user created: ${authData.user.id}`);

      // Update the accounts table with the auth_user_id
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ 
          auth_user_id: authData.user.id,
          is_active: true
        })
        .eq('email', user.email);

      if (updateError) {
        console.error(`Error updating account for ${user.email}:`, updateError);
      } else {
        console.log(`Account updated for ${user.email}`);
      }
    }

    console.log('Test users setup complete!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestUsers();
