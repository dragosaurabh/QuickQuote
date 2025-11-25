import { AppConfig, AppTheme, SeedService, defaultHalloweenConfig } from '@quickquote/core/types';

/**
 * Web Designer App Theme Configuration
 * Tech-themed colors with Halloween accents
 */
export const webDesignerTheme: AppTheme = {
  name: 'Web Designer',
  colors: {
    primary: '#8B5CF6',      // Purple - tech/digital feel
    secondary: '#6366F1',    // Indigo - complementary tech color
    accent: '#22C55E',       // Green - Halloween accent (neon green)
    background: '#0A0A0A',   // Deep black - Halloween dark mode
    surface: '#1A1A2E',      // Dark purple-tinted surface
    surfaceElevated: '#252540', // Elevated surface for cards
    text: '#FAFAFA',         // Light text for dark mode
    textMuted: '#A1A1AA',    // Muted gray text
  },
  fonts: {
    heading: 'Creepster, cursive',  // Spooky font for headings
    body: 'Inter, sans-serif',       // Clean readable body font
  },
  halloween: {
    ...defaultHalloweenConfig,
    accentGlow: '0 0 20px rgba(139, 92, 246, 0.5)', // Purple glow effect
  },
};

/**
 * Seed services for Web Designer variant
 * Pre-loaded web design services as per Requirements 11.1
 */
export const webDesignerSeedServices: SeedService[] = [
  {
    name: 'Basic Website',
    description: 'Simple 5-page responsive website with contact form',
    price: 1500,
    category: 'Website Development',
  },
  {
    name: 'E-commerce Website',
    description: 'Full online store with payment integration and inventory management',
    price: 5000,
    category: 'Website Development',
  },
  {
    name: 'Landing Page',
    description: 'Single-page conversion-focused design with CTA optimization',
    price: 800,
    category: 'Website Development',
  },
  {
    name: 'Website Maintenance',
    description: 'Monthly maintenance package including updates and backups',
    price: 200,
    category: 'Maintenance',
  },
  {
    name: 'Domain Setup',
    description: 'Domain registration, DNS configuration, and SSL setup',
    price: 150,
    category: 'Setup & Configuration',
  },
  {
    name: 'SEO Package',
    description: 'On-page SEO optimization, meta tags, and sitemap setup',
    price: 600,
    category: 'Marketing',
  },
  {
    name: 'Logo Design',
    description: 'Custom logo design with 3 concepts and revisions',
    price: 400,
    category: 'Branding',
  },
  {
    name: 'Brand Identity Package',
    description: 'Complete branding including logo, colors, and style guide',
    price: 1200,
    category: 'Branding',
  },
  {
    name: 'UI/UX Design',
    description: 'User interface and experience design with wireframes',
    price: 2000,
    category: 'Design',
  },
  {
    name: 'Website Redesign',
    description: 'Complete visual overhaul of existing website',
    price: 2500,
    category: 'Website Development',
  },
];

/**
 * Complete Web Designer App Configuration
 */
export const webDesignerConfig: AppConfig = {
  appName: 'SpookyQuote',
  tagline: 'Hauntingly Fast Web Design Quotes 🎃',
  theme: webDesignerTheme,
  seedServices: webDesignerSeedServices,
};

export default webDesignerConfig;
