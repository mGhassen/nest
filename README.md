# Nest HR System

A modern HR management system built with Next.js 15, Supabase, and Better Auth.

## Features

- 🔐 **Authentication**: Secure authentication with Better Auth
- 🗄️ **Database**: PostgreSQL with Supabase and Drizzle ORM
- 🎨 **UI**: Modern UI with Radix UI and Tailwind CSS
- 📱 **Responsive**: Mobile-first responsive design
- 🌙 **Dark Mode**: Built-in dark mode support
- 🔄 **Real-time**: Real-time updates with Supabase
- 👥 **Role-Based Access**: Admin, Manager, and Employee portals
- 🔒 **RBAC**: Comprehensive role-based access control

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **UI**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure

```
app/
├── admin/                    # Admin Portal (OWNER, ADMIN, HR)
│   ├── dashboard/           # Admin dashboard
│   ├── employees/           # Employee management
│   ├── payroll/             # Payroll management
│   └── settings/            # System settings
├── employee/                # Employee Portal (EMPLOYEE + MANAGER)
│   ├── dashboard/           # Employee/Manager dashboard
│   ├── timesheets/          # Timesheet management
│   ├── leave/               # Leave management
│   └── documents/           # Document management
├── router/                  # Smart Routing
│   └── dashboard/           # Role-based redirects
├── api/                     # API Routes
│   ├── auth/                # Authentication
│   ├── employees/           # Employee CRUD
│   ├── timesheets/          # Timesheet operations
│   ├── leave/               # Leave operations
│   ├── payroll/             # Payroll operations
│   ├── dashboard/           # Dashboard stats
│   └── cron/                # Background jobs
└── auth/                    # Authentication pages
```

## Role-Based Access Control

### Admin Portal (`/admin/*`)
- **Access**: OWNER, ADMIN, HR
- **Features**:
  - Employee management (CRUD)
  - Payroll processing
  - System settings
  - Company-wide analytics

### Employee Portal (`/employee/*`)
- **Access**: EMPLOYEE + MANAGER
- **Features**:
  - **For Employees**: Personal timesheets, leave requests, documents
  - **For Managers**: Team management, approvals, team calendar + personal features
  - **Shared**: Timesheet management, leave management, document access

### Router (`/router/*`)
- **Purpose**: Smart routing and role-based redirects
- **Features**: Automatic redirection to appropriate portal based on user role

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone <repository-url>
cd nest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a new database and get the connection string

### 4. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Fill in the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=your_supabase_database_url_here

# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret_here

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Cron Jobs
CRON_SECRET=your_cron_secret_here
```

### 5. Set up the database

Run the database migrations:

```bash
npm run db:push
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:generate` - Generate database migrations

## Database Schema

The application includes the following main entities:

- **Users** - Authentication and user management
- **Companies** - Organization management
- **Employees** - Employee records and profiles
- **Timesheets** - Time tracking and reporting
- **Leave Requests** - Leave management
- **Payroll** - Payroll processing and management

## Authentication

The application uses Better Auth for authentication with support for:

- Email/password authentication
- Google OAuth (optional)
- Session management
- Role-based access control

## API Endpoints

### Employees
- `GET /api/employees` - List employees (filtered by role)
- `POST /api/employees` - Create employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Timesheets
- `GET /api/timesheets` - List timesheets (filtered by role)
- `POST /api/timesheets` - Create timesheet
- `POST /api/timesheets/[id]/approve` - Approve/reject timesheet

### Leave Management
- `GET /api/leave` - List leave requests (filtered by role)
- `POST /api/leave` - Create leave request
- `POST /api/leave/[id]/approve` - Approve/reject leave request

### Payroll
- `GET /api/payroll` - List payroll cycles
- `POST /api/payroll` - Create payroll cycle

### Dashboard
- `GET /api/dashboard/stats` - Get role-specific dashboard statistics

### Background Jobs
- `POST /api/cron/daily` - Daily automated tasks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.