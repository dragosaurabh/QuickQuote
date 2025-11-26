-- Fix RLS policies to prevent duplicate row issues
-- Migration: 002_fix_rls_policies
-- Description: Combines duplicate SELECT policies into single policies with OR conditions

-- Drop the conflicting policies on quotes table
DROP POLICY IF EXISTS "Users can view quotes from their business" ON quotes;
DROP POLICY IF EXISTS "Anyone can view quotes by ID (public share link)" ON quotes;

-- Create a single combined policy for SELECT on quotes
CREATE POLICY "Users can view their quotes or public quotes"
  ON quotes FOR SELECT
  USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
    OR true  -- Allow public access for share links
  );

-- Drop the conflicting policies on quote_items table
DROP POLICY IF EXISTS "Users can view quote items from their quotes" ON quote_items;
DROP POLICY IF EXISTS "Anyone can view quote items (public share link)" ON quote_items;

-- Create a single combined policy for SELECT on quote_items
CREATE POLICY "Users can view their quote items or public quote items"
  ON quote_items FOR SELECT
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN businesses b ON q.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
    OR true  -- Allow public access for share links
  );

-- Note: The "OR true" effectively makes these publicly readable,
-- which is intentional for the share link feature.
-- In production, you might want to add a more specific condition
-- like checking if the quote has a public_share_token or similar.
