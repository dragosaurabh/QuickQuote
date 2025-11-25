'use client';

import React, { useState, useEffect } from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  customMessage?: string;
  variant?: 'default' | 'spooky';
}

const sizeStyles: Record<string, { spinner: string; text: string; icon: string }> = {
  sm: { spinner: 'w-6 h-6', text: 'text-sm', icon: 'text-lg' },
  md: { spinner: 'w-10 h-10', text: 'text-base', icon: 'text-2xl' },
  lg: { spinner: 'w-16 h-16', text: 'text-lg', icon: 'text-4xl' },
};

// Halloween-themed loading messages per Requirements 12.2
const halloweenMessages = [
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

// Spooky icons that rotate during loading
const spookyIcons = ['🎃', '👻', '🦇', '🕷️', '💀', '🧙‍♀️', '🔮', '🌙'];

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  showMessage = true,
  customMessage,
  variant = 'spooky',
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const styles = sizeStyles[size];

  useEffect(() => {
    if (!showMessage || customMessage) return;

    // Rotate through messages every 2 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % halloweenMessages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [showMessage, customMessage]);

  useEffect(() => {
    if (variant !== 'spooky') return;

    // Rotate through spooky icons every 500ms
    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % spookyIcons.length);
    }, 500);

    return () => clearInterval(iconInterval);
  }, [variant]);

  const displayMessage = customMessage || halloweenMessages[messageIndex];

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      {/* Spinner with Halloween theme */}
      <div className={`relative ${styles.spinner}`}>
        {variant === 'spooky' ? (
          <>
            {/* Spooky rotating icon */}
            <div className={`absolute inset-0 flex items-center justify-center ${styles.icon} animate-bounce`}>
              {spookyIcons[iconIndex]}
            </div>
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-halloween-purple/30 animate-ping"
              style={{ animationDuration: '1.5s' }}
            />
            {/* Inner spinning ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-halloween-purple border-r-halloween-orange animate-spin"
              style={{ animationDuration: '1s' }}
            />
          </>
        ) : (
          <>
            {/* Default spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
          </>
        )}
      </div>

      {/* Message with Halloween styling */}
      {showMessage && (
        <p
          className={`${styles.text} text-text-muted text-center transition-opacity duration-300`}
          style={{
            textShadow: variant === 'spooky' ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'none',
          }}
        >
          {displayMessage}
        </p>
      )}

      {/* Screen reader text */}
      <span className="sr-only">Loading, please wait</span>
    </div>
  );
};

// Full page loading overlay
export interface LoadingOverlayProps extends LoadingSpinnerProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  ...spinnerProps
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner {...spinnerProps} size="lg" />
    </div>
  );
};
