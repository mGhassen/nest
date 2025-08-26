#!/usr/bin/env node

/**
 * Script to create test users in Supabase
 * Run this after seeding your database to create the auth users
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  console.error('\nPlease check your .env.local file')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: 'admin@guepard.run',
    password: 'admin123',
    user_metadata: {
      first_name: 'Ahmed',
      last_name: 'Ben Ali',
      role: 'OWNER'
    }
  },
  {
    email: 'hr@guepard.run',
    password: 'hr123',
    user_metadata: {
      first_name: 'Fatma',
      last_name: 'Trabelsi',
      role: 'HR'
    }
  },
  {
    email: 'manager@guepard.run',
    password: 'manager123',
    user_metadata: {
      first_name: 'Mohamed',
      last_name: 'Karray',
      role: 'MANAGER'
    }
  },
  {
    email: 'employee@guepard.run',
    password: 'employee123',
    user_metadata: {
      first_name: 'Sara',
      last_name: 'Mansouri',
      role: 'EMPLOYEE'
    }
  }
]

async function createTestUsers() {
  console.log('🚀 Creating test users in Supabase...\n')
  
  for (const user of testUsers) {
    try {
      console.log(`📧 Creating user: ${user.email}`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata
      })
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`   ⚠️  User ${user.email} already exists, skipping...`)
        } else {
          console.error(`   ❌ Error creating ${user.email}:`, error.message)
        }
      } else {
        console.log(`   ✅ Created user ${user.email} with ID: ${data.user.id}`)
        
        // Update the account record to link it to the auth user
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ auth_user_id: data.user.id })
          .eq('email', user.email)
        
        if (updateError) {
          console.error(`   ⚠️  Could not link account for ${user.email}:`, updateError.message)
        } else {
          console.log(`   🔗 Linked account for ${user.email}`)
        }
      }
    } catch (err) {
      console.error(`   ❌ Unexpected error creating ${user.email}:`, err.message)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log('🎉 Test user creation completed!')
  console.log('\n📋 Test Credentials:')
  testUsers.forEach(user => {
    console.log(`   ${user.email} / ${user.password}`)
  })
  console.log('\n💡 You can now sign in with these credentials')
}

// Run the script
createTestUsers().catch(console.error)
