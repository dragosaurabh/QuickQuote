# Requirements Document

## Introduction

QuickQuote is a web application that enables service businesses to create and send professional price quotes to customers quickly via WhatsApp. The system provides a streamlined workflow for managing services, customers, and quotes with a Halloween-themed UI ("SpookyQuote"). As a Skeleton Crew project, it demonstrates template versatility through two distinct applications: one for web designers and one for photographers.

## Glossary

- **QuickQuote System**: The web application for creating and managing price quotes
- **Business Owner**: A user who owns a service business and creates quotes for customers
- **Customer**: A recipient of price quotes created by the business owner
- **Service**: A product or offering with a defined price that can be included in quotes
- **Quote**: A formal price proposal containing selected services, quantities, discounts, and terms
- **Quote Item**: An individual service line item within a quote
- **Skeleton Template**: The shared core codebase used by both application variants
- **Application Variant**: A themed instance of the skeleton template (Web Designer or Photographer)

## Requirements

### Requirement 1: User Authentication

**User Story:** As a business owner, I want to securely log into the application, so that I can access my business data and create quotes.

#### Acceptance Criteria

1. WHEN a user visits the application without authentication THEN the QuickQuote System SHALL display the landing page with login options
2. WHEN a user clicks the Google login button THEN the QuickQuote System SHALL initiate OAuth authentication via Supabase Auth
3. WHEN authentication succeeds THEN the QuickQuote System SHALL redirect the user to the dashboard
4. WHEN authentication fails THEN the QuickQuote System SHALL display an error message and allow retry
5. WHEN a user clicks logout THEN the QuickQuote System SHALL terminate the session and redirect to the landing page

### Requirement 2: Business Profile Setup

**User Story:** As a business owner, I want to set up my business profile with logo and contact details, so that my quotes look professional and contain accurate business information.

#### Acceptance Criteria

1. WHEN a new user completes authentication for the first time THEN the QuickQuote System SHALL redirect to the onboarding flow
2. WHEN a user submits business details (name, phone, email, address) THEN the QuickQuote System SHALL validate all required fields contain non-empty values
3. WHEN a user uploads a logo image THEN the QuickQuote System SHALL accept PNG or JPG files up to 2MB in size
4. WHEN a user saves business profile THEN the QuickQuote System SHALL persist the data to the database immediately
5. WHEN a user edits business details from settings THEN the QuickQuote System SHALL update the stored profile and reflect changes in future quotes

### Requirement 3: Service Management

**User Story:** As a business owner, I want to add and manage my services with prices and categories, so that I can quickly select them when creating quotes.

#### Acceptance Criteria

1. WHEN a user adds a new service with name, price, and category THEN the QuickQuote System SHALL create the service record and display it in the service list
2. WHEN a user edits an existing service THEN the QuickQuote System SHALL update the service record while preserving historical quote data
3. WHEN a user deletes a service THEN the QuickQuote System SHALL mark the service as inactive rather than removing it
4. WHEN a user views the service list THEN the QuickQuote System SHALL group services by category
5. WHEN a service price is entered THEN the QuickQuote System SHALL validate the price is a positive number

### Requirement 4: Customer Management

**User Story:** As a business owner, I want to manage my customer contacts, so that I can quickly select them when creating quotes and maintain a customer database.

#### Acceptance Criteria

1. WHEN a user adds a new customer with name and phone THEN the QuickQuote System SHALL create the customer record
2. WHEN a user adds a customer with optional email and address THEN the QuickQuote System SHALL store all provided fields
3. WHEN a user searches for a customer by name THEN the QuickQuote System SHALL return matching customers within 500 milliseconds
4. WHEN a user edits customer details THEN the QuickQuote System SHALL update the customer record
5. WHEN creating a quote THEN the QuickQuote System SHALL allow adding a new customer inline without leaving the quote creation flow

### Requirement 5: Quote Creation

**User Story:** As a business owner, I want to create professional quotes by selecting services and customers, so that I can send accurate pricing to my clients quickly.

#### Acceptance Criteria

1. WHEN a user starts quote creation THEN the QuickQuote System SHALL require customer selection before proceeding
2. WHEN a user selects services via checkboxes THEN the QuickQuote System SHALL add each selected service as a quote item with quantity of 1
3. WHEN a user adjusts item quantity THEN the QuickQuote System SHALL recalculate the line item total (quantity × unit price)
4. WHEN a user applies a percentage discount THEN the QuickQuote System SHALL calculate discount as (subtotal × percentage / 100)
5. WHEN a user applies a fixed discount THEN the QuickQuote System SHALL subtract the fixed amount from the subtotal
6. WHEN any quote value changes THEN the QuickQuote System SHALL update the live total display within 100 milliseconds
7. WHEN a user adds notes or terms THEN the QuickQuote System SHALL include them in the generated quote
8. WHEN a user sets validity days THEN the QuickQuote System SHALL calculate the expiration date from the current date
9. WHEN a user generates the quote THEN the QuickQuote System SHALL assign a unique quote number in format "QQ-YYYY-NNN"

### Requirement 6: Quote Calculation Engine

**User Story:** As a business owner, I want accurate automatic calculations, so that I can trust the totals shown to customers.

#### Acceptance Criteria

1. WHEN calculating subtotal THEN the QuickQuote System SHALL sum all (quantity × unit price) for each quote item
2. WHEN calculating final total with percentage discount THEN the QuickQuote System SHALL compute (subtotal - (subtotal × discount_percentage / 100))
3. WHEN calculating final total with fixed discount THEN the QuickQuote System SHALL compute (subtotal - fixed_discount_amount)
4. WHEN discount exceeds subtotal THEN the QuickQuote System SHALL set the final total to zero
5. WHEN serializing quote data for storage THEN the QuickQuote System SHALL encode using JSON format
6. WHEN deserializing quote data from storage THEN the QuickQuote System SHALL parse the JSON and restore the original data structure

### Requirement 7: Quote Preview and PDF Generation

**User Story:** As a business owner, I want to preview and download professional PDF quotes, so that I can share polished documents with customers.

#### Acceptance Criteria

1. WHEN a user clicks generate quote THEN the QuickQuote System SHALL display a preview with business header, customer details, itemized services, and totals
2. WHEN a user clicks download PDF THEN the QuickQuote System SHALL generate a PDF file matching the preview layout
3. WHEN generating PDF THEN the QuickQuote System SHALL include business logo, quote number, date, and validity period
4. WHEN generating PDF THEN the QuickQuote System SHALL render the itemized table with service name, quantity, unit price, and line total
5. WHEN generating PDF THEN the QuickQuote System SHALL display subtotal, discount (if applied), and final total

### Requirement 8: Quote Sharing via WhatsApp

**User Story:** As a business owner, I want to share quotes via WhatsApp with a pre-filled message, so that I can reach customers on their preferred platform instantly.

#### Acceptance Criteria

1. WHEN a user clicks share on WhatsApp THEN the QuickQuote System SHALL open WhatsApp with a pre-filled message containing quote summary
2. WHEN generating the WhatsApp message THEN the QuickQuote System SHALL include business name, customer name, quote number, date, validity, total amount, and quote link
3. WHEN a user clicks copy link THEN the QuickQuote System SHALL copy the quote URL to clipboard and display confirmation
4. WHEN a customer opens the quote link THEN the QuickQuote System SHALL display the quote preview without requiring authentication

### Requirement 9: Quote Management

**User Story:** As a business owner, I want to view and manage all my quotes, so that I can track their status and follow up with customers.

#### Acceptance Criteria

1. WHEN a user views the quotes list THEN the QuickQuote System SHALL display all quotes sorted by creation date descending
2. WHEN a user filters by status (Pending, Accepted, Rejected, Expired) THEN the QuickQuote System SHALL show only quotes matching the selected status
3. WHEN a user searches by customer name or quote number THEN the QuickQuote System SHALL return matching quotes
4. WHEN a user clicks duplicate quote THEN the QuickQuote System SHALL create a new quote with the same services and customer
5. WHEN a user updates quote status THEN the QuickQuote System SHALL persist the change immediately
6. WHEN a quote passes its validity date THEN the QuickQuote System SHALL automatically mark it as Expired

### Requirement 10: Dashboard Analytics

**User Story:** As a business owner, I want to see quick stats about my quotes, so that I can understand my business performance at a glance.

#### Acceptance Criteria

1. WHEN a user views the dashboard THEN the QuickQuote System SHALL display total quotes created this month
2. WHEN a user views the dashboard THEN the QuickQuote System SHALL display total value of accepted quotes this month
3. WHEN a user views the dashboard THEN the QuickQuote System SHALL display total pending amount
4. WHEN a user views the dashboard THEN the QuickQuote System SHALL display recent quotes list (last 5)

### Requirement 11: Application Variants (Skeleton Crew)

**User Story:** As a developer, I want the template to support multiple themed applications, so that different industries can use customized versions.

#### Acceptance Criteria

1. WHEN deploying the Web Designer variant THEN the QuickQuote System SHALL pre-load web design services (Basic Website, E-commerce, Landing Page, Maintenance, Domain Setup, SEO Package)
2. WHEN deploying the Photographer variant THEN the QuickQuote System SHALL pre-load photography services (Wedding, Pre-Wedding, Birthday, Product, Editing, Album Design)
3. WHEN rendering the Web Designer variant THEN the QuickQuote System SHALL apply tech-themed color scheme with Halloween accents
4. WHEN rendering the Photographer variant THEN the QuickQuote System SHALL apply creative-themed color scheme with Halloween accents
5. WHEN building either variant THEN the QuickQuote System SHALL use the shared skeleton template code from packages/core

### Requirement 12: Halloween Theme UI

**User Story:** As a user, I want a fun Halloween-themed interface that remains professional, so that the app is enjoyable to use while still being business-appropriate.

#### Acceptance Criteria

1. WHEN rendering the application THEN the QuickQuote System SHALL use dark mode as the default theme
2. WHEN displaying loading states THEN the QuickQuote System SHALL show themed messages (e.g., "Summoning your quote...")
3. WHEN a quote is successfully created THEN the QuickQuote System SHALL display a themed success message
4. WHEN rendering the UI THEN the QuickQuote System SHALL use Halloween accent colors (purple, green, orange) for interactive elements
5. WHEN rendering headings THEN the QuickQuote System SHALL use spooky-styled fonts while maintaining readability for body text

### Requirement 13: Data Persistence and Validation

**User Story:** As a business owner, I want my data saved reliably, so that I never lose quotes or customer information.

#### Acceptance Criteria

1. WHEN saving any record THEN the QuickQuote System SHALL persist to Supabase database within 2 seconds
2. WHEN a required field is empty THEN the QuickQuote System SHALL display a validation error and prevent submission
3. WHEN a database operation fails THEN the QuickQuote System SHALL display a user-friendly error message and allow retry
4. WHEN loading data THEN the QuickQuote System SHALL display a loading indicator until data is ready
5. WHEN a user's session is active THEN the QuickQuote System SHALL only allow access to that user's business data

### Requirement 14: Responsive Design

**User Story:** As a business owner, I want to use the app on my phone, so that I can create quotes while meeting with customers.

#### Acceptance Criteria

1. WHEN viewing on mobile devices (width < 768px) THEN the QuickQuote System SHALL display a mobile-optimized layout
2. WHEN viewing on tablet devices (768px ≤ width < 1024px) THEN the QuickQuote System SHALL display a tablet-optimized layout
3. WHEN viewing on desktop devices (width ≥ 1024px) THEN the QuickQuote System SHALL display the full desktop layout
4. WHEN interacting with touch devices THEN the QuickQuote System SHALL provide touch-friendly tap targets (minimum 44px)
