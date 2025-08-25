#!/bin/bash

# Cleanup script for Nest HR System
# This script removes unused dependencies and cleans up the project

echo "🧹 Cleaning up Nest HR System..."

# Remove any remaining Drizzle-related packages (if they exist)
echo "   - Checking for Drizzle packages..."
if npm list drizzle-orm &> /dev/null; then
    npm uninstall drizzle-orm drizzle-kit
    echo "   - Drizzle packages removed ✅"
else
    echo "   - Drizzle packages not found ✅"
fi

# Remove any remaining auth packages that might conflict
echo "   - Checking for conflicting auth packages..."
if npm list better-auth &> /dev/null; then
    npm uninstall better-auth @auth/drizzle-adapter
    echo "   - Better Auth packages removed ✅"
else
    echo "   - Better Auth packages not found ✅"
fi

# Clean up any other potentially unused packages
echo "   - Checking for other potentially unused packages..."

# Remove any remaining database adapters
if npm list @auth/prisma-adapter &> /dev/null; then
    npm uninstall @auth/prisma-adapter
    echo "   - Prisma adapter removed ✅"
fi

if npm list @auth/nextjs-adapter &> /dev/null; then
    npm uninstall @auth/nextjs-adapter
    echo "   - Next.js auth adapter removed ✅"
fi

# Clean up node_modules and reinstall
echo "   - Cleaning up node_modules..."
rm -rf node_modules
rm -f pnpm-lock.yaml

# Reinstall dependencies
echo "   - Reinstalling dependencies..."
pnpm install

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "Current setup:"
echo "   - Supabase: ✅ (primary database)"
echo "   - Next.js 15: ✅ (framework)"
echo "   - TypeScript: ✅ (type safety)"
echo "   - Tailwind CSS: ✅ (styling)"
echo "   - shadcn/ui: ✅ (components)"
echo "   - React Query: ✅ (state management)"
echo ""
echo "Next steps:"
echo "   1. Run: ./scripts/setup-supabase.sh setup"
echo "   2. Start development: pnpm dev"
echo "   3. Access Supabase Studio: http://localhost:54323"
