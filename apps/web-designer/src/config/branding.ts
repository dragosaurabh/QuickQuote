/**
 * Web Designer App Branding Configuration
 * Tech-themed branding with Halloween accents
 */

export const branding = {
  // App identity
  appName: 'SpookyQuote',
  appNameShort: 'SQ',
  tagline: 'Hauntingly Fast Web Design Quotes 🎃',
  description: 'Create and send professional web design quotes in seconds',
  
  // Halloween-themed messages
  messages: {
    loading: [
      'Summoning your quote... 👻',
      'Brewing the numbers... 🧙‍♂️',
      'Casting calculation spells... ✨',
      'Awakening the quote spirits... 🎃',
    ],
    success: {
      quoteCreated: 'Your quote has risen from the grave! 🧟',
      quoteSent: 'Quote dispatched to the spirit realm! 👻',
      saved: 'Safely stored in the crypt! 🏚️',
      copied: 'Copied to your clipboard! 📋',
    },
    error: {
      generic: 'Something spooky happened! Please try again. 👻',
      network: 'Lost connection to the spirit realm. Check your internet!',
      validation: 'The spirits reject this input. Please check your entries.',
      notFound: 'This quote has vanished into the mist... 🌫️',
      auth: 'You must enter the crypt first! Please log in.',
    },
    empty: {
      quotes: 'No quotes lurking here yet... Create your first one! 🎃',
      customers: 'Your customer graveyard is empty. Add some souls! 👻',
      services: 'No services in the cauldron. Add your offerings! 🧙‍♂️',
    },
  },
  
  // Industry-specific labels
  labels: {
    service: 'Service',
    services: 'Services',
    serviceCategories: [
      'Website Development',
      'Maintenance',
      'Setup & Configuration',
      'Marketing',
      'Branding',
      'Design',
    ],
  },
  
  // Default quote terms for web designers
  defaultTerms: `Payment Terms:
• 50% deposit required to begin work
• Remaining 50% due upon project completion
• Payment accepted via bank transfer or PayPal

Project Timeline:
• Timeline begins after deposit and content received
• Revisions included as specified in quote
• Additional revisions billed at hourly rate

Deliverables:
• All source files provided upon final payment
• 30-day support period included after launch`,
  
  // Default validity period (days)
  defaultValidityDays: 14,
};

export default branding;
