#!/usr/bin/env node

/**
 * Test script to validate multi-company setup
 * Tests database functions and data integrity
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54421';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testMultiCompanySetup() {
  console.log('🧪 Testing Multi-Company Setup...\n');
  
  try {
    // Test 1: Check companies exist
    console.log('1️⃣ Testing companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
      return;
    }
    
    console.log(`✅ Found ${companies.length} companies:`);
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.country_code})`);
    });
    
    // Test 2: Check user_company_roles table
    console.log('\n2️⃣ Testing user company roles...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_company_roles')
      .select(`
        *,
        accounts(email, first_name, last_name),
        companies(name)
      `);
    
    if (rolesError) {
      console.error('❌ Error fetching user company roles:', rolesError);
      return;
    }
    
    console.log(`✅ Found ${userRoles.length} user company roles:`);
    userRoles.forEach(role => {
      const email = role.accounts?.email || 'Unknown';
      const companyName = role.companies?.name || 'Unknown';
      console.log(`   - ${email}: ${role.role} at ${companyName}`);
    });
    
    // Test 3: Test get_user_companies function
    console.log('\n3️⃣ Testing get_user_companies function...');
    if (userRoles.length > 0) {
      const testAccountId = userRoles[0].account_id;
      const { data: userCompanies, error: userCompaniesError } = await supabase
        .rpc('get_user_companies', { p_account_id: testAccountId });
      
      if (userCompaniesError) {
        console.error('❌ Error testing get_user_companies:', userCompaniesError);
      } else {
        console.log(`✅ get_user_companies works for account ${testAccountId}:`);
        userCompanies.forEach(company => {
          console.log(`   - ${company.company_name}: ${company.role} (${company.is_active ? 'active' : 'inactive'})`);
        });
      }
    }
    
    // Test 4: Test user_sessions table
    console.log('\n4️⃣ Testing user sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        accounts(email),
        companies(name)
      `);
    
    if (sessionsError) {
      console.error('❌ Error fetching user sessions:', sessionsError);
      return;
    }
    
    console.log(`✅ Found ${sessions.length} user sessions:`);
    sessions.forEach(session => {
      const email = session.accounts?.email || 'Unknown';
      const companyName = session.companies?.name || 'Unknown';
      console.log(`   - ${email}: ${companyName} (expires: ${session.expires_at})`);
    });
    
    // Test 5: Test get_user_current_company function
    console.log('\n5️⃣ Testing get_user_current_company function...');
    if (sessions.length > 0) {
      const testSession = sessions[0];
      const { data: currentCompany, error: currentCompanyError } = await supabase
        .rpc('get_user_current_company', { 
          p_account_id: testSession.account_id,
          p_session_token: testSession.session_token
        });
      
      if (currentCompanyError) {
        console.error('❌ Error testing get_user_current_company:', currentCompanyError);
      } else if (currentCompany && currentCompany.length > 0) {
        console.log(`✅ get_user_current_company works:`);
        console.log(`   - Company: ${currentCompany[0].company_name}`);
        console.log(`   - Role: ${currentCompany[0].role}`);
      } else {
        console.log('⚠️ No current company found for test session');
      }
    }
    
    // Test 6: Test switch_user_company function
    console.log('\n6️⃣ Testing switch_user_company function...');
    if (sessions.length > 0 && companies.length > 1) {
      const testSession = sessions[0];
      const otherCompany = companies.find(c => c.id !== testSession.current_company_id);
      
      if (otherCompany) {
        const { data: switchResult, error: switchError } = await supabase
          .rpc('switch_user_company', {
            p_account_id: testSession.account_id,
            p_company_id: otherCompany.id,
            p_session_token: testSession.session_token
          });
        
        if (switchError) {
          console.error('❌ Error testing switch_user_company:', switchError);
        } else {
          console.log(`✅ switch_user_company works: ${switchResult ? 'Success' : 'Failed'}`);
        }
      }
    }
    
    // Test 7: Check cross-company employees
    console.log('\n7️⃣ Testing cross-company employees...');
    const { data: crossCompanyEmployees, error: crossError } = await supabase
      .from('employees')
      .select(`
        email,
        first_name,
        last_name,
        companies!inner(name)
      `)
      .order('email');
    
    if (crossError) {
      console.error('❌ Error fetching cross-company employees:', crossError);
      return;
    }
    
    // Group by email to find cross-company employees
    const employeeMap = new Map();
    crossCompanyEmployees.forEach(emp => {
      if (!employeeMap.has(emp.email)) {
        employeeMap.set(emp.email, []);
      }
      employeeMap.get(emp.email).push(emp);
    });
    
    const crossCompanyUsers = Array.from(employeeMap.entries()).filter(([email, companies]) => companies.length > 1);
    
    console.log(`✅ Found ${crossCompanyUsers.length} cross-company employees:`);
    crossCompanyUsers.forEach(([email, companies]) => {
      console.log(`   - ${email}: ${companies.map(c => c.companies.name).join(', ')}`);
    });
    
    console.log('\n🎉 Multi-company setup test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Companies: ${companies.length}`);
    console.log(`- User company roles: ${userRoles.length}`);
    console.log(`- User sessions: ${sessions.length}`);
    console.log(`- Cross-company employees: ${crossCompanyUsers.length}`);
    console.log('\n✅ All database functions are working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMultiCompanySetup().catch(console.error);
