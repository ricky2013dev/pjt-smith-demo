# Admin Panel Features

## Overview

The Admin Panel provides system-wide management capabilities for users with the `admin` role. It includes comprehensive user management, patient oversight, and system monitoring features.

## Access Requirements

- **Role**: User must have `role: 'admin'` in the database
- **Authentication**: Session-based authentication required
- **URL**: `/admin/*` routes (protected by `requireAdmin` middleware)

## Features

### 1. User Management

**Route**: `/admin/users`
**Component**: `frontend/src/components/admin/UserManagement.tsx`

#### Capabilities
- **View All Users**: Display all registered users in the system
- **Create Users**: Add new users with specific roles (admin, user, dental)
- **Assign Data Sources**: Configure user-specific data source connections
- **Role Management**: Set and modify user roles
- **User Details**: View email, username, role, and data source for each user

#### UI Features
- Clean table view with user information
- User creation modal with form validation
- Role badges with color coding
- Dark mode support

### 2. Patient Management

**Route**: `/admin/patients`
**Component**: `frontend/src/components/admin/PatientManagement.tsx`
**Backend**: `backend/routes.ts` - Patient endpoints

#### Capabilities

##### Unified Table View
- **All Patients**: View all patients across all users in a single table
- **User Column**: Shows which user each patient belongs to (username + email)
- **Complete Patient Data**:
  - Patient ID
  - Full name (given name + family name)
  - Gender
  - Contact information (phone, email)
  - Insurance details (provider, policy type)
  - Active status
  - Actions (delete)

##### User Filtering
- **Filter Dropdown**: Select specific user or "All Users"
- **Auto-load**: Patients automatically load when filter changes
- **Clear Filter**: Quick button to reset to "All Users" view
- **Persistent State**: Filter selection maintained during session

##### Admin Privileges
- **Delete Any Patient**: Admins can delete patients belonging to any user
- **Cascade Delete**: Patient deletion automatically removes:
  - Patient contact information (telecoms)
  - Patient addresses
  - Insurance policies
  - Appointments
  - Treatments
  - Coverage details and procedures
  - Verification statuses
  - AI call history
  - Transactions
  - Coverage by code records
  - Interface table records

#### Technical Implementation

**Data Fetching** (`PatientManagement.tsx:90-116`)
```typescript
const fetchAllPatients = async () => {
  const usersToFetch = selectedUserId === 'all'
    ? users
    : users.filter(u => u.id === selectedUserId);

  const patientPromises = usersToFetch.map(async (user) => {
    const response = await fetch(`/api/admin/users/${user.id}/patients`);
    const data = await response.json();
    return data.patients.map((patient) => ({
      ...patient,
      user: user
    }));
  });

  const results = await Promise.all(patientPromises);
  setAllPatients(results.flat());
};
```

**Authorization** (`backend/routes.ts:1816`)
```typescript
// Check if user has permission (owner or admin)
if (patient.userId !== userId && userRole !== 'admin') {
  return res.status(403).json({ error: "Access denied" });
}
```

### 3. Interface Table Management

**Route**: `/admin/interface-tables`
**Component**: `frontend/src/components/admin/InterfaceTableManagement.tsx`

#### Capabilities
- **View Interface Tables**: Display call transaction interface data
- **Call Transaction List**: View all CALL type transactions
- **Coverage Code Data**: Access procedure code coverage information
- **Call Messages**: Review AI call center communication logs
- **Filtering**: Filter by date range, transaction status, patient
- **Export**: Export interface data for external systems

#### Interface Tables
- `if_call_transaction_list`: Main call transaction records
- `if_call_coverage_code_list`: Coverage code snapshots
- `if_call_message_list`: Call communication history

## API Endpoints

### Admin-Only Endpoints

#### User Management
```
GET  /api/users                    - List all users (admin only)
POST /api/users                    - Create new user (admin only)
```

#### Patient Management
```
GET  /api/admin/users/:userId/patients  - Get all patients for a specific user
```

#### Interface Tables
```
GET  /api/admin/interface-tables        - Get interface table data
```

### Admin-Enhanced Endpoints

These endpoints work for both regular users (own data) and admins (all data):

```
GET    /api/patients              - List patients
POST   /api/patients              - Create patient
GET    /api/patients/:id          - Get patient details
DELETE /api/patients/:id          - Delete patient (owner or admin)
PUT    /api/patients/:id          - Update patient (owner or admin)
POST   /api/patients/:id/decrypt  - Decrypt sensitive fields (owner or admin)
```

## Security Features

### Session Management
- Admin role stored in session: `(req.session as any).userRole`
- Session validation on every request
- Automatic session expiration after inactivity

### Authorization Checks
- **Middleware**: `requireAdmin` middleware on admin-only routes
- **Endpoint-level**: Role checks in individual endpoints
- **Dual validation**: Both ownership and admin role checked

### Audit Trail
- All admin actions logged through transaction system
- User actions traceable via session data
- Timestamps on all database operations

### HIPAA Compliance
- Encrypted sensitive fields remain encrypted in admin views
- Explicit decrypt action required to view sensitive data
- Decryption events logged
- Access control prevents unauthorized data access

## Navigation

### Admin Layout
**Component**: `frontend/src/components/admin/AdminLayout.tsx`

Features:
- Consistent navigation across admin pages
- User information display (name, email)
- Logout functionality
- Page title and description
- Breadcrumb navigation
- Dark mode toggle

### Menu Structure
```
Admin Panel
├── User Management
│   └── View/Create Users
├── Patient Management
│   ├── All Patients View
│   └── User-Filtered View
└── Interface Tables
    ├── Call Transactions
    ├── Coverage Codes
    └── Call Messages
```

## User Experience

### Design Principles
- **Consistent Interface**: Material Design icons throughout
- **Dark Mode**: Full dark mode support for all admin pages
- **Responsive**: Works on desktop and tablet devices
- **Loading States**: Proper loading indicators for async operations
- **Error Handling**: Clear error messages with retry options
- **Confirmation Dialogs**: Required for destructive actions (delete)

### Visual Indicators
- Role badges with color coding (admin: orange, dental: blue, user: green)
- Status badges (active: green, inactive: gray)
- Empty states with helpful icons and messages
- Hover effects for interactive elements

## Best Practices

### For Admins
1. **Regular Audits**: Review user list and patient data regularly
2. **Careful Deletion**: Always confirm before deleting patients (irreversible)
3. **Role Assignment**: Assign minimal necessary roles to users
4. **Data Source**: Configure data sources only when needed
5. **Sensitive Data**: Decrypt sensitive data only when necessary

### For Developers
1. **Validation**: Always validate both authentication and authorization
2. **Error Handling**: Provide clear error messages for access denial
3. **Testing**: Test admin features with both admin and non-admin users
4. **Documentation**: Keep API documentation up to date
5. **Security**: Never bypass authorization checks for convenience

## Troubleshooting

### Common Issues

**"Access denied" when deleting patient**
- Solution: Ensure user has admin role in database
- Check: `SELECT role FROM users WHERE id = 'user-id'`
- Fix: `UPDATE users SET role = 'admin' WHERE id = 'user-id'`

**Patient list not loading**
- Check: Network tab for failed API requests
- Verify: Database connection is active
- Check: User has proper session authentication

**User filter not working**
- Verify: Users exist in database
- Check: API endpoint `/api/admin/users/:userId/patients` is accessible
- Ensure: User has patients to display

## Future Enhancements

Potential admin features for future development:
- Bulk patient operations (import/export)
- Advanced filtering and search
- Patient merge functionality
- Audit log viewer
- System health monitoring
- User activity analytics
- Role permission customization
- Multi-factor authentication for admin accounts
