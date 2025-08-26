# Authentication Setup Guide

## Problem
You're getting an "Invalid login credentials" error because the seed file was trying to create users directly in the `auth.users` table, which doesn't work properly with Supabase's authentication system.

## Solution
We've updated the seed file to create accounts without auth user links, and created a script to properly create auth users through Supabase's API.

## Steps to Fix

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Reset and Reseed Database
```bash
# Stop your Supabase instance if running
supabase stop

# Start fresh
supabase start

# Reset the database
supabase db reset

# This will run the updated seed.sql file
```

### 3. Create Auth Users
After seeding, run the user creation script:
```bash
pnpm run create-users
```

This script will:
- Create auth users with proper passwords
- Link them to the existing account records
- Set up proper user metadata

### 4. Test Login
You can now sign in with these credentials:
- **Admin**: `admin@guepard.run` / `admin123`
- **HR**: `hr@guepard.run` / `hr123`
- **Manager**: `manager@guepard.run` / `manager123`
- **Employee**: `employee@guepard.run` / `employee123`

## What Was Fixed

### Before (Problematic)
- Seed file tried to insert directly into `auth.users` table
- Used `crypt()` function which doesn't work with Supabase auth
- Created password hashes that Supabase couldn't verify

### After (Fixed)
- Seed file creates accounts without auth user links
- Separate script creates users through Supabase's auth API
- Proper password handling and user metadata
- Clean separation of concerns

## Alternative Solutions

If you prefer not to use the script, you can:

### Option 1: Manual Creation in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" for each test account
4. Use the same emails and passwords listed above
5. Manually link the `auth_user_id` in your accounts table

### Option 2: Use Your App's Signup Form
1. Navigate to `/auth/signup` in your app
2. Create accounts with the test emails
3. Use the passwords listed above
4. The accounts will be automatically linked

## Troubleshooting

### "User already exists" Error
This means the user was already created. The script will skip existing users and continue.

### "Permission denied" Error
Make sure your `SUPABASE_SERVICE_ROLE_KEY` is correct in your `.env.local` file.

### Database Connection Issues
Ensure your Supabase instance is running:
```bash
supabase status
```

## Security Notes

- These are test credentials for development only
- Change passwords in production
- The service role key has admin privileges - keep it secure
- Consider using environment-specific credentials

## Next Steps

After fixing authentication:
1. Test all user roles and permissions
2. Verify the dashboard redirects work correctly
3. Test the RBAC system with different user types
4. Remove or secure the test user creation script for production
