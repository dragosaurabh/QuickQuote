# QuickQuote - Quick Start Guide

## 🚀 First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/web-designer/.env.example apps/web-designer/.env.local
cp apps/photographer/.env.example apps/photographer/.env.local

# 3. Add your Supabase credentials to both .env.local files
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 4. Start development server
pnpm dev:web-designer
# or
pnpm dev:photographer
```

## 🔧 Daily Development

```bash
# Start dev server
pnpm dev:web-designer    # Web Designer app (port 3000)
pnpm dev:photographer    # Photographer app (port 3001)

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## 🧹 When Changes Don't Show Up

```bash
# Quick fix (try this first)
pnpm clean
pnpm dev:web-designer

# Full reset (if quick fix doesn't work)
pnpm clean:all
pnpm install
pnpm dev:web-designer
```

## 🌐 Browser Cache Issues

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Or use Incognito/Private mode**

## 📝 Common Tasks

### Clear Caches
```bash
pnpm clean              # Clear build caches
./clear-cache.sh        # Alternative script
```

### Build for Production
```bash
pnpm build              # Build all apps
```

### Kill Stuck Processes
```bash
lsof -ti:3000 | xargs kill -9    # Kill port 3000
lsof -ti:3001 | xargs kill -9    # Kill port 3001
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Changes not showing | `pnpm clean` then restart dev server |
| Port already in use | `lsof -ti:3000 \| xargs kill -9` |
| Auth not working | Check .env.local has correct Supabase keys |
| Hot reload broken | Restart dev server, check for syntax errors |
| TypeScript errors | Restart TS server in IDE |

## 📚 More Help

- `DEVELOPMENT.md` - Detailed development guide
- `CACHE-FIX-SUMMARY.md` - Cache issues explained
- Check terminal output for errors
- Check browser console (F12) for errors

## 🎯 Project Structure

```
quickquote/
├── apps/
│   ├── web-designer/      # Web Designer variant
│   └── photographer/      # Photographer variant
├── packages/
│   └── core/             # Shared components & logic
└── supabase/
    └── migrations/       # Database schema
```

## ✨ Key Features

- 🎃 Halloween-themed UI
- 📱 Responsive design
- 🔐 Supabase authentication
- 💼 Quote management
- 📄 PDF generation
- 💬 WhatsApp sharing
- 👥 Customer management
- 🛠️ Service management

---

**Need help?** Check the detailed guides or look at the error messages in your terminal/browser console.
