-- ============================================================================
-- INSIGHTS TABLE
-- Stores AI-generated or system-generated financial insights for companies
-- ============================================================================

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Association
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('opportunity', 'warning', 'info')),
    
    -- Metrics (Optional)
    metric_value TEXT, -- e.g. "$2,345.00" or "↑ 29%"
    metric_label TEXT, -- e.g. "Potential Savings" or "Monthly Change"
    
    -- Branding
    logo_url TEXT,
    logo_color TEXT, -- Tailwind class for fallback background
    
    -- Status
    is_new BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'accepted')),
    
    created_by TEXT -- System or User email
);

-- Indexes
CREATE INDEX idx_insights_company_id ON insights(company_id);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_created_date ON insights(created_date DESC);

-- Trigger for updated_date
CREATE TRIGGER insights_updated_date
    BEFORE UPDATE ON insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date();

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Insights

CREATE POLICY "Company admins can view their company insights"
    ON insights FOR SELECT
    TO authenticated
    USING (
        get_user_role(auth.jwt() ->> 'email') IN ('company_admin', 'company_user')
        AND company_id = get_user_company_id(auth.jwt() ->> 'email')
    );
    
CREATE POLICY "Back office admins can view all insights"
    ON insights FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt() ->> 'email') = 'back_office_admin');

-- Sample Data for Insights
INSERT INTO insights (company_id, title, description, type, metric_value, metric_label, logo_url, logo_color, is_new, status)
SELECT 
    id,
    'Better pricing available',
    'Lower your annual cost for Dropbox by switching to an annual plan.',
    'opportunity',
    '$2,345.00',
    'Potential Savings',
    'https://cdn.worldvectorlogo.com/logos/dropbox-1.svg',
    'bg-blue-600',
    true,
    'active'
FROM companies WHERE company_name = 'TechCorp Solutions';

INSERT INTO insights (company_id, title, description, type, metric_value, metric_label, logo_url, logo_color, is_new, status)
SELECT 
    id,
    'Monthly spend increase',
    'Your spending on Zendesk, Inc. has gone up significantly. Make sure you''re not overspending.',
    'warning',
    '↑ 29%',
    'Monthly Change',
    'https://cdn.worldvectorlogo.com/logos/zendesk-1.svg',
    'bg-green-900',
    true,
    'active'
FROM companies WHERE company_name = 'TechCorp Solutions';

INSERT INTO insights (company_id, title, description, type, metric_value, metric_label, logo_url, logo_color, is_new, status)
SELECT 
    id,
    'Duplicate subscription',
    'More than one user is paying for Microsoft Office. Save money by canceling duplicate subscriptions.',
    'opportunity',
    '$310.00',
    'Potential Savings',
    'https://cdn.worldvectorlogo.com/logos/microsoft-office-2013-1.svg',
    'bg-orange-500',
    false,
    'active'
FROM companies WHERE company_name = 'TechCorp Solutions';
