/**
 * Halloween-themed messages for the QuickQuote application
 * Requirements: 12.2, 12.3
 */

// Loading messages - Requirements 12.2
export const loadingMessages = [
  'Summoning your quote... 🎃',
  'Brewing the numbers... 🧙‍♀️',
  'Consulting the spirits... 👻',
  'Casting calculation spells... ✨',
  'Awakening the data... 🦇',
  'Stirring the cauldron... 🔮',
  'Gathering moonlight... 🌙',
  'Channeling dark magic... 🕯️',
  'Waking the undead servers... 🧟',
  'Reading the crystal ball... 🔮',
  'Summoning skeleton crew... 💀',
  'Mixing potions... 🧪',
];

// Success messages - Requirements 12.3
export const successMessages = {
  // Quote related
  quoteCreated: 'Your quote has risen from the grave! 🧟',
  quoteSent: 'Quote dispatched to the spirit realm! 👻',
  quoteUpdated: 'The spirits have accepted your changes! ✨',
  quoteDuplicated: 'A ghostly copy has been summoned! 👻',
  quoteDeleted: 'Banished to the shadow realm! 💀',
  
  // Customer related
  customerCreated: 'A new soul has joined your crypt! 👤',
  customerUpdated: 'Customer details have been enchanted! ✨',
  customerDeleted: 'Customer has vanished into the mist! 🌫️',
  
  // Service related
  serviceCreated: 'New offering added to the cauldron! 🧪',
  serviceUpdated: 'Service has been transformed! 🔮',
  serviceDeleted: 'Service has been exorcised! 👻',
  
  // General
  saved: 'Safely stored in the crypt! 🏚️',
  copied: 'Copied to your clipboard! 📋',
  uploaded: 'File has materialized! 📁',
  loggedIn: 'Welcome to the haunted realm! 🎃',
  loggedOut: 'You have left the crypt... for now! 👋',
};

// Error messages - Requirements 12.3
export const errorMessages = {
  generic: 'Something spooky happened! Please try again. 👻',
  network: 'Lost connection to the spirit realm. Check your internet! 📡',
  validation: 'The spirits reject this input. Please check your entries. ⚠️',
  notFound: 'This has vanished into the mist... 🌫️',
  auth: 'You must enter the crypt first! Please log in. 🔐',
  permission: 'The spirits forbid this action! 🚫',
  timeout: 'The spirits took too long to respond... ⏳',
  serverError: 'The haunted servers are having issues! 🖥️',
  uploadFailed: 'The file refused to materialize! 📁',
  saveFailed: 'Failed to store in the crypt! Try again. 💾',
};

// Empty state messages
export const emptyStateMessages = {
  quotes: 'No quotes lurking here yet... Create your first one! 🎃',
  customers: 'Your customer graveyard is empty. Add some souls! 👻',
  services: 'No services in the cauldron. Add your offerings! 🧙‍♂️',
  search: 'No spirits match your search... Try different words! 🔍',
  dashboard: 'Your haunted dashboard awaits data... 📊',
};

// Confirmation messages
export const confirmationMessages = {
  deleteQuote: 'Are you sure you want to banish this quote to the shadow realm? 💀',
  deleteCustomer: 'This soul will vanish forever. Are you sure? 👻',
  deleteService: 'This service will be exorcised. Continue? 🔮',
  logout: 'Are you sure you want to leave the crypt? 🚪',
  unsavedChanges: 'You have unsaved enchantments. Leave anyway? ⚠️',
};

// Helper function to get a random loading message
export function getRandomLoadingMessage(): string {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}

// Helper function to get success message by key
export function getSuccessMessage(key: keyof typeof successMessages): string {
  return successMessages[key] || successMessages.saved;
}

// Helper function to get error message by key
export function getErrorMessage(key: keyof typeof errorMessages): string {
  return errorMessages[key] || errorMessages.generic;
}

// Helper function to get empty state message by key
export function getEmptyStateMessage(key: keyof typeof emptyStateMessages): string {
  return emptyStateMessages[key] || 'Nothing here yet... 👻';
}
