# 🚀 Supabase Setup Guide for HR System

This guide will help you set up Supabase for your HR system, including local development, migrations, and production deployment.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase CLI installed (`npm install -g supabase`)
- A Supabase account at [supabase.com](https://supabase.com)

## 🏗️ Project Structure

Your project now has the following Supabase structure:

```
supabase/
├── config.toml          # Supabase configuration
├── migrations/          # Database migrations
│   └── 20241201000000_initial_schema.sql
└── seed.sql            # Seed data
```

## 🚀 Quick Setup

### 1. Initialize Supabase (Already Done)

The project is already configured with:
- ✅ `supabase/config.toml` - Configuration file
- ✅ `supabase/migrations/` - Initial schema migration
- ✅ `supabase/seed.sql` - Sample data

### 2. Start Local Development

```bash
# Start local Supabase services
./scripts/setup-supabase.sh start

# Or manually:
supabase start
```

This will start:
- PostgreSQL database on port 54322
- Supabase API on port 54321
- Supabase Studio on port 54323
- Realtime service on port 54325

### 3. Apply Migrations and Seed Data

```bash
# Full setup (recommended)
./scripts/setup-supabase.sh setup

# Or step by step:
supabase db reset
```

### 4. Access Local Services

- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`
- **API**: `http://localhost:54321`
- **Studio**: `http://localhost:54323`
- **Realtime**: `ws://localhost:54325`

## 🗄️ Database Schema

The initial migration creates the following tables:

### Core Tables
- **companies** - Organization information
- **locations** - Company locations
- **cost_centers** - Department/team groupings
- **work_schedules** - Working hour configurations

### User Management
- **users** - User profiles (linked to Supabase Auth)
- **memberships** - User-company relationships with roles
- **employees** - Employee records and details
- **profiles** - Extended user profile data

### Business Logic
- **leave_policies** - Leave type definitions
- **leave_requests** - Leave applications and approvals
- **payroll_cycles** - Payroll period management
- **timesheets** - Time tracking records
- **timesheet_entries** - Individual time entries

### Features
- Row Level Security (RLS) enabled on all tables
- Automatic `updated_at` timestamps
- Proper foreign key relationships
- UUID primary keys
- Enum types for status fields

## 🔧 Development Workflow

### 1. Make Schema Changes

Edit the migration files in `supabase/migrations/` or create new ones:

```bash
# Create a new migration
supabase migration new add_new_table

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_new_table.sql
```

### 2. Apply Changes

```bash
# Apply all migrations
supabase db reset

# Or push to remote (if connected)
supabase db push
```

### 3. Generate Types

```bash
# Generate TypeScript types from local database
./scripts/setup-supabase.sh types

# Or manually:
supabase gen types typescript --local > types/database.types.ts
```

### 4. Test Changes

```bash
# Start local services
./scripts/setup-supabase.sh start

# Apply migrations
./scripts/setup-supabase.sh migrate

# Seed data
./scripts/setup-supabase.sh seed
```

## 🌐 Production Deployment

### 1. Connect to Remote Project

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Get your project ref from: https://supabase.com/dashboard/project/your-project-ref
```

### 2. Push Schema to Production

```bash
# Push migrations to remote
supabase db push

# Or reset remote database (⚠️ destructive)
supabase db reset --linked
```

### 3. Update Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 🛠️ Available Scripts

The project includes a comprehensive setup script:

```bash
# Interactive mode
./scripts/setup-supabase.sh

# Command line mode
./scripts/setup-supabase.sh start      # Start local Supabase
./scripts/setup-supabase.sh stop       # Stop local Supabase
./scripts/setup-supabase.sh reset      # Reset local database
./scripts/setup-supabase.sh migrate    # Apply migrations
./scripts/setup-supabase.sh types      # Generate TypeScript types
./scripts/setup-supabase.sh seed       # Seed database
./scripts/setup-supabase.sh setup      # Full setup
./scripts/setup-supabase.sh status     # Check status
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :54321
   lsof -i :54322
   lsof -i :54323
   ```

2. **Database connection issues**
   ```bash
   # Reset local database
   ./scripts/setup-supabase.sh reset
   ```

3. **Migration errors**
   ```bash
   # Check migration status
   supabase migration list
   
   # Reset and reapply
   supabase db reset
   ```

### Reset Everything

```bash
# Stop and remove all local data
supabase stop --no-backup

# Start fresh
./scripts/setup-supabase.sh setup
```

## 📚 Useful Commands

### Database Management
```bash
# View database in Studio
supabase studio

# Connect to database directly
psql postgresql://postgres:postgres@localhost:54322/postgres

# Backup local database
supabase db dump --local > backup.sql
```

### Migration Management
```bash
# List migrations
supabase migration list

# Check migration status
supabase migration list --status applied

# Create new migration
supabase migration new descriptive_name
```

### Type Generation
```bash
# Generate types from local database
supabase gen types typescript --local > types/database.types.ts

# Generate types from remote database
supabase gen types typescript --linked > types/database.types.ts
```

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎯 Next Steps

1. **Customize the schema** - Modify migrations to match your needs
2. **Add more seed data** - Update `seed.sql` with realistic data
3. **Set up RLS policies** - Configure row-level security rules
4. **Add database functions** - Create custom PostgreSQL functions
5. **Set up webhooks** - Configure real-time updates

Your HR system is now fully configured with Supabase! 🎉
