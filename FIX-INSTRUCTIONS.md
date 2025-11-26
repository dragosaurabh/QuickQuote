# 🚨 URGENT: Fix Quote Generation Issues

## The Problem

You're seeing these errors:
- ❌ "duplicate key value violates unique constraint"
- ❌ "Cannot coerce the result to a single JSON object"
- ❌ "Failed to create quote"

## The Solution (3 Steps)

### Step 1: Apply Database Migration ⚠️ CRITICAL

**You MUST do this first or nothing will work!**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste this ENTIRE SQL code:

```sql
-- Fix RLS policies to prevent duplicate row issues
DROP POLICY IF EXISTS "Users can view quotes from their business" ON quotes;
DROP POLICY IF EXISTS "Anyone can view quotes by ID (public share link)" ON quotes;

CREATE POLICY "Users can view their quotes or public quotes"
  ON quotes FOR SELECT
  USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
    OR true
  );

DROP POLICY IF EXISTS "Users can view quote items from their quotes" ON quote_items;
DROP POLICY IF EXISTS "Anyone can view quote items (public share link)" ON quote_items;

CREATE POLICY "Users can view their quote items or public quote items"
  ON quote_items FOR SELECT
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN businesses b ON q.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
    OR true
  );
```

6. Click "Run" button
7. You should see "Success. No rows returned"

### Step 2: Clear Cache

Run this command in your terminal:

```bash
pnpm clean
```

Or manually:

```bash
rm -rf apps/web-designer/.next
rm -rf apps/photographer/.next
rm -rf packages/core/dist
```

### Step 3: Restart Dev Server

```bash
# Stop your current dev server (Ctrl+C)

# Start it again
pnpm dev:web-designer
# or
pnpm dev:photographer
```

## Test It

1. Go to "New Quote" page
2. Select customer
3. Select services
4. Click "Generate Quote"
5. Should work without errors!
6. Should redirect to quote detail page
7. Quote should display correctly

## Still Not Working?

### Check if migration was applied:

Go to Supabase Dashboard → SQL Editor → Run this:

```sql
SELECT * FROM pg_policies WHERE tablename = 'quotes';
```

You should see a policy named "Users can view their quotes or public quotes"

### Check browser console:

1. Press F12
2. Go to Console tab
3. Look for error messages
4. Share them if you need more help

### Nuclear option:

```bash
# Clear everything
pnpm clean:all
rm -rf node_modules/.cache

# Reinstall
pnpm install

# Restart
pnpm dev:web-designer
```

## Why This Fixes It

1. **Database Migration**: Fixes conflicting RLS policies that were causing "Cannot coerce" error
2. **Code Changes**: Already applied - retry logic and separate queries
3. **Cache Clear**: Ensures you're running the latest code

## Important Notes

- ⚠️ **The database migration is REQUIRED** - the app won't work without it
- 🔄 You only need to apply the migration ONCE
- 💾 The migration is safe - it just fixes the policies, doesn't delete data
- ✅ After migration, all future quote operations will work correctly

---

**Need help?** Check the browser console (F12) and terminal output for specific error messages.
