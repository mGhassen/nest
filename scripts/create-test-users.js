#!/usr/bin/env node

/**
 * Script to create test users in Supabase
 * Creates auth users, then manually creates accounts with roles and links employees
 * Roles are now managed in the accounts table for access control
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54421';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

// Test users to create with their roles
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
    password: 'hr12345',
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

async function createTestUsers() {
  console.log('🚀 Creating test users in Supabase auth...\n');
  
  // Get company ID once at the beginning
  const companyId = await getCompanyId();
  console.log(`🏢 Using company ID: ${companyId}\n`);
  
  for (const user of testUsers) {
    try {
      console.log(`📝 Creating user: ${user.email}`);
      
      // Step 1: Create auth user
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
        console.error(`❌ Auth error: ${authError.message}`);
        continue;
      }
      
      if (!authUser.user) {
        console.error(`❌ No user returned for ${user.email}`);
        continue;
      }
      
      console.log(`✅ Auth user created: ${user.email} (ID: ${authUser.user.id})`);
      
      // Step 2: Create account with role
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: authUser.user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          is_active: true
        })
        .select()
        .single();
      
      if (accountError) {
        console.error(`❌ Account creation error: ${accountError.message}`);
        continue;
      }
      
      console.log(`✅ Account created: ${account.id}`);
      
      // Step 3: Link employee to account
      const { data: employeeUpdate, error: employeeError } = await supabase
        .from('employees')
        .update({ account_id: account.id })
        .eq('email', user.email)
        .select()
        .single();
      
      if (employeeError) {
        console.error(`❌ Employee linking error: ${employeeError.message}`);
        continue;
      }
      
      console.log(`✅ Employee linked: ${employeeUpdate.id}`);
      console.log(` User ${user.email} completed successfully!\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${user.email}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 All test users creation completed!');
  console.log('\n�� Login Credentials:');
  testUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });
  
  console.log('\n💡 What was created:');
  console.log('1. Auth users in Supabase auth');
  console.log('2. Accounts in accounts table with roles for access control');
  console.log('3. Employees linked to accounts (roles managed in accounts table)');
  console.log('4. Users can now login and access the system based on their role');
}

// Helper function to get company ID
async function getCompanyId() {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Guepard');
  
  if (error) {
    throw new Error(`Failed to get company ID: ${error.message}`);
  }
  
  if (!companies || companies.length === 0) {
    throw new Error('No company found with name "Guepard"');
  }
  
  return companies[0].id;
}

createTestUsers().catch(console.error);