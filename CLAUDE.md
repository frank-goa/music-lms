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
├── app/                       # Next.js App Router pages
│   ├── (auth)/               # Auth routes (login, signup, invite)
│   ├── (dashboard)/          # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── assignments/  # Assignment management
│   │       ├── students/     # Student management (teachers)
│   │       ├── practice/     # Practice logging (students)
│   │       ├── submissions/  # Submission review
│   │       ├── feedback/     # Feedback review
│   │       ├── messages/     # Real-time messaging
│   │       ├── schedule/     # Lesson scheduling
│   │       ├── library/      # Resource library
│   │       └── settings/     # User settings
│   └── auth/callback/        # Supabase auth callback
├── components/               # React components
│   ├── layouts/             # Layout components
│   │   └── DashboardLayout.tsx
│   ├── gamification/        # Gamification components
│   │   ├── StreakCard.tsx
│   │   └── GoalProgress.tsx
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utilities and configurations
│   └── supabase/            # Supabase clients and middleware
│       ├── client.ts        # Browser client
│       ├── server.ts        # Server client
│       ├── actions.ts       # Server action client
│       └── middleware.ts    # Auth middleware
└── types/                   # TypeScript type definitions
    └── database.ts          # Generated DB types
```

### Authentication Flow

1. Users sign up with a role (teacher/student) via Supabase Auth
2. On signup, triggers create user profile in `public.users` table
3. Dashboard layout checks for user profile and creates it if missing
4. DashboardSetupLoader handles race conditions for new users
5. Teachers can invite students via email with unique tokens
6. Students accept invites to link with their teacher

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
- `assignment_files`: Attachments for assignments
- `submissions`: Student uploads (audio/video)
- `feedback`: Teacher ratings and comments
- `practice_logs`: Student practice sessions
- `lessons`: Scheduled lessons/appointments
- `resources`: Shared practice materials
- `assignment_resources`: Many-to-many assignment-resource links
- `messages`: Real-time messaging between users
- `notifications`: System notifications
- `badges`: Achievement badges
- `user_badges`: Earned badges per user
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
- Real-time features use Supabase Realtime subscriptions
- Optimistic UI updates improve perceived performance

### Key Features & Components

#### Dashboard Setup Flow
- **DashboardSetupLoader** (`src/app/(dashboard)/dashboard/DashboardSetupLoader.tsx`): Handles race conditions when new users first access the dashboard. Auto-refreshes after 500ms to allow user profile creation.

#### Real-time Notifications
- **NotificationBell** (`src/app/(dashboard)/dashboard/NotificationBell.tsx`): Real-time notification system with dropdown interface
  - Subscribes to new notifications via Supabase Realtime
  - Displays unread count badge
  - Mark individual or all notifications as read
  - Links to relevant content

#### Gamification System
- **StreakCard** (`src/components/gamification/StreakCard.tsx`): Displays practice streak counter to encourage daily practice
- **GoalProgress** (`src/components/gamification/GoalProgress.tsx`): Shows weekly practice goal progress with visual bar
- **Badges**: Achievement system for milestones (stored in database)

#### Messaging System
- **ChatLayout** (`src/app/(dashboard)/dashboard/messages/ChatLayout.tsx`): Contact list and chat container
- **ChatWindow** (`src/app/(dashboard)/dashboard/messages/ChatWindow.tsx`): Real-time message interface
  - Real-time message delivery via Supabase subscriptions
  - Optimistic UI updates for sent messages
  - Conversation clearing with confirmation dialog
  - Auto-scroll to latest messages

#### Dashboard Layout
- **DashboardLayout** (`src/components/layouts/DashboardLayout.tsx`): Main application shell
  - Navigation sidebar with role-based menu items
  - NotificationBell component integration
  - User profile dropdown
  - Responsive mobile menu
