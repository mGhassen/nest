#!/usr/bin/env node

/**
 * Script to create multi-company users in Supabase
 * Creates auth users, accounts, and user_company_roles for multi-company support
 * Users can have different roles in different companies
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54421';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

// Multi-company users with their roles in different companies
const multiCompanyUsers = [
  // Ahmed - Super User with access to ALL companies
  {
    email: 'admin@guepard.run',
    password: 'admin123',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    isSuperuser: true,
    companies: [
      { name: 'Guepard', is_admin: true },
      { name: 'TechCorp', is_admin: true },
      { name: 'InnovateLab', is_admin: true }
    ]
  },
  // Test Superuser - Superuser with no companies (for onboarding testing)
  {
    email: 'superuser@test.com',
    password: 'superuser123',
    firstName: 'Test',
    lastName: 'Superuser',
    isSuperuser: true,
    companies: [] // No companies - should trigger onboarding
  },
  // Fatma - HR Manager at Guepard, HR Consultant at TechCorp
  {
    email: 'hr@guepard.run',
    password: 'hr12345',
    firstName: 'Fatma',
    lastName: 'Trabelsi',
    companies: [
      { name: 'Guepard', is_admin: true },
      { name: 'TechCorp', is_admin: false }
    ]
  },
  // Mohamed - Engineering Manager at Guepard, Technical Advisor at InnovateLab
  {
    email: 'manager@guepard.run',
    password: 'manager123',
    firstName: 'Mohamed',
    lastName: 'Karray',
    companies: [
      { name: 'Guepard', is_admin: false },
      { name: 'InnovateLab', is_admin: false }
    ]
  },
  // Sara - Developer at Guepard only
  {
    email: 'employee@guepard.run',
    password: 'employee123',
    firstName: 'Sara',
    lastName: 'Mansouri',
    companies: [
      { name: 'Guepard', is_admin: false }
    ]
  },
  // John - CEO at TechCorp, Board Member at Guepard
  {
    email: 'admin@techcorp.com',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Smith',
    companies: [
      { name: 'TechCorp', is_admin: true },
      { name: 'Guepard', is_admin: true }
    ]
  },
  // Emily - HR Director at TechCorp, HR Consultant at InnovateLab
  {
    email: 'hr@techcorp.com',
    password: 'hr12345',
    firstName: 'Emily',
    lastName: 'Johnson',
    companies: [
      { name: 'TechCorp', is_admin: true },
      { name: 'InnovateLab', is_admin: false }
    ]
  },
  // Michael - Engineering Manager at TechCorp only
  {
    email: 'manager@techcorp.com',
    password: 'manager123',
    firstName: 'Michael',
    lastName: 'Brown',
    companies: [
      { name: 'TechCorp', is_admin: false }
    ]
  },
  // Sarah - Developer at TechCorp, Technical Advisor at InnovateLab
  {
    email: 'employee@techcorp.com',
    password: 'employee123',
    firstName: 'Sarah',
    lastName: 'Davis',
    companies: [
      { name: 'TechCorp', is_admin: false },
      { name: 'InnovateLab', is_admin: false }
    ]
  },
  // Pierre - CEO at InnovateLab, Technical Partner at TechCorp
  {
    email: 'admin@innovatelab.fr',
    password: 'admin123',
    firstName: 'Pierre',
    lastName: 'Dubois',
    companies: [
      { name: 'InnovateLab', is_admin: true },
      { name: 'TechCorp', is_admin: true }
    ]
  },
  // Marie - HR Manager at InnovateLab, HR Consultant at Guepard
  {
    email: 'hr@innovatelab.fr',
    password: 'hr12345',
    firstName: 'Marie',
    lastName: 'Martin',
    companies: [
      { name: 'InnovateLab', is_admin: true },
      { name: 'Guepard', is_admin: false }
    ]
  },
  // Jean - R&D Manager at InnovateLab, Technical Advisor at Guepard
  {
    email: 'manager@innovatelab.fr',
    password: 'manager123',
    firstName: 'Jean',
    lastName: 'Leroy',
    companies: [
      { name: 'InnovateLab', is_admin: false },
      { name: 'Guepard', is_admin: false }
    ]
  },
  // Sophie - R&D Engineer at InnovateLab only
  {
    email: 'employee@innovatelab.fr',
    password: 'employee123',
    firstName: 'Sophie',
    lastName: 'Moreau',
    companies: [
      { name: 'InnovateLab', is_admin: false }
    ]
  }
];

async function createMultiCompanyUsers() {
  console.log('🚀 Creating multi-company users in Supabase auth...\n');
  
  // Get company IDs
  const companyIds = await getCompanyIds();
  console.log(`🏢 Found companies: ${Object.keys(companyIds).join(', ')}\n`);
  
  for (const user of multiCompanyUsers) {
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
      
      // Step 2: Create account
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: authUser.user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          is_active: true,
          is_superuser: user.isSuperuser || false
        })
        .select()
        .single();
      
      if (accountError) {
        console.error(`❌ Account creation error: ${accountError.message}`);
        continue;
      }
      
      console.log(`✅ Account created: ${account.id}`);
      
      // Step 3: Create account_company_roles for each company
      for (const companyRole of user.companies) {
        const companyId = companyIds[companyRole.name];
        if (!companyId) {
          console.error(`❌ Company not found: ${companyRole.name}`);
          continue;
        }
        
        const { data: accountCompanyRole, error: roleError } = await supabase
          .from('account_company_roles')
          .insert({
            account_id: account.id,
            company_id: companyId,
            is_admin: companyRole.is_admin
          })
          .select()
          .single();
        
        if (roleError) {
          console.error(`❌ Account company role creation error: ${roleError.message}`);
          continue;
        }
        
        console.log(`✅ Role created: ${companyRole.role} at ${companyRole.name}`);
      }
      
      // Special case: If user has no companies but is a superuser
      if (user.companies.length === 0 && user.isSuperuser) {
        console.log(`✅ Superuser with no companies - will be redirected to onboarding`);
      }
      
      // Step 4: Link employees to account (for each company the user works in)
      for (const companyRole of user.companies) {
        const companyId = companyIds[companyRole.name];
        if (!companyId) continue;
        
        const { data: employeeUpdate, error: employeeError } = await supabase
          .from('employees')
          .update({ account_id: account.id })
          .eq('email', user.email)
          .eq('company_id', companyId)
          .select();
        
        if (employeeError) {
          console.error(`❌ Employee linking error: ${employeeError.message}`);
          continue;
        }
        
        if (employeeUpdate && employeeUpdate.length > 0) {
          console.log(`✅ Employee linked: ${employeeUpdate[0].id} at ${companyRole.name}`);
        }
      }
      
      // Step 5: Set current company (only if user has companies)
      if (user.companies.length > 0) {
        const adminCompany = user.companies.find(c => c.role === 'ADMIN');
        const defaultCompany = adminCompany || user.companies[0]; // Use ADMIN company if available, otherwise first company
        const defaultCompanyId = companyIds[defaultCompany.name];
        
        const { data: accountUpdate, error: accountUpdateError } = await supabase
          .from('accounts')
          .update({ current_company_id: defaultCompanyId })
          .eq('id', account.id)
          .select()
          .single();
        
        if (accountUpdateError) {
          console.error(`❌ Account update error: ${accountUpdateError.message}`);
        } else {
          console.log(`✅ Current company set: ${defaultCompany.name} (${defaultCompany.role})`);
        }
      } else {
        console.log(`✅ No companies assigned - user will be redirected to onboarding`);
      }
      
      console.log(`✅ User ${user.email} completed successfully!\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${user.email}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 All multi-company users creation completed!');
  console.log('\n🔐 Login Credentials:');
  multiCompanyUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });
  
  console.log('\n💡 What was created:');
  console.log('1. Auth users in Supabase auth');
  console.log('2. Accounts in accounts table');
  console.log('3. Account company roles in account_company_roles table');
  console.log('4. Current company set in accounts.current_company_id');
  console.log('5. Employees linked to accounts for each company');
  console.log('\n🏢 Multi-Company Examples:');
  console.log('- Ahmed: SUPERUSER at ALL companies (Guepard, TechCorp, InnovateLab)');
  console.log('- Test Superuser: SUPERUSER with NO companies (will trigger onboarding)');
  console.log('- John: ADMIN at TechCorp, ADMIN at Guepard');
  console.log('- Pierre: ADMIN at InnovateLab, ADMIN at TechCorp');
  console.log('- Fatma: ADMIN at Guepard, EMPLOYEE at TechCorp');
  console.log('- Sarah: EMPLOYEE at TechCorp, EMPLOYEE at InnovateLab');
  console.log('- Others: Various multi-company roles');
  console.log('\n🔄 Company Switching:');
  console.log('- Users can switch between companies they have access to');
  console.log('- Each company has its own role and permissions');
  console.log('- Current company is remembered in accounts table');
  console.log('- Super admins can access all companies with admin privileges');
}

// Helper function to get company IDs
async function getCompanyIds() {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name');
  
  if (error) {
    throw new Error(`Failed to get companies: ${error.message}`);
  }
  
  const companyIds = {};
  companies.forEach(company => {
    companyIds[company.name] = company.id;
  });
  
  return companyIds;
}

createMultiCompanyUsers().catch(console.error);
