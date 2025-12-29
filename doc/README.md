# Project Smith - Dental Insurance Verification System

## Overview
A comprehensive dental insurance verification system that automates patient data management, insurance verification, and benefits analysis using AI-powered tools.

## Project Structure

```
pjt-smith-demo/
├── backend/          # Express.js server (formerly 'server')
├── frontend/         # React frontend (formerly 'client')
├── shared/           # Shared code and database schema
├── db/              # Database migrations
├── doc/             # All project documentation
├── mockupdata/      # Sample data for testing
└── script/          # Build and utility scripts
```

## Database Schema

The application uses PostgreSQL with Drizzle ORM. The schema is defined in `shared/schema.ts`.

### Core Tables

#### Users
- **Purpose**: Authentication and user management
- **Fields**: id, email, username, password, role, dataSource
- **Relations**: One-to-many with patients and coverageByCode

#### Patients
- **Purpose**: Patient demographic information
- **Fields**: id, userId, active, givenName, familyName, gender, birthDate (encrypted), ssn (encrypted)
- **HIPAA Sensitive**: birthDate and ssn are encrypted
- **Relations**:
  - One-to-many with patientTelecoms, patientAddresses, insurances, appointments, treatments, coverageDetails, verificationStatuses, aiCallHistory, transactions, coverageByCode

#### Patient Telecoms
- **Purpose**: Patient contact information (phone/email)
- **Fields**: id, patientId, system, value

#### Patient Addresses
- **Purpose**: Patient address information
- **Fields**: id, patientId, line1, line2, city, state, postalCode

#### Insurances
- **Purpose**: Patient insurance policy information
- **Fields**: id, patientId, type (Primary/Secondary), provider, policyNumber, groupNumber, subscriberName, subscriberId, relationship, effectiveDate, expirationDate, deductible, deductibleMet, maxBenefit, preventiveCoverage, basicCoverage, majorCoverage

#### Appointments
- **Purpose**: Patient appointment scheduling
- **Fields**: id, patientId, date, time, type, status (scheduled/completed/cancelled), provider

#### Treatments
- **Purpose**: Patient treatment history
- **Fields**: id, patientId, name, date, cost

#### Coverage Details
- **Purpose**: Insurance coverage financial details
- **Fields**: id, patientId, annualMaximum, annualUsed, deductible, deductibleMet
- **Relations**: One-to-many with procedures

#### Procedures
- **Purpose**: Dental procedure coverage information
- **Fields**: id, coverageId, code, name, category (Preventive/Basic/Major/Orthodontic), coverage, estimatedCost, patientPays

#### Verification Statuses
- **Purpose**: Track verification workflow status
- **Fields**: id, patientId, fetchPMS (fetch from PMS), documentAnalysis, apiVerification, callCenter, saveToPMS
- **Status Values**: completed, in_progress, pending

#### Transactions
- **Purpose**: Track all verification transactions
- **Fields**:
  - Core: id, requestId, patientId, type (FETCH/API/CALL/FAX/SAVE), method, startTime, endTime, duration, status (SUCCESS/PARTIAL/FAILED)
  - Patient Info: patientName, insuranceProvider, insuranceRep, runBy
  - Metrics: verificationScore, fetchStatus, saveStatus, responseCode, endpoint, phoneNumber, errorMessage
  - Data: eligibilityCheck, benefitsVerification, coverageDetails, deductibleInfo, transcript, rawResponse
- **Relations**: One-to-many with callCommunications and transactionDataVerified

#### Call Communications
- **Purpose**: Track AI call center conversation details
- **Fields**: id, transactionId, timestamp, speaker (AI/InsuranceRep/System), message, type (question/answer/confirmation/hold/transfer/note)

#### Transaction Data Verified
- **Purpose**: Track which data items were verified in a transaction
- **Fields**: id, transactionId, item

#### AI Call History
- **Purpose**: Track AI call center interaction history
- **Fields**: id, patientId, topic, date, time, summary, duration, agent, status

#### Coverage By Code
- **Purpose**: Detailed coverage verification by procedure code
- **Fields**: id, patientId, userId, saiCode, refInsCode, category, fieldName, preStepValue, verified, verifiedBy, comments, timestamp, coverageData (JSON)

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Session**: express-session with connect-pg-simple
- **OCR**: Tesseract.js for insurance card scanning
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19
- **Router**: Wouter
- **State Management**: TanStack Query
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Themes**: next-themes

### Development Tools
- **Build**: Vite + esbuild
- **Type Checking**: TypeScript
- **Database Migrations**: Drizzle Kit

## Environment Setup

### Prerequisites
- Node.js 22+
- PostgreSQL 16

### Environment Variables
Create a `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
PORT=5000
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed transaction data (optional)
npm run seed:transactions

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Database Migrations

Database migrations are managed by Drizzle Kit and stored in `db/migrations/`.

To create a new migration:
```bash
npx drizzle-kit generate
```

To apply migrations:
```bash
npm run db:push
```

See `doc/MIGRATION_GUIDE.md` for detailed migration instructions.

## Security & Compliance

### HIPAA Compliance
This system handles Protected Health Information (PHI) and must comply with HIPAA regulations.

**Encrypted Fields:**
- Patient birth dates
- Social Security Numbers (SSN)

See `doc/HIPAA_SENSITIVE_DATA_GUIDE.md` and `doc/SSN_FIELD_IMPLEMENTATION.md` for detailed security implementation.

### Authentication
- Passport.js local strategy
- Password hashing with bcrypt
- Session-based authentication stored in PostgreSQL

## API Documentation

API documentation is available via Swagger UI when running the development server:
- Navigate to `/api-docs` endpoint
- Interactive API testing interface
- Complete endpoint documentation

## Workflow Overview

### Insurance Verification Process

1. **Fetch PMS** - Retrieve patient data from Practice Management System
2. **Document Analysis** - OCR scan insurance cards and documents
3. **API Verification** - Automated eligibility checking via insurance APIs (Stedi/Availity)
4. **Call Center** - AI-powered phone verification with insurance providers
5. **Save to PMS** - Update verified information back to PMS

Each step is tracked in the `verificationStatuses` table and detailed transactions are logged in the `transactions` table.

### Transaction Types

- **FETCH**: Retrieve data from PMS
- **API**: Insurance eligibility API calls
- **CALL**: AI call center verification
- **FAX**: Fax-based verification (legacy)
- **SAVE**: Save verified data back to PMS

## Development

### Code Organization

- **backend/**: API routes, database, authentication, OCR, storage
- **frontend/src/**: React components, services, contexts
- **shared/**: Database schema and shared types
- **mockupdata/**: Sample data for development

### Type Safety

The application is fully typed with TypeScript. Database types are automatically inferred from the Drizzle schema using `$inferSelect`.

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check without build
- `npm run db:push` - Push schema changes to database
- `npm run seed:transactions` - Seed sample transaction data
- `npm run refresh-dates` - Update mockup data with current dates

## Additional Documentation

- `CLAUDE_COMMANDS.md` - Claude Code CLI commands reference
- `DYNAMIC_DATES_README.md` - Dynamic date generation for mockup data
- `HIPAA_SENSITIVE_DATA_GUIDE.md` - HIPAA compliance guidelines
- `MIGRATION_GUIDE.md` - Database migration guide
- `MOCKUPDATA_README.md` - Sample data documentation
- `SSN_FIELD_IMPLEMENTATION.md` - SSN field security implementation
- `to-do.md` - Development tasks and feature requests

## License
MIT
