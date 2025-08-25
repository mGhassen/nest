# 🏢 Nest HR System

A comprehensive Human Resources management system built with Next.js 15, Supabase, and modern web technologies.

## ✨ Features

- 👥 **Employee Management**: Complete employee lifecycle management
- 📊 **Timesheet Tracking**: Weekly timesheet management with approval workflows
- 🏖️ **Leave Management**: Leave request system with policies and approvals
- 💰 **Payroll Management**: Payroll cycle management and document handling
- 🏢 **Company Management**: Multi-company support with locations and cost centers
- 🔐 **Role-Based Access Control**: Granular permissions for different user roles
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui
- 🔒 **Secure Authentication**: Supabase Auth with email verification

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React, React Icons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nest
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   ```

4. **Set up Supabase database**
   ```bash
   # Start local Supabase (optional, for development)
   ./scripts/setup-supabase.sh start
   
   # Apply migrations and seed data
   ./scripts/setup-supabase.sh setup
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Using Supabase CLI

The project includes a comprehensive setup script:

```bash
# Interactive mode
./scripts/setup-supabase.sh

# Command line mode
./scripts/setup-supabase.sh setup    # Full setup
./scripts/setup-supabase.sh start    # Start local Supabase
./scripts/setup-supabase.sh migrate  # Apply migrations
./scripts/setup-supabase.sh seed     # Seed database
./scripts/setup-supabase.sh types    # Generate TypeScript types
```

### Manual Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Apply the initial migration**:
   ```bash
   supabase db push
   ```
3. **Seed the database**:
   ```bash
   supabase db reset
   ```

## 📁 Project Structure

```
nest/
├── app/                    # Next.js app directory
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard
│   ├── employee/         # Employee dashboard
│   └── auth/             # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   └── employees/        # Employee management components
├── lib/                   # Utility libraries
│   ├── db/               # Database configuration
│   ├── auth/             # Authentication utilities
│   └── rbac/             # Role-based access control
├── supabase/              # Supabase configuration
│   ├── migrations/       # Database migrations
│   ├── config.toml       # Supabase configuration
│   └── seed.sql          # Seed data
├── types/                 # TypeScript type definitions
└── scripts/               # Utility scripts
```

## 🔐 Authentication & Authorization

The system uses Supabase Auth with role-based access control:

- **OWNER**: Full system access
- **HR**: Employee and HR management
- **MANAGER**: Team management and approvals
- **EMPLOYEE**: Self-service features

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect Next.js

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🧪 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Development

```bash
# Start local Supabase
./scripts/setup-supabase.sh start

# View local database
supabase studio

# Reset database
./scripts/setup-supabase.sh reset
```

## 📚 API Documentation

### Core Endpoints

- `GET/POST /api/employees` - Employee management
- `GET/POST /api/timesheets` - Timesheet operations
- `GET/POST /api/leave` - Leave request management
- `GET/POST /api/payroll` - Payroll cycle management

### Authentication

All API endpoints require authentication via Supabase JWT tokens.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js documentation](https://nextjs.org/docs)