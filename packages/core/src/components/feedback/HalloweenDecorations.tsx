'use client';

import React, { useMemo } from 'react';

/**
 * Halloween Decorations Component
 * Adds subtle decorative elements to pages - Requirements 12.2
 */

export interface HalloweenDecorationsProps {
  variant?: 'subtle' | 'festive' | 'minimal';
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

interface FloatingElement {
  emoji: string;
  top: string;
  left: string;
  size: string;
  delay: string;
  duration: string;
  opacity: number;
}

const decorativeEmojis = ['🎃', '👻', '🦇', '🕷️', '🕸️', '💀', '🌙', '⭐'];

export const HalloweenDecorations: React.FC<HalloweenDecorationsProps> = ({
  variant = 'subtle',
  density = 'low',
  className = '',
}) => {
  const elementCount = {
    low: 4,
    medium: 8,
    high: 12,
  }[density];

  const elements = useMemo<FloatingElement[]>(() => {
    return Array.from({ length: elementCount }, (_, i) => ({
      emoji: decorativeEmojis[i % decorativeEmojis.length],
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 90 + 5}%`,
      size: variant === 'festive' ? 'text-4xl' : variant === 'subtle' ? 'text-2xl' : 'text-xl',
      delay: `${Math.random() * 5}s`,
      duration: `${6 + Math.random() * 4}s`,
      opacity: variant === 'subtle' ? 0.1 : variant === 'minimal' ? 0.05 : 0.2,
    }));
  }, [elementCount, variant]);

  if (variant === 'minimal') {
    return null; // No decorations for minimal variant
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.size} select-none`}
          style={{
            top: element.top,
            left: element.left,
            opacity: element.opacity,
            animation: `float ${element.duration} ease-in-out infinite`,
            animationDelay: element.delay,
          }}
        >
          {element.emoji}
        </div>
      ))}
    </div>
  );
};

/**
 * Corner Cobweb Decoration
 * Adds cobweb decorations to corners of containers
 */
export interface CobwebCornerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CobwebCorner: React.FC<CobwebCornerProps> = ({
  position = 'top-right',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const positionClasses = {
    'top-left': 'top-0 left-0 -rotate-90',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0 rotate-180',
    'bottom-right': 'bottom-0 right-0 rotate-90',
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} opacity-10 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      🕸️
    </div>
  );
};

/**
 * Spooky Divider
 * A themed horizontal divider with Halloween elements
 */
export interface SpookyDividerProps {
  variant?: 'simple' | 'decorated';
  className?: string;
}

export const SpookyDivider: React.FC<SpookyDividerProps> = ({
  variant = 'simple',
  className = '',
}) => {
  if (variant === 'simple') {
    return (
      <div className={`flex items-center gap-4 my-6 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-halloween-purple/30 to-transparent" />
        <span className="text-halloween-purple/50">🎃</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-halloween-purple/30 to-transparent" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 my-6 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-halloween-purple/30" />
      <span className="text-halloween-orange/50 text-sm">👻</span>
      <span className="text-halloween-purple/50 text-lg">🎃</span>
      <span className="text-halloween-green/50 text-sm">🦇</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-halloween-purple/30" />
    </div>
  );
};

/**
 * Spooky Badge
 * A Halloween-themed badge for special labels
 */
export interface SpookyBadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'green' | 'orange';
  glow?: boolean;
  className?: string;
}

export const SpookyBadge: React.FC<SpookyBadgeProps> = ({
  children,
  variant = 'purple',
  glow = false,
  className = '',
}) => {
  const variantClasses = {
    purple: 'bg-halloween-purple/20 text-halloween-purple border-halloween-purple/30',
    green: 'bg-halloween-green/20 text-halloween-green border-halloween-green/30',
    orange: 'bg-halloween-orange/20 text-halloween-orange border-halloween-orange/30',
  };

  const glowClasses = glow ? {
    purple: 'shadow-[0_0_10px_rgba(139,92,246,0.3)]',
    green: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
    orange: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]',
  }[variant] : '';

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border
        ${variantClasses[variant]} ${glowClasses} ${className}
      `}
    >
      {children}
    </span>
  );
};
