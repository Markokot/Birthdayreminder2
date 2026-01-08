# Birthday Reminder Application

## Overview

A birthday reminder and gift tracking application with a Russian-language interface. Users can manage birthday entries with dates, descriptions, gift requirements, and reminder settings. The application features a clean, modern UI with smooth animations and is organized by calendar months.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth card transitions and interactions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints defined in shared/routes.ts with typed request/response schemas
- **Session Management**: express-session with MemoryStore for authentication state

### Data Storage
- **Primary Storage**: JSON file-based storage (data/birthdays.json) for birthday records
- **Schema Definition**: Drizzle ORM schema in shared/schema.ts for type inference and validation (PostgreSQL-ready but currently using JSON)
- **Validation**: Zod schemas derived from Drizzle table definitions using drizzle-zod

### Authentication
- **Method**: Session-based authentication with hardcoded credentials
- **Session Store**: In-memory store (MemoryStore) for development simplicity
- **Protected Routes**: Middleware-based route protection for API endpoints

### Build System
- **Development**: Vite dev server with HMR for frontend, tsx for backend
- **Production**: Vite builds frontend to dist/public, esbuild bundles server to dist/index.cjs
- **Path Aliases**: @/ for client/src, @shared/ for shared code

### Shared Code Structure
- **shared/schema.ts**: Database table definitions and Zod validation schemas
- **shared/routes.ts**: API route definitions with paths, methods, and response types
- Enables type safety between frontend and backend

## External Dependencies

### UI Component Libraries
- Radix UI primitives (dialog, dropdown, tooltip, etc.)
- Shadcn/ui component system (configured via components.json)
- Lucide React for icons

### Data & Validation
- Drizzle ORM for schema definition (PostgreSQL dialect configured)
- Zod for runtime validation
- drizzle-zod for schema-to-validation conversion

### Animation & Styling
- Framer Motion for animations
- Tailwind CSS with PostCSS/Autoprefixer
- Custom Google Fonts (Inter, Playfair Display)

### Server Dependencies
- Express.js web framework
- express-session for session management
- memorystore for session storage
- connect-pg-simple available for PostgreSQL session storage (unused currently)

### Database (Configured but Optional)
- PostgreSQL via pg driver
- Drizzle Kit for migrations (drizzle.config.ts)
- DATABASE_URL environment variable for connection
- Currently bypassed in favor of JSON file storage