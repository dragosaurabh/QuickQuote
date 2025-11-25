import { AppConfig, AppTheme, SeedService, defaultHalloweenConfig } from '@quickquote/core/types';

/**
 * Photographer App Theme Configuration
 * Creative-themed colors with Halloween accents
 */
export const photographerTheme: AppTheme = {
  name: 'Photographer',
  colors: {
    primary: '#F97316',      // Orange - warm creative feel + Halloween
    secondary: '#EC4899',    // Pink - creative/artistic color
    accent: '#8B5CF6',       // Purple - Halloween accent
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
    accentGlow: '0 0 20px rgba(249, 115, 22, 0.5)', // Orange glow effect
  },
};

/**
 * Seed services for Photographer variant
 * Pre-loaded photography services as per Requirements 11.2
 */
export const photographerSeedServices: SeedService[] = [
  {
    name: 'Wedding Photography',
    description: 'Full day coverage with 2 photographers, 500+ edited photos',
    price: 3500,
    category: 'Wedding',
  },
  {
    name: 'Pre-Wedding Shoot',
    description: 'Engagement/pre-wedding session, 2 hours, 50+ edited photos',
    price: 800,
    category: 'Wedding',
  },
  {
    name: 'Birthday Party',
    description: '3-hour event coverage with 100+ edited photos',
    price: 600,
    category: 'Events',
  },
  {
    name: 'Product Photography',
    description: 'Per product pricing, white background, 5 angles',
    price: 50,
    category: 'Commercial',
  },
  {
    name: 'Photo Editing',
    description: 'Professional retouching and color correction per photo',
    price: 15,
    category: 'Post-Production',
  },
  {
    name: 'Album Design',
    description: 'Custom photo album design, 20 pages',
    price: 400,
    category: 'Post-Production',
  },
  {
    name: 'Portrait Session',
    description: '1-hour studio or outdoor portrait session, 20+ edited photos',
    price: 350,
    category: 'Portraits',
  },
  {
    name: 'Family Portrait',
    description: '1.5-hour family session, up to 6 people, 30+ edited photos',
    price: 500,
    category: 'Portraits',
  },
  {
    name: 'Corporate Headshots',
    description: 'Professional headshots, per person, 3 final images',
    price: 150,
    category: 'Commercial',
  },
  {
    name: 'Event Coverage',
    description: 'Corporate/social event, per hour rate',
    price: 200,
    category: 'Events',
  },
  {
    name: 'Drone Photography',
    description: 'Aerial photography add-on, 10+ aerial shots',
    price: 300,
    category: 'Specialty',
  },
  {
    name: 'Rush Delivery',
    description: 'Express editing and delivery within 48 hours',
    price: 250,
    category: 'Post-Production',
  },
];

/**
 * Complete Photographer App Configuration
 */
export const photographerConfig: AppConfig = {
  appName: 'SpookyQuote',
  tagline: 'Capture Moments, Quote in Seconds 📸🎃',
  theme: photographerTheme,
  seedServices: photographerSeedServices,
};

export default photographerConfig;
