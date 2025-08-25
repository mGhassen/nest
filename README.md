# Nest HR System

A comprehensive HR management system built with Next.js, Supabase, and TypeScript.

## Features

- **Authentication**: Supabase Auth with role-based access control
- **Employee Management**: Create, update, and manage employee records
- **Leave Management**: Request and approve leave requests
- **Timesheet Tracking**: Weekly timesheet submission and approval
- **Payroll Management**: Payroll cycle management and calculations
- **Document Management**: Secure document storage and sharing
- **Admin Dashboard**: Comprehensive admin interface for HR operations

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
nest/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin-only routes
│   ├── auth/              # Authentication pages
│   ├── employee/          # Employee dashboard
│   ├── api/               # API routes
│   └── shared/            # Shared components and pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── employees/        # Employee-related components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Consolidated auth utilities
│   ├── auth-context.tsx # React auth context
│   └── supabase/        # Supabase client configuration
├── types/                # TypeScript type definitions
├── supabase/             # Database migrations and seed data
└── middleware.ts         # Next.js middleware for route protection
```

## Authentication & Authorization

The system uses a consolidated authentication structure:

- **`middleware.ts`**: Single middleware file handling route protection and role-based access
- **`lib/auth.ts`**: Consolidated auth utilities for both client and server-side use
- **`lib/auth-context.tsx`**: React context for client-side auth state management

### Route Protection

- **Public routes**: `/auth/*`, `/api/auth/*`, static files
- **Admin-only routes**: `/admin/*`, `/api/admin/*` (requires admin role)
- **Protected routes**: All other routes require authentication

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nest
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up Supabase**
   ```bash
   # Follow the setup instructions in SUPABASE_SETUP.md
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Setup

The project uses Supabase with:
- SQL migrations in `supabase/migrations/`
- Seed data in `supabase/seed.sql`
- TypeScript types generated from the database schema

## Development

- **Linting**: `pnpm lint`
- **Build**: `pnpm build`
- **Start**: `pnpm start`

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Implement proper error handling and validation
4. Add tests for new functionality
5. Update documentation as needed

## License

[Add your license here]