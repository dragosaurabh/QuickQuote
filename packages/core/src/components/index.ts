// Base UI Components
export {
  Button,
  Input,
  Select,
  Checkbox,
  TextArea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  FileUpload,
} from './ui';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  SelectProps,
  SelectOption,
  CheckboxProps,
  TextAreaProps,
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
  FileUploadProps,
} from './ui';

// Layout Components
export { Header, Sidebar, DashboardLayout } from './layout';
export type {
  HeaderProps,
  SidebarProps,
  NavItem,
  DashboardLayoutProps,
} from './layout';

// Feedback Components
export {
  Modal,
  ToastProvider,
  ToastContainer,
  ToastItem,
  useToast,
  LoadingSpinner,
  LoadingOverlay,
  Badge,
  getQuoteStatusVariant,
  formatQuoteStatus,
  // Halloween Decorations - Requirements 12.2
  HalloweenDecorations,
  CobwebCorner,
  SpookyDivider,
  SpookyBadge,
} from './feedback';
export type {
  ModalProps,
  ToastMessage,
  ToastType,
  LoadingSpinnerProps,
  LoadingOverlayProps,
  BadgeProps,
  BadgeVariant,
  HalloweenDecorationsProps,
  CobwebCornerProps,
  SpookyDividerProps,
  SpookyBadgeProps,
} from './feedback';

// Auth Components
export { AuthProvider, useAuthContext } from './auth';

// Onboarding Components
export { OnboardingWizard } from './onboarding';
export type { OnboardingWizardProps } from './onboarding';

// Service Components
export { ServiceForm, ServiceCard, ServiceList } from './services';
export type { ServiceFormProps, ServiceCardProps, ServiceListProps } from './services';

// Customer Components
export { CustomerForm, CustomerCard, CustomerList, InlineCustomerForm } from './customers';
export type { CustomerFormProps, CustomerCardProps, CustomerListProps, InlineCustomerFormProps } from './customers';

// Quote Components
export {
  CustomerSelector,
  ServiceSelector,
  QuoteItemRow,
  QuoteItemsList,
  DiscountInput,
  QuoteCreationForm,
  QuotePreview,
  QuotePDF,
  useQuotePDF,
  QuoteShare,
} from './quote';
export type {
  CustomerSelectorProps,
  ServiceSelectorProps,
  QuoteItemData,
  QuoteItemRowProps,
  QuoteItemsListProps,
  DiscountConfig,
  DiscountType,
  DiscountInputProps,
  QuoteCreationFormProps,
  QuoteFormData,
  QuotePreviewProps,
  QuotePDFProps,
  UseQuotePDFReturn,
  QuoteShareProps,
} from './quote';

// Quotes Management Components
export { QuoteList } from './quotes';
export type { QuoteListProps } from './quotes';

// Dashboard Components
export { StatsCard, RecentQuotes, QuickActions } from './dashboard';
export type { StatsCardProps, RecentQuotesProps, QuickActionsProps } from './dashboard';

// Settings Components
export { SettingsPage } from './settings';
export type { SettingsPageProps } from './settings';
