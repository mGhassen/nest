#!/usr/bin/env node

/**
 * Script to fix the test superuser by creating onboarding company and assigning role
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54421';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function fixTestSuperuser() {
  try {
    console.log('🔧 Fixing test superuser setup...');

    // 1. Get the test superuser account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === 'superuser@test.com')?.id)
      .single();

    if (accountError || !account) {
      console.error('❌ Could not find test superuser account');
      return;
    }

    console.log('✅ Found test superuser account:', account.id);

    // 2. Check if onboarding company exists
    let onboardingCompanyId;
    const { data: existingOnboarding, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Onboarding')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking onboarding company:', checkError.message);
      return;
    } else if (existingOnboarding) {
      onboardingCompanyId = existingOnboarding.id;
      console.log('✅ Using existing onboarding company');
    } else {
      // 3. Create the onboarding company
      const { data: newOnboarding, error: createError } = await supabase
        .from('companies')
        .insert({
          name: 'Onboarding',
          legal_name: 'Onboarding Company',
          description: 'Special company for superusers without companies',
          industry: 'System',
          company_size: '1-10',
          country: 'System',
          country_code: 'SYS',
          currency: 'USD',
          status: 'ACTIVE',
          is_verified: false
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('❌ Error creating onboarding company:', createError.message);
        return;
      } else {
        onboardingCompanyId = newOnboarding.id;
        console.log('✅ Created onboarding company');
      }
    }

    // 4. Check if role already exists
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('account_company_roles')
      .select('id')
      .eq('account_id', account.id)
      .eq('company_id', onboardingCompanyId)
      .single();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking existing role:', roleCheckError.message);
      return;
    } else if (existingRole) {
      console.log('✅ Role already exists');
    } else {
      // 5. Assign SUPERUSER role to the onboarding company
      const { data: accountCompanyRole, error: roleError } = await supabase
        .from('account_company_roles')
        .insert({
          account_id: account.id,
          company_id: onboardingCompanyId,
          role: 'SUPERUSER'
        })
        .select()
        .single();
      
      if (roleError) {
        console.error('❌ Error creating superuser role:', roleError.message);
        return;
      } else {
        console.log('✅ Assigned SUPERUSER role to onboarding company');
      }
    }

    console.log('🎉 Test superuser setup completed successfully!');
    console.log('📧 Login with: superuser@test.com / superuser123');
    console.log('🎯 Should redirect to: /admin/onboarding');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixTestSuperuser().catch(console.error);
