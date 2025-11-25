/**
 * Photographer App Branding Configuration
 * Creative-themed branding with Halloween accents
 */

export const branding = {
  // App identity
  appName: 'SpookyQuote',
  appNameShort: 'SQ',
  tagline: 'Capture Moments, Quote in Seconds 📸🎃',
  description: 'Create and send professional photography quotes in seconds',
  
  // Halloween-themed messages
  messages: {
    loading: [
      'Developing your quote... 📸',
      'Focusing on the details... 🔍',
      'Capturing the perfect price... ✨',
      'Processing in the darkroom... 🎃',
    ],
    success: {
      quoteCreated: 'Your quote is picture perfect! 📷',
      quoteSent: 'Quote sent to the spirit realm! 👻',
      saved: 'Safely stored in the archive! 🗄️',
      copied: 'Copied to your clipboard! 📋',
    },
    error: {
      generic: 'Something spooky happened! Please try again. 👻',
      network: 'Lost connection to the spirit realm. Check your internet!',
      validation: 'The spirits reject this input. Please check your entries.',
      notFound: 'This quote has vanished into the mist... 🌫️',
      auth: 'You must enter the studio first! Please log in.',
    },
    empty: {
      quotes: 'No quotes in the gallery yet... Create your first one! 📸',
      customers: 'Your client list is empty. Add some subjects! 👤',
      services: 'No services in your portfolio. Add your offerings! 🎨',
    },
  },
  
  // Industry-specific labels
  labels: {
    service: 'Service',
    services: 'Services',
    serviceCategories: [
      'Wedding',
      'Events',
      'Portraits',
      'Commercial',
      'Post-Production',
      'Specialty',
    ],
  },
  
  // Default quote terms for photographers
  defaultTerms: `Payment Terms:
• 30% deposit required to secure booking date
• Remaining 70% due on the day of the shoot
• Payment accepted via bank transfer, PayPal, or cash

Deliverables:
• High-resolution edited images delivered via online gallery
• Delivery within 2-4 weeks (unless rush delivery selected)
• Raw files available upon request for additional fee

Usage Rights:
• Personal use license included
• Commercial use requires separate licensing agreement
• Photographer retains right to use images for portfolio`,
  
  // Default validity period (days)
  defaultValidityDays: 7,
};

export default branding;
