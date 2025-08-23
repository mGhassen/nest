# HR Management System (PayfitLite)

## Overview

PayfitLite is a comprehensive HR management system built with modern web technologies. It provides a full-stack solution for managing employees, timesheets, leave requests, payroll, and documents. The application follows a monorepo architecture with a React frontend and Express backend, using PostgreSQL for data persistence and Replit's authentication system.

## User Preferences

Preferred communication style: Simple, everyday language.
Routing preference: Use existing menu structure, avoid creating separate admin routes (e.g., /admin/*).
Data integration: Show real database data instead of mock/placeholder content.
Design preference: Deel-inspired clean, professional interface with table layouts, minimal styling, and subtle gray tones.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Design System**: Custom component system with consistent spacing, colors, and typography

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with type-safe queries
- **Authentication**: Replit's OpenID Connect with session-based auth
- **API Pattern**: RESTful API design with Express routes
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Data Structure**: Multi-tenant design with companies, employees, and role-based access control
- **Key Entities**: Users, Companies, Memberships, Employees, Timesheets, Leave Requests, Payroll Cycles
- **Audit Trail**: Built-in audit logging for compliance and tracking

### Authentication & Authorization
- **Auth Provider**: Replit Auth using OpenID Connect standard
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Five-tier permission system (Owner, Admin, HR, Manager, Employee)
- **Security**: HTTP-only cookies, CSRF protection, and secure session handling

### Data Flow Architecture
- **Client-Server Communication**: JSON over HTTPS with credential-based requests
- **Error Handling**: Centralized error boundaries with user-friendly messaging
- **Loading States**: Optimistic updates and skeleton loading patterns
- **Caching Strategy**: React Query manages client-side cache with background refetching

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Platform**: Development environment and deployment platform
- **WebSocket Support**: Real-time capabilities through ws library

### UI & Design Libraries
- **Radix UI**: Accessible component primitives for complex interactions
- **Lucide Icons**: Consistent icon system throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Date Handling**: date-fns for date manipulation and formatting

### Development & Build Tools
- **Vite**: Fast development server and production bundler
- **ESBuild**: High-performance JavaScript bundler for server code
- **TypeScript**: Static type checking across frontend and backend
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Authentication & Security
- **OpenID Client**: Standards-based authentication with Replit
- **Passport.js**: Authentication middleware for Express
- **Memoizee**: Performance optimization for auth configuration caching