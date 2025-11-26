# Development Guide

## Common Issues & Solutions

### Changes Not Reflecting in Browser

If you make code changes but they don't appear in the browser even after hard refresh, try these steps:

#### Quick Fix (Try First)
```bash
# Clear Next.js cache and restart
./clear-cache.sh

# Then restart your dev server
pnpm dev
```

#### Full Reset (If Quick Fix Doesn't Work)
```bash
# 1. Stop all dev servers (Ctrl+C)

# 2. Clear all caches
rm -rf apps/web-designer/.next
rm -rf apps/photographer/.next
rm -rf packages/core/dist
rm -rf packages/core/tsconfig.tsbuildinfo

# 3. Clear node_modules cache (optional but recommended)
rm -rf node_modules/.cache

# 4. Reinstall dependencies (if needed)
pnpm install

# 5. Restart dev server
pnpm dev
```

#### Browser Cache Issues
If the issue persists, clear your browser cache:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or use Incognito/Private mode** to test without cache

#### Development Server Issues

**Start dev server for specific app:**
```bash
# Web Designer app
cd apps/web-designer
pnpm dev

# Photographer app  
cd apps/photographer
pnpm dev
```

**Check if port is already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Hot Reload Not Working

If hot reload stops working:

1. **Check for syntax errors** - A single syntax error can break hot reload
2. **Restart the dev server** - Sometimes it just needs a fresh start
3. **Check file watchers** - On macOS, you might hit the file watcher limit:
   ```bash
   # Increase file watcher limit (macOS)
   echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
   echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -w kern.maxfiles=65536
   sudo sysctl -w kern.maxfilesperproc=65536
   ```

### Monorepo Package Changes Not Reflecting

If you change code in `packages/core` but it doesn't update in the apps:

```bash
# 1. Clear the core package build
rm -rf packages/core/dist
rm -rf packages/core/tsconfig.tsbuildinfo

# 2. Clear app caches
rm -rf apps/web-designer/.next
rm -rf apps/photographer/.next

# 3. Restart dev server
pnpm dev
```

### TypeScript Errors Not Clearing

```bash
# Clear TypeScript cache
rm -rf packages/core/tsconfig.tsbuildinfo
rm -rf apps/web-designer/tsconfig.tsbuildinfo
rm -rf apps/photographer/tsconfig.tsbuildinfo

# Restart TypeScript server in your IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## Best Practices

1. **Always use the clear-cache script** before reporting "changes not working" issues
2. **Use browser DevTools** with cache disabled during development
3. **Restart dev server** after major changes (especially to config files)
4. **Check console for errors** - Both browser console and terminal
5. **Use incognito mode** to test without any browser cache

## Quick Commands

```bash
# Clear all caches
./clear-cache.sh

# Start dev server (from root)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Type check
pnpm type-check
```

## Environment Variables

Make sure you have the correct environment variables set:

```bash
# apps/web-designer/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# apps/photographer/.env.local  
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**After changing environment variables, you MUST restart the dev server!**

## Debugging Tips

### Check if dev server is running
```bash
# Check what's running on port 3000
lsof -i :3000

# Check what's running on port 3001
lsof -i :3001
```

### View dev server logs
The terminal where you ran `pnpm dev` shows all logs. Look for:
- ✓ Compiled successfully
- ⚠ Warnings
- ✖ Errors

### Check browser console
Open DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Application tab to clear storage/cache

## Still Having Issues?

1. **Check the terminal** for error messages
2. **Check browser console** for client-side errors
3. **Try the Full Reset** steps above
4. **Restart your computer** (sometimes needed for file watcher limits)
5. **Check if you're on the latest code** - `git pull` to get latest changes
