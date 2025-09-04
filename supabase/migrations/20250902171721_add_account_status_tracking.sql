-- Add account status tracking for password reset workflows
-- This migration adds fields to track account status and password reset events

-- Add account status enum
DO $$ BEGIN
    CREATE TYPE account_status AS ENUM (
        'ACTIVE',           -- Account is active and can login
        'PENDING_SETUP',    -- Account created but not yet set up
        'PASSWORD_RESET_PENDING', -- Password reset email sent, waiting for user action
        'PASSWORD_RESET_COMPLETED', -- Password reset completed successfully
        'SUSPENDED',        -- Account suspended by admin
        'INACTIVE'          -- Account deactivated
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add password reset tracking fields to accounts table
ALTER TABLE accounts 
ADD COLUMN account_status account_status DEFAULT 'ACTIVE',
ADD COLUMN password_reset_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN password_reset_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN password_reset_token_hash TEXT,
ADD COLUMN last_password_change_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;

-- Add comments for new fields
COMMENT ON COLUMN accounts.account_status IS 'Current status of the account for workflow tracking';
COMMENT ON COLUMN accounts.password_reset_requested_at IS 'When password reset was last requested';
COMMENT ON COLUMN accounts.password_reset_completed_at IS 'When password reset was last completed';
COMMENT ON COLUMN accounts.password_reset_token_hash IS 'Hash of the current password reset token (for validation)';
COMMENT ON COLUMN accounts.last_password_change_at IS 'When password was last changed';
COMMENT ON COLUMN accounts.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN accounts.locked_until IS 'Account locked until this timestamp (for security)';

-- Create indexes for new fields
CREATE INDEX idx_accounts_account_status ON accounts(account_status);
CREATE INDEX idx_accounts_password_reset_requested_at ON accounts(password_reset_requested_at);
CREATE INDEX idx_accounts_locked_until ON accounts(locked_until);

-- Create account_events table for detailed tracking
CREATE TABLE IF NOT EXISTS account_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_status VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for account_events table
COMMENT ON TABLE account_events IS 'Detailed tracking of account-related events and status changes';
COMMENT ON COLUMN account_events.event_type IS 'Type of event: PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED, LOGIN_SUCCESS, LOGIN_FAILED, etc.';
COMMENT ON COLUMN account_events.event_status IS 'Status of the event: SUCCESS, FAILED, PENDING, EXPIRED';
COMMENT ON COLUMN account_events.metadata IS 'Additional event data (token info, error details, etc.)';

-- Create indexes for account_events
CREATE INDEX idx_account_events_account_id ON account_events(account_id);
CREATE INDEX idx_account_events_event_type ON account_events(event_type);
CREATE INDEX idx_account_events_event_status ON account_events(event_status);
CREATE INDEX idx_account_events_created_at ON account_events(created_at);

-- Enable RLS for account_events
ALTER TABLE account_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for account_events
CREATE POLICY "Allow all operations for testing" ON account_events
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.account_events TO authenticated;
GRANT ALL ON public.account_events TO anon;

-- Create function to log account events
CREATE OR REPLACE FUNCTION log_account_event(
    p_account_id UUID,
    p_event_type VARCHAR(50),
    p_event_status VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO account_events (
        account_id,
        event_type,
        event_status,
        description,
        metadata,
        ip_address,
        user_agent
    ) VALUES (
        p_account_id,
        p_event_type,
        p_event_status,
        p_description,
        p_metadata,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update account status
CREATE OR REPLACE FUNCTION update_account_status(
    p_account_id UUID,
    p_new_status account_status,
    p_event_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
    old_status account_status;
BEGIN
    -- Get current status
    SELECT account_status INTO old_status FROM accounts WHERE id = p_account_id;
    
    -- Update account status
    UPDATE accounts 
    SET 
        account_status = p_new_status,
        updated_at = NOW()
    WHERE id = p_account_id;
    
    -- Log the status change
    event_id := log_account_event(
        p_account_id,
        p_event_type,
        'SUCCESS',
        p_description,
        jsonb_build_object(
            'old_status', old_status,
            'new_status', p_new_status,
            'metadata', p_metadata
        )
    );
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_account_event TO authenticated;
GRANT EXECUTE ON FUNCTION update_account_status TO authenticated;
