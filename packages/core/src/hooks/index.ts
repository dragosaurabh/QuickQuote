// Authentication hooks
export { useAuth, type AuthState, type UseAuthReturn } from './useAuth';
export { useSession, type SessionState, type UseSessionReturn } from './useSession';

// Business hooks (Task 8)
export { useBusiness, type BusinessState, type UseBusinessReturn } from './useBusiness';
export { useCreateBusiness, type CreateBusinessState, type UseCreateBusinessReturn } from './useCreateBusiness';

// Service hooks (Task 9)
export { useServices, type ServicesState, type UseServicesReturn } from './useServices';
export { useCreateService, type CreateServiceState, type UseCreateServiceReturn } from './useCreateService';
export { useUpdateService, type UpdateServiceState, type UseUpdateServiceReturn } from './useUpdateService';
export { useDeleteService, type DeleteServiceState, type UseDeleteServiceReturn } from './useDeleteService';

// Customer hooks (Task 10)
export { useCustomers, type CustomersState, type UseCustomersReturn } from './useCustomers';
export { useCreateCustomer, type CreateCustomerState, type UseCreateCustomerReturn } from './useCreateCustomer';
export { useUpdateCustomer, type UpdateCustomerState, type UseUpdateCustomerReturn } from './useUpdateCustomer';

// Quote hooks (Task 12)
export { useQuotes, type QuotesState, type QuotesFilter, type UseQuotesReturn } from './useQuotes';
export { useQuote, type QuoteState, type UseQuoteReturn } from './useQuote';
export { useCreateQuote, type CreateQuoteInput, type CreateQuoteState, type UseCreateQuoteReturn } from './useCreateQuote';
export { useUpdateQuote, type UpdateQuoteInput, type UpdateQuoteState, type UseUpdateQuoteReturn } from './useUpdateQuote';

// Dashboard hooks (Task 16)
export { useDashboardStats, type DashboardStatsState, type UseDashboardStatsReturn } from './useDashboardStats';
