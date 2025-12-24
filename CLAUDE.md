# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MusicLMS is a Learning Management System designed for music teachers and students. It's a full-stack web application built with Next.js, TypeScript, and Supabase.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Environment Configuration

Create a `.env` file with required Supabase configuration:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for the complete template.

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 16.1.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Hook Form + React Query

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, signup, invite)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── auth/callback/     # Supabase auth callback
├── components/            # React components
│   ├── layouts/          # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
│   └── supabase/         # Supabase clients and middleware
└── types/                # TypeScript type definitions
```

### Authentication Flow

1. Users sign up with a role (teacher/student) via Supabase Auth
2. On signup, triggers create user profile in `public.users` table
3. Teachers can invite students via email with unique tokens
4. Students accept invites to link with their teacher

### Data Flow

- **Teacher Flow**: Creates assignments → Students submit → Teacher reviews → Teacher provides feedback
- **Student Flow**: Receives assignments → Submits practice recordings → Receives feedback/grades
- **Practice Tracking**: Students log practice sessions (time, notes)

### Database Schema

Core tables managed by Supabase:
- `users`: Extended auth users with roles
- `teacher_profiles` / `student_profiles`: Role-specific data
- `assignments`: Practice assignments with metadata
- `assignment_students`: Many-to-many relationship
- `submissions`: Student uploads (audio/video)
- `feedback`: Teacher ratings and comments
- `practice_logs`: Student practice sessions
- `invites`: Teacher-to-student invitations

Row Level Security (RLS) policies enforce data access:
- Teachers can only see their students' data
- Students can only see their own data and their assignments
- Data isolation at the database level

### Supabase Integration

Three Supabase client types:
- **Server Client**: For server components
- **Server Action Client**: For server actions
- **Browser Client**: For client components

All database operations go through Supabase with TypeScript types from `src/types/database.ts`.

### Important Patterns

- Always use the appropriate Supabase client for the context
- Forms use React Hook Form with Zod validation
- File uploads go to Supabase Storage 'uploads' bucket
- Server actions handle protected mutations
- Client components fetch data with React Query
