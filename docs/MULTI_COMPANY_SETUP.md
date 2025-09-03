# Multi-Company Management Setup

This document describes the multi-company management system implemented in the Nest HR application. Users can now have accounts in multiple companies with different roles per company.

## Overview

The multi-company system allows:
- Users to have accounts in multiple companies
- Different roles per company (ADMIN or EMPLOYEE)
- Company switching through the UI
- Company-scoped data and permissions
- Session management for current company context

## Database Schema

### New Tables

#### `user_company_roles`
Manages user roles across multiple companies.
```sql
CREATE TABLE user_company_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, company_id)
);
```

#### `user_sessions`
Tracks user session context including current company selection.
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    current_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, session_token)
);
```

### Database Functions

#### `get_user_companies(p_account_id UUID)`
Returns all companies a user has access to with their roles.

#### `switch_user_company(p_account_id UUID, p_company_id UUID, p_session_token TEXT)`
Switches the user's current company context.

#### `get_user_current_company(p_account_id UUID, p_session_token TEXT)`
Returns the user's current company and role.

## API Endpoints

### Company Management
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create a new company

### User Company Management
- `GET /api/user/companies` - Get user's companies
- `GET /api/user/current-company` - Get current company
- `POST /api/user/current-company` - Switch company

## Frontend Components

### Company Switcher
The `CompanySwitcher` component allows users to switch between companies they have access to. It's integrated into the sidebar and shows:
- Current company name
- Current role in that company
- Dropdown with all available companies
- Role indicator for each company

### Updated Authentication
The authentication system now includes:
- Multi-company user data in session
- Company context in API requests
- Session token management for company switching

## Setup Instructions

### 1. Run Database Migrations
```bash
# Apply the multi-company migration
supabase db reset
# or
supabase migration up
```

### 2. Seed Multi-Company Data
```bash
# The seed.sql file now includes multiple companies
supabase db seed
```

### 3. Create Multi-Company Users
```bash
# Run the multi-company user creation script
node scripts/create-multi-company-users.js
```

### 4. Test the Setup
```bash
# Run the test script to validate everything works
node scripts/test-multi-company.js
```

## Example Multi-Company Scenarios

### Scenario 1: Ahmed - CEO at Guepard, Consultant at TechCorp
- **Guepard**: ADMIN role (full access)
- **TechCorp**: EMPLOYEE role (limited access)
- Can switch between companies and see different data/permissions

### Scenario 2: Sarah - Developer at TechCorp, Technical Advisor at InnovateLab
- **TechCorp**: EMPLOYEE role (developer access)
- **InnovateLab**: EMPLOYEE role (advisor access)
- Different responsibilities in each company

### Scenario 3: Single Company Users
- Most users will have access to only one company
- System works seamlessly for both single and multi-company users

## Usage

### For Users
1. **Login**: Users login with their email/password as usual
2. **Company Selection**: The sidebar shows current company with a dropdown to switch
3. **Role-Based Access**: Permissions are based on role in the current company
4. **Data Scoping**: All data is automatically scoped to the current company

### For Administrators
1. **User Management**: Can invite users to specific companies with specific roles
2. **Company Management**: Can create new companies and manage company settings
3. **Cross-Company Users**: Can assign users to multiple companies with different roles

## Technical Details

### Session Management
- Each user session tracks the current company
- Session tokens are used to maintain company context
- Company switching updates the session and refreshes the UI

### Data Scoping
- All employee data is automatically scoped to the current company
- API endpoints respect company context
- Database queries include company filtering

### Security
- Users can only access companies they have roles in
- Role-based permissions are enforced per company
- Session tokens prevent unauthorized company access

## Troubleshooting

### Common Issues

1. **User can't see company switcher**
   - Check if user has multiple companies in `user_company_roles`
   - Verify user session is properly set

2. **Company switching fails**
   - Check if user has access to target company
   - Verify session token is valid
   - Check database functions are working

3. **Data not scoped to company**
   - Ensure API endpoints use current company context
   - Check database queries include company filtering

### Debug Commands
```bash
# Test database functions
node scripts/test-multi-company.js

# Check user companies
SELECT * FROM get_user_companies('account-id');

# Check current company
SELECT * FROM get_user_current_company('account-id', 'session-token');
```

## Future Enhancements

1. **Company Invitations**: Invite users to specific companies
2. **Company Settings**: Per-company configuration
3. **Audit Logging**: Track company switching and access
4. **Advanced Permissions**: More granular role-based permissions
5. **Company Hierarchies**: Parent-child company relationships

## Migration Notes

### From Single Company
The system is backward compatible. Existing single-company users will:
- Automatically get roles in their existing company
- Have default sessions created
- Continue working without changes

### Data Migration
- Existing employees are automatically linked to their companies
- User roles are migrated to the new `user_company_roles` table
- Default sessions are created for all existing users
