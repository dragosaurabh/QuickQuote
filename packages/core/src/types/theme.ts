// Theme configuration types

export interface HalloweenColors {
  purple: string;
  green: string;
  orange: string;
  black: string;
}

export interface HalloweenConfig {
  enabled: boolean;
  accentGlow: string;
  colors: HalloweenColors;
  decorativeEmojis: string[];
  loadingMessages: string[];
  successMessages: Record<string, string>;
  errorMessages: Record<string, string>;
}

export interface AppTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textMuted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  halloween: HalloweenConfig;
}

// Default Halloween configuration - Requirements 12.1, 12.4, 12.5
export const defaultHalloweenConfig: HalloweenConfig = {
  enabled: true,
  accentGlow: 'purple',
  colors: {
    purple: '#8B5CF6',
    green: '#22C55E',
    orange: '#F97316',
    black: '#0A0A0A',
  },
  decorativeEmojis: ['🎃', '👻', '🦇', '🕷️', '🕸️', '🧙‍♀️', '🔮', '🌙', '⚰️', '💀'],
  loadingMessages: [
    'Summoning your quote... 🎃',
    'Brewing the numbers... 🧙‍♀️',
    'Consulting the spirits... 👻',
    'Casting calculation spells... ✨',
    'Awakening the data... 🦇',
    'Stirring the cauldron... 🔮',
    'Gathering moonlight... 🌙',
    'Channeling dark magic... 🕯️',
  ],
  successMessages: {
    quoteCreated: 'Your quote has risen from the grave! 🧟',
    quoteSent: 'Quote dispatched to the spirit realm! 👻',
    saved: 'Safely stored in the crypt! 🏚️',
    copied: 'Copied to your clipboard! 📋',
    deleted: 'Banished to the shadow realm! 💀',
    updated: 'The spirits have accepted your changes! ✨',
  },
  errorMessages: {
    generic: 'Something spooky happened! Please try again. 👻',
    network: 'Lost connection to the spirit realm. Check your internet!',
    validation: 'The spirits reject this input. Please check your entries.',
    notFound: 'This has vanished into the mist... 🌫️',
    auth: 'You must enter the crypt first! Please log in.',
    permission: 'The spirits forbid this action! 🚫',
  },
};

export interface SeedService {
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface AppConfig {
  appName: string;
  tagline: string;
  theme: AppTheme;
  seedServices: SeedService[];
}
