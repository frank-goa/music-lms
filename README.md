# MusicLMS

A comprehensive Learning Management System designed specifically for music teachers and students. MusicLMS streamlines assignment management, practice tracking, student-teacher communication, and provides gamification features to keep students motivated.

## Overview

MusicLMS is a full-stack web application built with modern technologies that enables music teachers to manage their students, create assignments, track progress, and provide feedback. Students can submit practice recordings, log practice sessions, communicate with their teachers, and earn rewards for consistent practice.

## Key Features

### For Teachers
- **Student Management**: Invite and manage students with secure invite-based onboarding
- **Assignment Creation**: Create detailed practice assignments with attachments and resources
- **Submission Review**: Review student submissions with audio/video playback
- **Feedback System**: Provide ratings and detailed written feedback on submissions
- **Progress Tracking**: Monitor student practice logs and overall progress
- **Messaging**: Direct communication with students via real-time chat
- **Schedule Management**: Create and manage lesson schedules
- **Resource Library**: Organize and share practice materials with students

### For Students
- **Assignment Dashboard**: View pending and completed assignments
- **Practice Logging**: Track practice sessions with duration and notes
- **Submission System**: Submit practice recordings (audio/video) for review
- **Feedback Review**: Receive and review teacher feedback on submissions
- **Messaging**: Communicate directly with teacher
- **Gamification**:
  - Practice streaks to encourage consistency
  - Weekly practice goals with progress tracking
  - Achievement badges for milestones
- **Schedule View**: See upcoming lessons and appointments

### Shared Features
- **Real-time Notifications**: Bell icon with live updates for new messages, feedback, and assignments
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Secure Authentication**: Email-based authentication with role-based access control
- **Dark Mode Support**: Theme toggle for user preference

## Technology Stack

- **Framework**: Next.js 16.1.0 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Backend**: Supabase
  - PostgreSQL database
  - Authentication
  - Storage (file uploads)
  - Real-time subscriptions
- **State Management**:
  - React Hook Form (forms)
  - TanStack Query (server state)
- **Form Validation**: Zod
- **Date Utilities**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd music-lms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for the complete template.

4. Set up the database:

Run the SQL scripts in your Supabase project:
- `supabase/schema.sql` - Creates all tables and RLS policies
- `supabase/seed-data.sql` - (Optional) Adds sample data for testing

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Steps

1. **Sign up** as a teacher or student
2. **Teachers**: Invite students via the Students page
3. **Students**: Accept invite link from your teacher
4. **Teachers**: Create assignments and resources
5. **Students**: Submit practice recordings and log practice time

## Project Structure

```
music-lms/
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── (auth)/               # Public auth routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── invite/
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── assignments/  # Assignment management
│   │   │       ├── students/     # Student management (teachers)
│   │   │       ├── practice/     # Practice logging (students)
│   │   │       ├── submissions/  # Submission review
│   │   │       ├── feedback/     # Feedback review
│   │   │       ├── messages/     # Real-time messaging
│   │   │       ├── schedule/     # Lesson scheduling
│   │   │       ├── library/      # Resource library
│   │   │       └── settings/     # User settings
│   │   └── auth/callback/        # Supabase auth callback
│   ├── components/
│   │   ├── layouts/              # Layout components
│   │   │   └── DashboardLayout.tsx
│   │   ├── gamification/         # Gamification components
│   │   │   ├── StreakCard.tsx
│   │   │   └── GoalProgress.tsx
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/             # Supabase client configuration
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   ├── middleware.ts     # Auth middleware
│   │   │   └── actions.ts        # Server action client
│   │   └── utils.ts              # Utility functions
│   └── types/
│       └── database.ts           # TypeScript database types
├── supabase/                     # Database schemas and seeds
├── e2e-tests/                    # End-to-end test documentation
└── public/                       # Static assets
```

## Key Components

### DashboardSetupLoader
Handles the initial dashboard setup flow for new users. Automatically refreshes the page after user profile creation to ensure a smooth onboarding experience.

**Location**: `/src/app/(dashboard)/dashboard/DashboardSetupLoader.tsx`

**Purpose**: Resolves race conditions between authentication and user profile creation.

### NotificationBell
Real-time notification system with dropdown interface. Displays notifications for new assignments, feedback, messages, and achievements.

**Location**: `/src/app/(dashboard)/dashboard/NotificationBell.tsx`

**Features**:
- Real-time updates via Supabase subscriptions
- Unread count badge
- Mark individual notifications as read
- Mark all as read functionality
- Links to relevant content

### StreakCard
Displays the student's current practice streak to encourage daily practice habits.

**Location**: `/src/components/gamification/StreakCard.tsx`

**Features**:
- Visual flame icon that fills when streak is active
- Day counter
- Motivational messages

### GoalProgress
Shows weekly practice goal progress with a visual progress bar.

**Location**: `/src/components/gamification/GoalProgress.tsx`

**Features**:
- Current vs. target minutes
- Progress percentage bar
- Completion celebration message

### Messaging System
Real-time chat interface between teachers and students.

**Components**:
- `ChatLayout.tsx` - Contact list and chat window container
- `ChatWindow.tsx` - Message display and input interface

**Features**:
- Real-time message delivery
- Message history
- Online status indicators
- Conversation clearing
- Optimistic UI updates

## Database Schema

### Core Tables

- **users**: User accounts with role (teacher/student)
- **teacher_profiles**: Extended teacher information
- **student_profiles**: Extended student information with teacher relationship
- **invites**: Teacher-to-student invitation system
- **assignments**: Practice assignments created by teachers
- **assignment_students**: Many-to-many assignment-student relationships
- **assignment_files**: Attachments for assignments
- **submissions**: Student practice submissions
- **feedback**: Teacher feedback on submissions
- **practice_logs**: Student practice session tracking
- **lessons**: Scheduled lessons/appointments
- **resources**: Shared practice materials
- **messages**: Real-time messaging between users
- **notifications**: System notifications
- **badges**: Achievement badges
- **user_badges**: Earned badges per user

### Security

All tables implement Row Level Security (RLS) policies:
- Teachers can only access their students' data
- Students can only access their own data and assigned content
- Data isolation enforced at the database level

## Authentication Flow

1. User signs up with email and password, selecting a role (teacher/student)
2. Supabase Auth creates the auth user
3. Database trigger creates corresponding user profile
4. Teachers can generate invite links for students
5. Students use invite links to connect with their teacher
6. Dashboard layout ensures user profile exists before rendering

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Code Patterns

#### Supabase Clients

Always use the appropriate client for the context:

```typescript
// Server Components
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Server Actions
import { actionClient } from '@/lib/supabase/actions'
const supabase = await actionClient()

// Client Components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

#### Forms

Use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  // Define schema
})

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {}
})
```

#### File Uploads

Upload to Supabase Storage:

```typescript
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`path/file.ext`, file)
```

## Testing

End-to-end testing documentation is available in the `/e2e-tests/` directory:

- `AUTH_TESTING_GUIDE.md` - Comprehensive authentication testing guide
- `AUTH_QUICK_START.md` - Quick reference for common auth scenarios
- `AUTH_TEST_EXECUTION_SHEET.md` - Test execution tracking
- `TESTING_INDEX.md` - Testing documentation index

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]

## Support

For questions or issues, please [create an issue](https://github.com/your-repo/issues) on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Backend powered by [Supabase](https://supabase.com)
