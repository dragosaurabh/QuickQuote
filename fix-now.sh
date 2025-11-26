#!/bin/bash

echo "🔧 QuickQuote - Complete Fix Script"
echo "===================================="
echo ""

# Step 1: Clear caches
echo "1️⃣  Clearing all caches..."
rm -rf apps/web-designer/.next
rm -rf apps/photographer/.next
rm -rf packages/core/dist
rm -rf packages/core/tsconfig.tsbuildinfo
echo "✅ Caches cleared"
echo ""

# Step 2: Show database migration instructions
echo "2️⃣  DATABASE MIGRATION REQUIRED!"
echo "===================================="
echo ""
echo "You MUST apply the database migration to fix the RLS policies."
echo ""
echo "Option A - Using Supabase Dashboard (RECOMMENDED):"
echo "  1. Go to: https://supabase.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to SQL Editor"
echo "  4. Copy and paste this SQL:"
echo ""
echo "----------------------------------------"
cat supabase/migrations/002_fix_rls_policies.sql
echo "----------------------------------------"
echo ""
echo "  5. Click 'Run'"
echo ""
echo "Option B - Using Supabase CLI:"
echo "  Run: supabase db push"
echo ""
echo "⚠️  The app will NOT work until you apply this migration!"
echo ""
read -p "Press ENTER after you've applied the migration..."

# Step 3: Restart message
echo ""
echo "3️⃣  Now restart your dev server:"
echo "  pnpm dev:web-designer"
echo "  or"
echo "  pnpm dev:photographer"
echo ""
echo "✨ Done! Your app should now work correctly."
