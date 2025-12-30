# HIPAA-Compliant Sensitive Data Handling Guide

## Overview

This application implements HIPAA-compliant handling of sensitive patient data through encryption, masking, and controlled access. All sensitive fields are automatically masked by default and require explicit user action to reveal.

## Architecture

### Components

1. **SensitiveDataField Component** (`/client/src/components/SensitiveDataField.tsx`)
   - Displays masked sensitive data by default
   - Provides a "View" button to temporarily reveal decrypted data
   - Auto-hides revealed data after 10 seconds for security
   - Supports customizable auto-hide delay

2. **Sensitive Data Service** (`/client/src/services/sensitiveDataService.ts`)
   - Centralized service for decryption operations
   - Utility functions for masking data
   - Field type validation
   - Common interface for all sensitive data operations

3. **Server Decrypt Endpoint** (`/server/routes.ts`)
   - POST `/api/patients/:id/decrypt`
   - Validates user permissions
   - Supports multiple field types: birthDate, phone, email, ssn
   - Returns decrypted values only to authorized users

## HIPAA-Sensitive Fields

The following fields are considered sensitive under HIPAA:

- **Birth Date** - Always encrypted in database
- **Phone Numbers** - Masked as `(***) ***-****`
- **Email Addresses** - Masked as `****@****.***`
- **SSN** - Masked as `***-**-****` (future implementation)
- **Addresses** - Can be encrypted if needed
- **Insurance Policy Numbers** - Should be encrypted
- **Medical Record Numbers** - Should be encrypted

## Usage Guide

### 1. Using SensitiveDataField Component

```typescript
import SensitiveDataField from '@/components/SensitiveDataField';

<SensitiveDataField
  patientId={patient.id}
  fieldName="birthDate"
  maskedValue="****-**-**"
  label="Date of Birth"
  isEncrypted={true}
  autoHideDelay={10000} // Optional: milliseconds, default 10000
/>
```

**Props:**
- `patientId`: The patient's ID (required)
- `fieldName`: The field name to decrypt (e.g., 'birthDate', 'phone', 'email')
- `maskedValue`: The masked value to display (e.g., '****-**-**')
- `label`: The field label for accessibility
- `isEncrypted`: Whether the field is encrypted (default: false)
- `autoHideDelay`: Time in ms before auto-hiding revealed data (default: 10000)

### 2. Using Sensitive Data Service

```typescript
import {
  decryptSensitiveData,
  maskSensitiveData,
  isSensitiveField,
  SENSITIVE_FIELD_TYPES
} from '@/services/sensitiveDataService';

// Decrypt a field
try {
  const value = await decryptSensitiveData(patientId, 'birthDate');
  console.log('Decrypted:', value);
} catch (error) {
  console.error('Failed to decrypt:', error);
}

// Mask a value
const masked = maskSensitiveData('555-123-4567', 'phone');
// Returns: '(***) ***-****'

// Check if field is sensitive
const isSensitive = isSensitiveField('birthDate'); // true
```

### 3. Server-Side Encryption

When storing sensitive data:

```typescript
import { encrypt, decrypt } from './crypto';

// Encrypt before saving
const encryptedBirthDate = encrypt(birthDate);
await storage.createPatient({
  ...patientData,
  birthDate: encryptedBirthDate
});

// Mask in API response
res.json({
  patient: {
    ...patient,
    birthDate: patient.birthDate ? '****-**-**' : null,
    birthDateEncrypted: !!patient.birthDate
  }
});
```

### 4. Adding New Sensitive Fields

To add a new sensitive field:

1. **Update the database schema** (if needed)
   ```typescript
   // In shared/schema.ts
   export const patients = pgTable("patients", {
     // ... other fields
     ssn: text("ssn"), // New sensitive field
   });
   ```

2. **Add encryption on server**
   ```typescript
   // In routes.ts - POST /api/patients
   const encryptedSSN = ssn ? encrypt(ssn) : null;
   await storage.createPatient({
     ...patient,
     ssn: encryptedSSN
   });
   ```

3. **Add masking in GET endpoints**
   ```typescript
   // In routes.ts - GET /api/patients/:id
   res.json({
     patient: {
       ...patient,
       ssn: patient.ssn ? '***-**-****' : null,
       ssnEncrypted: !!patient.ssn
     }
   });
   ```

4. **Update decrypt endpoint**
   ```typescript
   // In routes.ts - POST /api/patients/:id/decrypt
   const allowedFields = ['birthDate', 'phone', 'email', 'ssn'];

   case 'ssn':
     if (patient.ssn) {
       decryptedValue = decrypt(patient.ssn);
     }
     break;
   ```

5. **Add to sensitive field types**
   ```typescript
   // In sensitiveDataService.ts
   export const SENSITIVE_FIELD_TYPES = {
     // ... existing types
     SSN: 'ssn',
   } as const;
   ```

6. **Use in UI**
   ```typescript
   <SensitiveDataField
     patientId={patient.id}
     fieldName="ssn"
     maskedValue="***-**-****"
     label="SSN"
     isEncrypted={(patient as any).ssnEncrypted || false}
   />
   ```

## Security Features

### 1. Auto-Hide
Revealed sensitive data automatically hides after 10 seconds to prevent unauthorized viewing.

### 2. User Authentication
All decrypt requests require authentication. The server verifies:
- User is logged in
- User has access to the specific patient record

### 3. Audit Trail
All decryption requests are logged server-side for HIPAA compliance auditing.

### 4. Encryption at Rest
Sensitive fields are encrypted in the database using AES-256-GCM encryption.

### 5. Encryption in Transit
All API requests use HTTPS to prevent man-in-the-middle attacks.

## Best Practices

1. **Always mask by default**: Never send unencrypted sensitive data in API responses
2. **Use SensitiveDataField**: Always use the component for consistent UX
3. **Limit decrypt access**: Only decrypt when user explicitly requests
4. **Log all access**: Maintain audit logs for HIPAA compliance
5. **Minimize exposure time**: Use auto-hide feature to limit data visibility
6. **Validate permissions**: Always verify user has access before decrypting
7. **Use common service**: Use `sensitiveDataService` for all decrypt operations

## Testing

### Test Decryption
```typescript
// In browser console or test file
const response = await fetch('/api/patients/T001/decrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ field: 'birthDate' })
});
const data = await response.json();
console.log('Decrypted:', data.value);
```

### Test Masking
```typescript
import { maskSensitiveData } from '@/services/sensitiveDataService';

console.log(maskSensitiveData('1990-01-15', 'date')); // ****-**-**
console.log(maskSensitiveData('555-123-4567', 'phone')); // (***) ***-****
console.log(maskSensitiveData('test@example.com', 'email')); // ****@****.***
```

## Compliance Notes

This implementation follows HIPAA Security Rule requirements:
- **Access Control**: User authentication and authorization
- **Audit Controls**: Logging of all data access
- **Integrity Controls**: Encryption prevents unauthorized modification
- **Transmission Security**: HTTPS for all communications
- **Automatic Logoff**: Auto-hide feature provides session timeout for sensitive data

## Future Enhancements

1. Add SSN field to database schema
2. Implement address encryption
3. Add insurance policy number encryption
4. Implement role-based access control (RBAC)
5. Add comprehensive audit logging dashboard
6. Implement data retention policies
7. Add encryption key rotation
