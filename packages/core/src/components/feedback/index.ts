// Feedback Components
export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export {
  ToastProvider,
  ToastContainer,
  ToastItem,
  useToast,
} from './Toast';
export type { ToastMessage, ToastType } from './Toast';

export { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';
export type { LoadingSpinnerProps, LoadingOverlayProps } from './LoadingSpinner';

export { Badge, getQuoteStatusVariant, formatQuoteStatus } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

// Halloween Decorations - Requirements 12.2
export {
  HalloweenDecorations,
  CobwebCorner,
  SpookyDivider,
  SpookyBadge,
} from './HalloweenDecorations';
export type {
  HalloweenDecorationsProps,
  CobwebCornerProps,
  SpookyDividerProps,
  SpookyBadgeProps,
} from './HalloweenDecorations';
