# 🚀 Supabase + Drizzle Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works great!)
- PostgreSQL knowledge (basic)

## 🎯 Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign up/login
2. **Create New Project**
   - Choose organization
   - Enter project name (e.g., "nest-hr-system")
   - Enter database password (save this!)
   - Choose region closest to you
   - Wait for project to be ready (~2-3 minutes)

## 🔑 Step 2: Get Your Credentials

1. **Go to Project Settings** → **API**
2. **Copy these values:**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

3. **Go to Database** → **Connection string**
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password
   - This becomes your `DATABASE_URL`

## ⚙️ Step 3: Environment Setup

1. **Copy `.env.example` to `.env.local`**
2. **Fill in your values:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Database Connection (Supabase)
DATABASE_URL="postgresql://postgres:yourpassword@db.yourprojectref.supabase.co:5432/postgres"

# Cron Jobs
CRON_SECRET="your-cron-secret-here"
```

## 🗄️ Step 4: Database Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Generate Drizzle migrations:**
```bash
npx drizzle-kit generate
```

3. **Push schema to Supabase:**
```bash
npx drizzle-kit push
```

4. **Or run migrations locally (if you have local PostgreSQL):**
```bash
npx drizzle-kit migrate
```

## 🔐 Step 5: Authentication Setup

1. **Go to Authentication** → **Settings**
2. **Enable Email Auth** (if you want email/password)
3. **Enable Google OAuth** (optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`

## 🧪 Step 6: Test Everything

1. **Start development server:**
```bash
npm run dev
```

2. **Visit:** `http://localhost:3000/auth/signin`
3. **Test sign-in/sign-up**

## 🚨 Troubleshooting

### **"Invalid secret" error**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that you copied the full key

### **Database connection failed**
- Verify `DATABASE_URL` format
- Check that password is correct
- Ensure project is active

### **"User not found" error**
- Run database migrations
- Check that tables were created
- Verify schema matches your code

### **OAuth not working**
- Check redirect URIs in Google Console
- Verify OAuth is enabled in Supabase
- Check browser console for errors

## 📚 Next Steps

1. **Seed your database** with initial data
2. **Set up Row Level Security (RLS)** policies
3. **Configure email templates** for auth
4. **Set up realtime subscriptions** if needed

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle Documentation](https://orm.drizzle.team/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Need help?** Check the Supabase Discord or GitHub issues!
