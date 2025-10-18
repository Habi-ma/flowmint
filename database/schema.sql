-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- COMPANY TABLE
-- Stores all registered companies with their wallet information
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL,
    
    -- Company Information
    company_name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    business_address TEXT NOT NULL,
    tax_id TEXT,
    industry TEXT NOT NULL CHECK (industry IN (
        'technology', 'finance', 'healthcare', 'retail', 
        'manufacturing', 'consulting', 'media', 'real_estate', 'other'
    )),
    
    -- Contact Details
    contact_person TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    
    -- Circle Wallet Integration
    wallet_address TEXT UNIQUE,
    wallet_balance DECIMAL(20, 2) DEFAULT 1000.00 CHECK (wallet_balance >= 0),
    
    -- Status & Verification
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
    registration_status TEXT DEFAULT 'active' CHECK (registration_status IN ('active', 'suspended', 'pending')),
    
    -- Indexes
    CONSTRAINT unique_business_email UNIQUE(business_email)
);

-- Indexes for performance
CREATE INDEX idx_companies_registration_status ON companies(registration_status);
CREATE INDEX idx_companies_kyc_status ON companies(kyc_status);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_created_date ON companies(created_date DESC);
CREATE INDEX idx_companies_company_name ON companies(company_name);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_date
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date();

-- ============================================================================
-- TRANSACTION TABLE
-- Records all USDC payments between companies via Circle
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL,
    
    -- Transaction Parties
    from_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    to_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    from_company_name TEXT NOT NULL,
    to_company_name TEXT NOT NULL,
    
    -- Transaction Details
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(20, 2) DEFAULT 0.00 CHECK (fee >= 0),
    description TEXT,
    transaction_type TEXT DEFAULT 'payment' CHECK (transaction_type IN ('payment', 'refund', 'deposit')),
    
    -- Circle Integration
    transaction_hash TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Constraints
    CONSTRAINT different_companies CHECK (from_company_id != to_company_id)
);

-- Indexes for performance
CREATE INDEX idx_transactions_from_company ON transactions(from_company_id);
CREATE INDEX idx_transactions_to_company ON transactions(to_company_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_date ON transactions(created_date DESC);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_company_date ON transactions(from_company_id, created_date DESC);
CREATE INDEX idx_transactions_status_date ON transactions(status, created_date DESC);

CREATE TRIGGER transactions_updated_date
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date();

-- ============================================================================
-- USER TABLE
-- Manages team members with role-based access control
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Base fields
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    
    -- Company Association
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    
    -- Role & Permissions
    user_role TEXT NOT NULL CHECK (user_role IN ('back_office_admin', 'company_admin', 'company_user')),
    
    -- User Details
    phone_number TEXT,
    position TEXT,
    
    -- Status & Tracking
    is_active BOOLEAN DEFAULT true,
    invited_by TEXT,
    
    -- For back_office_admin, company_id can be NULL
    CONSTRAINT company_required_for_non_admin CHECK (
        (user_role = 'back_office_admin') OR (company_id IS NOT NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_user_role ON users(user_role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_date ON users(created_date DESC);

-- Composite indexes
CREATE INDEX idx_users_company_active ON users(company_id, is_active);
CREATE INDEX idx_users_role_company ON users(user_role, company_id);

CREATE TRIGGER users_updated_date
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Implements role-based access control at the database level
-- ============================================================================

-- Create a security definer function to check user roles without RLS
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT u.user_role INTO user_role
    FROM users u
    WHERE u.email = user_email
    AND u.is_active = true
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'none');
END;
$$;

-- Create a function to get user's company ID
CREATE OR REPLACE FUNCTION get_user_company_id(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    company_id UUID;
BEGIN
    SELECT u.company_id INTO company_id
    FROM users u
    WHERE u.email = user_email
    AND u.is_active = true
    LIMIT 1;
    
    RETURN company_id;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions for the security definer functions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON users TO authenticated;

-- Companies RLS Policies
CREATE POLICY "Back office admins can view all companies"
    ON companies FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt() ->> 'email') = 'back_office_admin');

CREATE POLICY "Company admins can view their own company"
    ON companies FOR SELECT
    TO authenticated
    USING (
        get_user_role(auth.jwt() ->> 'email') IN ('company_admin', 'company_user')
        AND id = get_user_company_id(auth.jwt() ->> 'email')
    );

CREATE POLICY "Back office admins can manage all companies"
    ON companies FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt() ->> 'email') = 'back_office_admin');

-- Transactions RLS Policies
CREATE POLICY "Back office admins can view all transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt() ->> 'email') = 'back_office_admin');

CREATE POLICY "Company admins can view their company transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (
        get_user_role(auth.jwt() ->> 'email') = 'company_admin'
        AND (
            from_company_id = get_user_company_id(auth.jwt() ->> 'email')
            OR to_company_id = get_user_company_id(auth.jwt() ->> 'email')
        )
    );

CREATE POLICY "Company users can view their own transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (
        get_user_role(auth.jwt() ->> 'email') = 'company_user'
        AND created_by = auth.jwt() ->> 'email'
    );

CREATE POLICY "Authorized users can create transactions"
    ON transactions FOR INSERT
    TO authenticated
    WITH CHECK (get_user_role(auth.jwt() ->> 'email') != 'none');

-- Users RLS Policies
CREATE POLICY "Back office admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt() ->> 'email') = 'back_office_admin');

CREATE POLICY "Company admins can manage their company users"
    ON users FOR ALL
    TO authenticated
    USING (
        get_user_role(auth.jwt() ->> 'email') = 'company_admin'
        AND company_id = get_user_company_id(auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can view themselves"
    ON users FOR SELECT
    TO authenticated
    USING (email = auth.jwt() ->> 'email');

-- Grant access to company_basic_info view for all authenticated users
GRANT SELECT ON company_basic_info TO authenticated;

-- ============================================================================
-- HELPFUL VIEWS
-- Pre-computed views for common queries
-- ============================================================================

-- Basic Company Info View - Available to all authenticated users
CREATE VIEW company_basic_info AS
SELECT 
    c.id,
    c.company_name,
    c.business_email,
    c.industry,
    c.contact_person,
    c.phone_number,
    c.business_address,
    c.registration_status,
    c.kyc_status
FROM companies c;

-- Company Dashboard View - Restricted to company members and admins
CREATE VIEW company_dashboard AS
SELECT 
    c.id,
    c.company_name,
    c.wallet_balance,
    c.kyc_status,
    c.registration_status,
    COUNT(DISTINCT u.id) as team_size,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(CASE WHEN t.from_company_id = c.id THEN t.amount ELSE 0 END), 0) as total_sent,
    COALESCE(SUM(CASE WHEN t.to_company_id = c.id THEN t.amount ELSE 0 END), 0) as total_received
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.is_active = true
LEFT JOIN transactions t ON (c.id = t.from_company_id OR c.id = t.to_company_id) AND t.status = 'completed'
GROUP BY c.id, c.company_name, c.wallet_balance, c.kyc_status, c.registration_status;

-- Transaction Summary View
CREATE VIEW transaction_summary AS
SELECT 
    DATE_TRUNC('day', created_date) as transaction_date,
    status,
    COUNT(*) as transaction_count,
    SUM(amount) as total_volume,
    AVG(amount) as avg_amount
FROM transactions
GROUP BY DATE_TRUNC('day', created_date), status
ORDER BY transaction_date DESC;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert a demo back office admin
INSERT INTO users (email, full_name, user_role, company_name, is_active, phone_number, position) 
VALUES 
    ('ayoube.eddakhly@gmail.com', 'System Administrator', 'back_office_admin', 'CirclePay HQ', true, '+1-555-0100', 'Platform Admin');

-- Insert sample companies
INSERT INTO companies (company_name, business_email, contact_person, phone_number, business_address, industry, wallet_address, wallet_balance, kyc_status, registration_status, created_by)
VALUES
    ('TechCorp Solutions', 'contact@techcorp.example', 'John Smith', '+1-555-0101', '123 Tech Street, San Francisco, CA 94105', 'technology', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', 5000.00, 'approved', 'active', 'admin@circlepay.demo'),
    ('HealthFirst Medical', 'info@healthfirst.example', 'Sarah Johnson', '+1-555-0102', '456 Medical Plaza, Boston, MA 02108', 'healthcare', '0x8ba1f109551bD432803012645Ac136ddd64DBA72', 3500.00, 'approved', 'active', 'admin@circlepay.demo'),
    ('RetailHub Inc', 'support@retailhub.example', 'Mike Chen', '+1-555-0103', '789 Commerce Ave, New York, NY 10001', 'retail', '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097', 2000.00, 'pending', 'active', 'admin@circlepay.demo');

-- Insert company admins for each company
INSERT INTO users (email, full_name, user_role, company_id, company_name, phone_number, position, is_active, invited_by)
SELECT 
    LOWER(REPLACE(contact_person, ' ', '.')) || '@' || SPLIT_PART(business_email, '@', 2),
    contact_person,
    'company_admin',
    id,
    company_name,
    phone_number,
    'CEO',
    true,
    'admin@circlepay.demo'
FROM companies;

-- Insert sample transactions
INSERT INTO transactions (from_company_id, to_company_id, from_company_name, to_company_name, amount, status, transaction_hash, description, created_by, fee)
SELECT 
    (SELECT id FROM companies WHERE company_name = 'TechCorp Solutions'),
    (SELECT id FROM companies WHERE company_name = 'HealthFirst Medical'),
    'TechCorp Solutions',
    'HealthFirst Medical',
    1250.00,
    'completed',
    md5(random()::text || clock_timestamp()::text),
    'Software license payment',
    'john.smith@techcorp.example',
    0.00;

-- ============================================================================
-- PAYMENT EXECUTION FUNCTION
-- Handles atomic payment processing with wallet balance updates
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_payment(
    from_company_id UUID,
    to_company_id UUID,
    amount DECIMAL(20, 2),
    description TEXT DEFAULT NULL,
    created_by TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    from_company RECORD;
    to_company RECORD;
    transaction_id UUID;
    transaction_hash TEXT;
    result JSON;
BEGIN
    -- Validate amount
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;
    
    -- Validate different companies
    IF from_company_id = to_company_id THEN
        RAISE EXCEPTION 'Cannot send payment to the same company';
    END IF;
    
    -- Get sender company with row-level security bypass
    SELECT * INTO from_company 
    FROM companies 
    WHERE id = from_company_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sender company not found';
    END IF;
    
    -- Check sufficient funds
    IF from_company.wallet_balance < amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;
    
    -- Get recipient company with row-level security bypass
    SELECT * INTO to_company 
    FROM companies 
    WHERE id = to_company_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recipient company not found';
    END IF;
    
    -- Generate transaction hash using random values
    transaction_hash := uuid_generate_v4()::text;
    
    -- Create transaction record
    INSERT INTO transactions (
        from_company_id,
        to_company_id,
        from_company_name,
        to_company_name,
        amount,
        description,
        status,
        transaction_hash,
        created_by,
        fee
    ) VALUES (
        from_company_id,
        to_company_id,
        from_company.company_name,
        to_company.company_name,
        amount,
        description,
        'completed',
        transaction_hash,
        COALESCE(created_by, 'system'),
        0.00
    ) RETURNING id INTO transaction_id;
    
    -- Update wallet balances atomically
    UPDATE companies 
    SET wallet_balance = wallet_balance - amount,
        updated_date = NOW()
    WHERE id = from_company_id;
    
    UPDATE companies 
    SET wallet_balance = wallet_balance + amount,
        updated_date = NOW()
    WHERE id = to_company_id;
    
    -- Return transaction details
    SELECT json_build_object(
        'id', transaction_id,
        'transaction_hash', transaction_hash,
        'amount', amount,
        'status', 'completed',
        'from_company_name', from_company.company_name,
        'to_company_name', to_company.company_name,
        'description', description
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_payment TO authenticated;
