-- Drop potentially conflicting or old policies
DROP POLICY IF EXISTS "Company members can view their company insights" ON insights;
DROP POLICY IF EXISTS "Company admins can view their company insights" ON insights;

-- Create the updated policy allowing both company_admin and company_user
CREATE POLICY "Company admins can view their company insights"
    ON insights FOR SELECT
    TO authenticated
    USING (
        get_user_role(auth.jwt() ->> 'email') IN ('company_admin', 'company_user')
        AND company_id = get_user_company_id(auth.jwt() ->> 'email')
    );

-- Insert sample data for the specific company
INSERT INTO insights (company_id, title, description, type, metric_value, metric_label, logo_url, logo_color, is_new, status)
VALUES 
    ('e987e433-1b43-44b4-a20c-9c54ab7e341f', 'High cloud spending', 'Your cloud infrastructure costs have increased by 15% this month.', 'warning', '↑ 15%', 'Monthly Change', 'https://cdn.worldvectorlogo.com/logos/aws-2.svg', 'bg-orange-600', true, 'active'),
    ('e987e433-1b43-44b4-a20c-9c54ab7e341f', 'Optimized SaaS plan', 'Switch to an annual subscription for Slack to save 20%.', 'opportunity', '$1,200.00', 'Potential Savings', 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', 'bg-purple-600', true, 'active'),
    ('e987e433-1b43-44b4-a20c-9c54ab7e341f', 'New vendor detected', 'We noticed a new recurring payment to Adobe Creative Cloud.', 'info', '$54.99', 'Monthly Cost', 'https://cdn.worldvectorlogo.com/logos/adobe-creative-cloud-1.svg', 'bg-red-600', false, 'active');
