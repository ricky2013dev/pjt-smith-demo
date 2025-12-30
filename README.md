# Project Smith - Dental Insurance Verification System

A comprehensive HIPAA-compliant dental insurance verification system that automates patient data management, insurance verification, and benefits analysis using AI-powered tools.

## Quick Start

```bash
# Install dependencies
npm install

# Start local development with Docker PostgreSQL
npm run dev:local

# Or start with remote database
npm run dev

# Access the application
open http://localhost:3000
```

## Key Features

### Patient Management
- Comprehensive patient demographic and insurance tracking
- HIPAA-compliant data encryption for sensitive fields
- Multi-user support with role-based access control
- OCR-powered insurance card scanning

### Insurance Verification Workflow
1. **Fetch PMS** - Retrieve patient data from Practice Management System
2. **Document Analysis** - AI-powered OCR for insurance cards
3. **API Verification** - Automated eligibility checking (Stedi/Availity)
4. **AI Call Center** - Automated phone verification with insurance providers
5. **Save to PMS** - Update verified information back to PMS

### Admin Panel
- **User Management**: Create and manage system users
- **Patient Management**: Unified view of all patients across users with filtering
- **Interface Tables**: Manage external system integration data
- Full admin access control with RBAC

### Security & Compliance
- HIPAA-compliant data encryption (SSN, birthdate, insurance details)
- Role-based access control (admin, user, dental)
- Session-based authentication with PostgreSQL storage
- Automatic data masking with explicit decrypt actions

## Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React 19 + Tailwind CSS + Radix UI
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Passport.js
- **OCR**: Tesseract.js
- **AI Integration**: Multiple AI providers for verification

## Recent Updates

### Latest - Admin Patient Management Enhancement (2025-01-30)
- ✅ Redesigned patient management with unified table view
- ✅ Added user filter for viewing specific user's patients
- ✅ Implemented admin delete permissions for all patients
- ✅ Enhanced role-based authorization system
- ✅ Updated documentation with admin features

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Documentation

### Core Documentation
- 📘 **[Full Documentation](./doc/README.md)** - Complete system documentation
- 🔐 **[Admin Features](./doc/ADMIN_FEATURES.md)** - Admin panel capabilities
- 🏥 **[HIPAA Guide](./doc/HIPAA_SENSITIVE_DATA_GUIDE.md)** - Security and compliance
- 🐳 **[Docker Setup](./doc/DOCKER_SETUP.md)** - Local development with Docker
- 📊 **[Mockup Data](./doc/MOCKUPDATA_README.md)** - Sample data documentation

### Quick Links
- API Documentation: http://localhost:3000/api-docs (when running)
- Admin Panel: http://localhost:3000/admin/*
- User Roles: admin, user, dental

## Project Structure

```
pjt-smith-demo/
├── backend/          # Express.js API server
├── frontend/         # React frontend application
├── shared/           # Shared types and database schema
├── db/              # Database migrations
├── doc/             # Project documentation
├── mockupdata/      # Sample test data
└── script/          # Build and utility scripts
```

## Environment Setup

### Option 1: Local Development with Docker (Recommended)
```bash
# .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smithai?sslmode=disable
NODE_ENV=local_development
PORT=3000

# Start development
npm run dev:local
```

### Option 2: Remote Database
```bash
# .env.local
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NODE_ENV=development
PORT=3000

# Start development
npm run dev
```

## Key Commands

### Development
```bash
npm run dev:local        # Start with Docker PostgreSQL
npm run dev             # Start with remote database
npm run dev:clean       # Clean restart (stops Docker first)
```

### Database
```bash
npm run db:push         # Apply schema changes
npm run seed:transactions  # Load sample data
npm run docker:down     # Stop Docker containers
```

### Build & Production
```bash
npm run build           # Build for production
npm run start           # Start production server
npm run check           # Type check without build
```

## User Roles

- **admin**: Full system access, can manage all users and patients
- **user**: Standard access to own patients and verification workflows
- **dental**: Dental practice-specific role with patient access

## Database Schema

PostgreSQL with Drizzle ORM. Key tables:
- `users` - User authentication and roles
- `patients` - Patient demographics (encrypted sensitive fields)
- `insurances` - Insurance policies (encrypted identifiers)
- `transactions` - Verification transaction history
- `if_call_*` - Interface tables for external systems

See [doc/README.md](./doc/README.md#database-schema) for complete schema documentation.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Session verification
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `DELETE /api/patients/:id` - Delete patient (owner or admin)

### Admin
- `GET /api/users` - List all users (admin only)
- `GET /api/admin/users/:userId/patients` - Get user's patients (admin only)

## Contributing

1. Ensure all changes maintain HIPAA compliance
2. Add tests for new features
3. Update documentation
4. Follow TypeScript strict mode guidelines

## Support

For issues and questions:
- Check documentation in `doc/` directory
- Review API documentation at `/api-docs`
- See troubleshooting in `doc/ADMIN_FEATURES.md`

## License

MIT
