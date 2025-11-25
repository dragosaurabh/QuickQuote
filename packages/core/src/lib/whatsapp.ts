/**
 * WhatsApp Message Generator
 * 
 * Generates formatted WhatsApp messages for sharing quotes with customers.
 * 
 * Requirements: 8.1, 8.2
 */

import { Quote, Business, Customer } from '../types/models';

export interface WhatsAppMessageInput {
  quote: Quote;
  business: Business;
  customer?: Customer;
  quoteLink: string;
}

/**
 * Format price for display in WhatsApp message
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Format date for display in WhatsApp message
 */
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generate a formatted WhatsApp message for sharing a quote
 * 
 * The message includes:
 * - Business name
 * - Customer name
 * - Quote number
 * - Date
 * - Validity period
 * - Total amount
 * - Quote link
 * 
 * Validates: Requirements 8.1, 8.2
 */
export function generateWhatsAppMessage(input: WhatsAppMessageInput): string {
  const { quote, business, customer, quoteLink } = input;
  
  // Use provided customer or fall back to quote relation
  const displayCustomer = customer || quote.customer;
  const customerName = displayCustomer?.name || 'Valued Customer';
  
  const message = `🎃 *Quote from ${business.name}* 🎃

Hi ${customerName}! 👋

Here's your quote details:

📋 *Quote Number:* ${quote.quoteNumber}
📅 *Date:* ${formatDate(quote.createdAt)}
⏰ *Valid Until:* ${formatDate(quote.validUntil)}

💰 *Total Amount:* ${formatPrice(quote.total)}

🔗 *View Full Quote:*
${quoteLink}

Thank you for your interest! Feel free to reach out if you have any questions. 🙏

_Sent via QuickQuote_ 👻`;

  return message;
}

/**
 * Generate WhatsApp deep link URL for sharing
 * 
 * @param phoneNumber - Customer phone number (optional, opens WhatsApp without pre-selected contact if not provided)
 * @param message - The message to pre-fill
 * @returns WhatsApp deep link URL
 */
export function generateWhatsAppLink(message: string, phoneNumber?: string): string {
  const encodedMessage = encodeURIComponent(message);
  
  if (phoneNumber) {
    // Clean phone number - remove spaces, dashes, and ensure it starts with country code
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
  
  // Without phone number, opens WhatsApp to select a contact
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate the public quote URL
 * 
 * @param quoteId - The quote ID
 * @param baseUrl - The base URL of the application
 * @returns Public quote URL
 */
export function generateQuoteLink(quoteId: string, baseUrl: string): string {
  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/quotes/${quoteId}`;
}

/**
 * Copy text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch {
    return false;
  }
}
