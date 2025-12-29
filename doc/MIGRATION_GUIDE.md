# Database Migration Guide

## How to Run the SSN Column Migration

### Option 1: Using psql (PostgreSQL CLI)

```bash
# Connect to your database
psql -U your_username -d your_database_name

# Run the migration
\i db/migrations/001_add_ssn_column.sql

# Verify the column was added
\d patients
```

### Option 2: Direct SQL Execution

```bash
# Run migration from command line
psql -U your_username -d your_database_name -f db/migrations/001_add_ssn_column.sql
```

### Option 3: Using npm/drizzle-kit

If you're using Drizzle ORM:

```bash
# Generate migration
npx drizzle-kit generate:pg

# Push changes to database
npx drizzle-kit push:pg
```

### Option 4: Copy-Paste SQL

Simply copy this SQL and execute it in your database client:

```sql
-- Add SSN column to patients table
ALTER TABLE patients
ADD COLUMN ssn TEXT;

-- Add comment to document encryption
COMMENT ON COLUMN patients.ssn IS 'Social Security Number - Encrypted using AES-256-GCM (HIPAA-sensitive)';
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'ssn';

-- Expected output:
-- column_name | data_type | is_nullable
-- ssn         | text      | YES
```

## Rollback (If Needed)

If you need to remove the SSN column:

```sql
-- Remove SSN column
ALTER TABLE patients DROP COLUMN ssn;
```

## Important Notes

1. **Backup First**: Always backup your database before running migrations
   ```bash
   pg_dump your_database_name > backup_$(date +%Y%m%d).sql
   ```

2. **Test Environment**: Run on a test/staging database first

3. **Existing Data**: This migration is safe - it adds a new column without affecting existing data

4. **Nullable Column**: The SSN column is nullable, so existing patients won't break

5. **Encryption**: The application code already handles encryption - no additional database setup needed

## Database Connection Info

Update these values for your environment:

```bash
# Development
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Production
DATABASE_URL="postgresql://user:password@prod-host:5432/dbname"
```

## After Migration

1. Restart your application
2. Test creating a new patient with SSN
3. Test viewing encrypted SSN data
4. Verify SSN is encrypted in the database:
   ```sql
   SELECT id, ssn FROM patients WHERE ssn IS NOT NULL LIMIT 5;
   -- Should show encrypted strings, not plain SSN
   ```

## Troubleshooting

**Error: "column already exists"**
```sql
-- Check if column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'ssn';

-- If it exists, skip migration or drop and recreate
ALTER TABLE patients DROP COLUMN IF EXISTS ssn;
```

**Error: "permission denied"**
- Ensure your database user has ALTER TABLE permissions
- May need superuser access for COMMENT ON COLUMN

**Error: "relation 'patients' does not exist"**
- Verify you're connected to the correct database
- Check table name: `\dt` to list all tables
