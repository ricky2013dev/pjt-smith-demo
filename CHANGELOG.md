# Changelog

All notable changes to the Project Smith - Dental Insurance Verification System will be documented in this file.

## [Latest] - 2025-01-30

### Added - Admin Patient Management Enhancement

#### Patient Management UI Redesign
- **Unified Table View**: Replaced expandable user cards with a single flat table showing all patients
- **User Column**: Added user identification column showing username and email for each patient
- **User Filter**: Implemented dropdown filter to view patients by specific user or all users
- **Auto-load Patients**: Patients automatically load when filter is applied
- **Responsive Design**: Maintains consistent dark mode support and Material icons

#### Authorization & Access Control
- **Admin Delete Permission**: Admins can now delete patients belonging to any user
- **Role-based Validation**: Updated patient delete endpoint (`DELETE /api/patients/:id`) to check user role
  - Regular users can only delete their own patients
  - Admin users can delete any patient in the system
- **Enhanced Security**: Maintains ownership validation while adding admin override capability

#### Technical Implementation
- **Component**: `frontend/src/components/admin/PatientManagement.tsx`
  - Changed from `userPatients` record to `allPatients` array
  - Added `PatientWithUser` interface for patient-user relationships
  - Implemented parallel data fetching with `Promise.all` for efficiency
  - Removed expandable state management

- **Backend**: `backend/routes.ts:1803-1831`
  - Updated delete validation logic: `if (patient.userId !== userId && userRole !== 'admin')`
  - Added `userRole` session check
  - Maintains cascade delete for all related data

### Security Considerations
- Admin actions are logged through existing transaction system
- HIPAA compliance maintained with existing encryption for sensitive fields
- Role validation occurs at both middleware and endpoint levels
- Session-based authentication prevents unauthorized access

### Database Schema
No schema changes required. Utilizes existing:
- `users.role` field for permission checking
- Cascade delete constraints on foreign keys
- `patients.userId` for ownership validation

### API Changes

#### Modified Endpoints
- `DELETE /api/patients/:id`
  - Now accepts requests from admin users for any patient
  - Maintains owner validation for non-admin users
  - Returns 403 (Forbidden) only when user is neither owner nor admin

### Documentation Updates
- Updated `doc/README.md` with Admin Panel features section
- Added User Roles & Permissions documentation
- Documented key API endpoints
- Added authorization details to Security & Compliance section

---

## Previous Versions

### [1.0.0] - Initial Release
- Core patient management system
- Insurance verification workflows
- AI-powered call center integration
- OCR document scanning
- HIPAA-compliant data encryption
- Multi-user support with role-based access
- Admin panel for user management
- Interface table system for external integration
