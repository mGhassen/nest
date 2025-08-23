#!/bin/bash

echo "🧹 Cleaning up Better Auth dependencies..."

# Remove Better Auth packages
npm uninstall better-auth @auth/drizzle-adapter

echo "✅ Dependencies cleaned up!"
echo ""
echo "📦 Current setup:"
echo "   - Supabase: @supabase/supabase-js ✅"
echo "   - Drizzle: drizzle-orm ✅"
echo "   - Next.js 15 ✅"
echo ""
echo "🚀 Next steps:"
echo "   1. Copy .env.example to .env.local"
echo "   2. Fill in your Supabase credentials"
echo "   3. Run: npm run dev"
echo "   4. Follow SUPABASE_SETUP.md for complete setup"
