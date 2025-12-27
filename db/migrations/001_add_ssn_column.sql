-- Migration: Add SSN column to patients table
-- Date: 2025-12-26
-- Description: Adds encrypted SSN field for HIPAA-compliant patient data storage

-- ============================================
-- UPGRADE (Add SSN column)
-- ============================================

-- Add SSN column to patients table
ALTER TABLE patients
ADD COLUMN ssn TEXT;

-- Add comment to document that this field stores encrypted data
COMMENT ON COLUMN patients.ssn IS 'Social Security Number - Encrypted using AES-256-GCM (HIPAA-sensitive)';

-- Optional: Add index if you plan to search by SSN (on encrypted values)
-- Note: This is optional and depends on your use case
-- CREATE INDEX idx_patients_ssn ON patients(ssn);

-- ============================================
-- ROLLBACK (Remove SSN column)
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE patients DROP COLUMN ssn;
-- DROP INDEX IF EXISTS idx_patients_ssn;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify column was added
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'patients' AND column_name = 'ssn';

-- Check table structure
-- \d patients
