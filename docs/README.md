# MusicLMS Documentation

**Version:** 0.1.0
**Last Updated:** December 24, 2025

A modern Learning Management System designed for music teachers and students, built with Next.js, TypeScript, and Supabase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [Features Documentation](#features-documentation)
7. [API Reference](#api-reference)
8. [Supabase Integration](#supabase-integration)
9. [Component Library](#component-library)
10. [Deployment Guide](#deployment-guide)

---

## Project Overview

### What is MusicLMS?

MusicLMS is a full-stack Learning Management System specifically designed for music education. It enables music teachers to manage their studio, track student progress, assign practice materials, review submissions, and provide feedback. Students can view assignments, submit practice recordings, log practice sessions, and receive personalized feedback from their teachers.

### Key Features

- **Role-Based Access Control**: Separate teacher and student user roles with tailored experiences
- **Student Management**: Teachers can invite students via email tokens and manage their roster
- **Assignment System**: Create and distribute assignments with file attachments to specific students
- **Submission & Feedback**: Students submit audio/video recordings; teachers provide ratings and written feedback
- **Practice Logging**: Students track daily practice sessions with duration and notes
- **Resource Library**: Teachers can upload and share reference materials (PDFs, audio, video)
- **Lesson Scheduling**: Manage lesson times and track completion status
- **Messaging**: Direct communication between teachers and students
- **Gamification**: Badge system and practice streaks to motivate students
- **Profile Management**: User avatars, password updates, and profile customization

### Technology Stack

- **Frontend Framework**: Next.js 16.1.0 with App Router (React 19.2.3)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password, OAuth)
- **File Storage**: Supabase Storage
- **State Management**: React Hook Form, TanStack React Query
- **Form Validation**: Zod v4.2.1
- **Date Handling**: date-fns v4.1.0
- **Notifications**: Sonner (toast notifications)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher (comes with Node.js)
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Git**: For version control

### Installation Steps

1. **Clone the repository** (if applicable):
   ```bash
   cd /Users/frank/claude-projects/LMS/music-lms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase project**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Navigate to Project Settings > API to get your credentials
   - Copy the SQL schema from `/supabase/schema.sql`
   - Run it in the Supabase SQL Editor to create all tables and policies

4. **Create Storage Bucket**:
   - Go to Storage in your Supabase dashboard
   - Create a bucket named `uploads` (set to private)
   - Configure appropriate policies for file access

5. **Configure environment variables**:
   Create a `.env.local` file in the project root:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Required for student invite flow (auto-confirms users)
   # WARNING: Keep this secret! Never expose in client-side code.
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   See `.env.example` for a complete template.

### Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically reload when you make changes to the code.

### Other Available Commands

- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run linter**: `npm run lint`

---

## Architecture

### Tech Stack Details

#### Frontend

- **Next.js 16.1.0**: React framework with App Router for file-based routing
- **React 19.2.3**: Latest React with Server Components support
- **TypeScript**: Full type safety across the application
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components based on Radix UI

#### Backend

- **Supabase**: Provides PostgreSQL database, authentication, and file storage
- **Row Level Security (RLS)**: Database-level access control
- **Server Actions**: Next.js server-side API functions

#### State Management

- **React Hook Form**: Form state and validation
- **Zod**: Schema validation
- **TanStack React Query**: Server state management and caching

### Project Structure

```
music-lms/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (auth)/                   # Auth routes (grouped)
│   │   │   ├── login/                # Login page
│   │   │   ├── signup/               # Teacher signup page
│   │   │   └── invite/[token]/       # Student invite acceptance
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── layout.tsx            # Dashboard wrapper
│   │   │   └── dashboard/            # Dashboard pages
│   │   │       ├── students/         # Teacher: student management
│   │   │       ├── assignments/      # Assignments (teacher & student)
│   │   │       ├── submissions/      # Teacher: review submissions
│   │   │       ├── practice/         # Student: practice logs
│   │   │       ├── feedback/         # Student: view feedback
│   │   │       ├── library/          # Teacher: resource library
│   │   │       ├── schedule/         # Lesson scheduling
│   │   │       ├── messages/         # Messaging system
│   │   │       └── settings/         # User settings & profile
│   │   ├── auth/callback/            # OAuth callback handler
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   ├── components/
│   │   ├── layouts/                  # Layout components
│   │   │   └── DashboardLayout.tsx   # Main dashboard layout with sidebar
│   │   ├── gamification/             # Gamification components
│   │   │   ├── GoalProgress.tsx      # Practice goal tracker
│   │   │   └── StreakCard.tsx        # Practice streak display
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx            # Button component
│   │       ├── input.tsx             # Input component
│   │       ├── form.tsx              # Form wrapper
│   │       ├── dialog.tsx            # Modal dialogs
│   │       ├── audio-recorder.tsx    # Custom audio recorder
│   │       └── ...                   # Other UI components
│   ├── lib/
│   │   ├── supabase/                 # Supabase client configuration
│   │   │   ├── server.ts             # Server component client
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── admin.ts              # Admin client (service role)
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── utils.ts                  # Utility functions (cn, etc.)
│   │   └── gamification.ts           # Gamification logic
│   ├── types/
│   │   └── database.ts               # TypeScript types for database
│   └── middleware.ts                 # Next.js middleware
├── supabase/
│   ├── schema.sql                    # Database schema
│   ├── seed-data.sql                 # Sample data for testing
│   └── updates.sql                   # Schema migrations
├── public/                           # Static assets
├── .env.example                      # Environment variable template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind configuration
└── next.config.ts                    # Next.js configuration
```

### Key Directories Explained

#### `/src/app/(auth)/`
Authentication-related pages using Next.js route groups. Includes login, signup, and student invite acceptance flows.

#### `/src/app/(dashboard)/dashboard/`
Protected routes accessible only to authenticated users. Contains all feature pages organized by functionality.

#### `/src/components/ui/`
Reusable UI components from shadcn/ui. These are copied into the project for customization.

#### `/src/lib/supabase/`
Supabase client configurations for different contexts:
- **server.ts**: For Server Components and Server Actions
- **client.ts**: For Client Components
- **admin.ts**: For privileged operations (student invite flow)
- **middleware.ts**: Session management and route protection

#### `/supabase/`
Database schema and migration files. Run `schema.sql` in Supabase SQL Editor to set up the database.

---

## Database Schema

### Overview

MusicLMS uses PostgreSQL via Supabase with comprehensive Row Level Security (RLS) policies. The schema supports multi-tenancy where each teacher manages their own students independently.

### Core Tables

#### `users`
Extends Supabase `auth.users` with application-specific fields.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references `auth.users(id)` |
| `email` | TEXT | User email (unique) |
| `role` | user_role | Either 'teacher' or 'student' |
| `full_name` | TEXT | User's display name |
| `avatar_url` | TEXT | URL to profile picture in Supabase Storage |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- One-to-one with `teacher_profiles` or `student_profiles` depending on role

#### `teacher_profiles`
Teacher-specific information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users(id)`, unique |
| `studio_name` | TEXT | Name of music studio (optional) |
| `bio` | TEXT | Teacher biography |
| `created_at` | TIMESTAMPTZ | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- One-to-many with `student_profiles` (a teacher has many students)
- One-to-many with `assignments`
- One-to-many with `resources`

#### `student_profiles`
Student-specific information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users(id)`, unique |
| `teacher_id` | UUID | References `users(id)` of teacher |
| `instrument` | TEXT | Primary instrument |
| `skill_level` | skill_level | 'beginner', 'intermediate', or 'advanced' |
| `notes` | TEXT | Teacher's private notes about student |
| `weekly_practice_goal_minutes` | INTEGER | Target practice minutes per week (default: 120) |
| `created_at` | TIMESTAMPTZ | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- Many-to-one with `teacher_profiles` (a student belongs to one teacher)
- One-to-many with `practice_logs`
- Many-to-many with `assignments` via `assignment_students`

#### `invites`
Student invitation tokens.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | References `users(id)` of teacher |
| `email` | TEXT | Student email (optional) |
| `token` | TEXT | Unique invite token (URL-safe) |
| `expires_at` | TIMESTAMPTZ | Expiration timestamp (7 days from creation) |
| `used_at` | TIMESTAMPTZ | When invite was accepted (null if unused) |
| `created_at` | TIMESTAMPTZ | Invite creation timestamp |

**Flow:**
1. Teacher creates invite with optional email
2. System generates unique token
3. Student visits `/invite/{token}` and creates account
4. Invite is marked as used

#### `assignments`
Practice assignments created by teachers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | References `users(id)` of teacher |
| `title` | TEXT | Assignment title |
| `description` | TEXT | Detailed instructions |
| `due_date` | TIMESTAMPTZ | Optional deadline |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- Many-to-many with `student_profiles` via `assignment_students`
- One-to-many with `submissions`
- Many-to-many with `resources` via `assignment_resources`

#### `assignment_students`
Junction table linking assignments to students.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `assignment_id` | UUID | References `assignments(id)` |
| `student_id` | UUID | References `users(id)` of student |
| `status` | assignment_status | 'pending', 'submitted', or 'reviewed' |
| `created_at` | TIMESTAMPTZ | Assignment timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Unique constraint:** `(assignment_id, student_id)`

**Status flow:**
- `pending`: Assignment created, not yet submitted
- `submitted`: Student has uploaded a submission
- `reviewed`: Teacher has provided feedback

#### `assignment_files`
Reference files attached to assignments by teachers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `assignment_id` | UUID | References `assignments(id)` |
| `file_url` | TEXT | URL in Supabase Storage |
| `file_type` | file_type | 'pdf', 'audio', or 'video' |
| `file_name` | TEXT | Original filename |
| `created_at` | TIMESTAMPTZ | Upload timestamp |

#### `submissions`
Student submissions for assignments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `assignment_id` | UUID | References `assignments(id)` |
| `student_id` | UUID | References `users(id)` of student |
| `file_url` | TEXT | URL to submission in Supabase Storage |
| `file_type` | file_type | 'pdf', 'audio', or 'video' |
| `notes` | TEXT | Student's notes about submission |
| `submitted_at` | TIMESTAMPTZ | Submission timestamp |

**Relationships:**
- Many-to-one with `assignments`
- One-to-many with `feedback` (typically one feedback per submission)

#### `feedback`
Teacher feedback on student submissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `submission_id` | UUID | References `submissions(id)` |
| `teacher_id` | UUID | References `users(id)` of teacher |
| `content` | TEXT | Written feedback |
| `rating` | INTEGER | 1-5 star rating (optional) |
| `created_at` | TIMESTAMPTZ | Feedback timestamp |

**Constraints:**
- `rating` must be between 1 and 5 if provided

#### `practice_logs`
Student practice session tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | UUID | References `users(id)` of student |
| `date` | DATE | Practice date |
| `duration_minutes` | INTEGER | Practice duration (must be > 0) |
| `notes` | TEXT | Practice notes or reflections |
| `created_at` | TIMESTAMPTZ | Log entry timestamp |

**Constraints:**
- `duration_minutes` must be greater than 0

#### `lessons`
Scheduled lesson sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | References `users(id)` of teacher |
| `student_id` | UUID | References `users(id)` of student |
| `start_time` | TIMESTAMPTZ | Lesson start time |
| `end_time` | TIMESTAMPTZ | Lesson end time |
| `status` | TEXT | 'scheduled', 'completed', or 'cancelled' |
| `notes` | TEXT | Lesson notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### `resources`
Teacher resource library.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | References `users(id)` of teacher |
| `title` | TEXT | Resource title |
| `file_url` | TEXT | URL in Supabase Storage |
| `file_type` | TEXT | File MIME type or extension |
| `created_at` | TIMESTAMPTZ | Upload timestamp |

**Relationships:**
- Many-to-many with `assignments` via `assignment_resources`

#### `assignment_resources`
Junction table linking assignments to resources.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `assignment_id` | UUID | References `assignments(id)` |
| `resource_id` | UUID | References `resources(id)` |
| `created_at` | TIMESTAMPTZ | Link timestamp |

**Unique constraint:** `(assignment_id, resource_id)`

#### `messages`
Direct messaging between teachers and students.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `sender_id` | UUID | References `users(id)` of sender |
| `receiver_id` | UUID | References `users(id)` of receiver |
| `content` | TEXT | Message content |
| `read_at` | TIMESTAMPTZ | When message was read (null if unread) |
| `created_at` | TIMESTAMPTZ | Message timestamp |

#### Gamification Tables

**`badges`**: Predefined achievement badges
- `title`, `description`, `icon_key`
- `criteria_type`: e.g., 'streak_days', 'total_practice_hours'
- `threshold`: Numeric value to unlock badge

**`user_badges`**: User-earned badges
- Links users to badges they've earned
- `earned_at` timestamp

### Custom Types (Enums)

```sql
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'reviewed');
CREATE TYPE file_type AS ENUM ('pdf', 'audio', 'video');
```

### Indexes

Performance indexes are created on frequently queried columns:

- `idx_student_profiles_teacher` on `student_profiles(teacher_id)`
- `idx_assignments_teacher` on `assignments(teacher_id)`
- `idx_assignment_students_assignment` on `assignment_students(assignment_id)`
- `idx_assignment_students_student` on `assignment_students(student_id)`
- `idx_submissions_assignment` on `submissions(assignment_id)`
- `idx_submissions_student` on `submissions(student_id)`
- `idx_practice_logs_student` on `practice_logs(student_id)`
- `idx_practice_logs_date` on `practice_logs(date)`
- And more (see `schema.sql` for complete list)

### Row Level Security (RLS) Policies

RLS is enabled on all tables to ensure data isolation between teachers and students.

#### Key Policy Patterns

**Users Table:**
- Users can read their own data
- Teachers can read their students' data
- Users can update their own data

**Student Profiles:**
- Students can read/update their own profile
- Teachers can read/update their students' profiles

**Assignments:**
- Teachers can manage (CRUD) their own assignments
- Students can read assignments assigned to them

**Submissions:**
- Students can manage their own submissions
- Teachers can read submissions for their assignments

**Feedback:**
- Teachers can manage feedback they create
- Students can read feedback on their submissions

**Practice Logs:**
- Students can manage their own practice logs
- Teachers can read their students' practice logs

**Resources:**
- Teachers can manage their own resources
- Students can read resources linked to their assignments

See `/supabase/schema.sql` for complete RLS policy definitions.

### Data Flow Example: Assignment Lifecycle

1. **Teacher creates assignment**:
   - Insert into `assignments` table
   - Insert into `assignment_students` for selected students (status: 'pending')
   - Optionally link resources via `assignment_resources`

2. **Student views assignment**:
   - RLS allows student to read assignment via `assignment_students` link
   - Can view linked resources

3. **Student submits work**:
   - Insert into `submissions` with file URL
   - Update `assignment_students.status` to 'submitted'

4. **Teacher reviews submission**:
   - Read submission via assignment ownership
   - Insert into `feedback` with rating and comments
   - Update `assignment_students.status` to 'reviewed'

5. **Student views feedback**:
   - RLS allows student to read feedback on their submission

---

## Authentication Flow

### Overview

MusicLMS uses Supabase Auth for authentication with custom role-based signup flows for teachers and students.

### User Roles

- **Teacher**: Creates account via public signup page (`/signup`)
- **Student**: Creates account via teacher invite link (`/invite/{token}`)

### Teacher Signup Flow

1. **User visits `/signup`**:
   - Email/password form or Google OAuth
   - Provides full name
   - Role automatically set to 'teacher'

2. **Account creation**:
   - Supabase Auth creates user in `auth.users`
   - Trigger `handle_new_user()` automatically:
     - Inserts into `public.users` with role='teacher'
     - Creates `teacher_profiles` record
   - Email confirmation sent (if email provider configured)

3. **Redirect to dashboard**:
   - User can log in and access teacher features

**Code Reference:** `/src/app/(auth)/signup/page.tsx`

### Student Invite Flow

Students cannot sign up directly. They must be invited by a teacher.

#### Step 1: Teacher Creates Invite

1. **Teacher navigates to `/dashboard/students`**
2. **Clicks "Invite Student" button**
3. **Enters student email** (optional)
4. **System generates invite**:
   - Creates record in `invites` table
   - Generates unique token (64-char hex)
   - Sets expiration to 7 days
   - Returns invite URL: `{APP_URL}/invite/{token}`

**Code Reference:**
- UI: `/src/app/(dashboard)/dashboard/students/InviteStudentDialog.tsx`
- Action: `/src/app/(dashboard)/dashboard/students/actions.ts` → `createInvite()`

#### Step 2: Student Accepts Invite

1. **Student visits invite URL** (`/invite/{token}`)
2. **System validates token**:
   - Checks if token exists
   - Verifies not expired
   - Verifies not already used

3. **Student fills out form**:
   - Full name
   - Email (pre-filled if teacher specified)
   - Password
   - Instrument
   - Skill level

4. **Account creation** (via Admin API):
   - Uses `SUPABASE_SERVICE_ROLE_KEY` for privileged operation
   - Creates user with `email_confirm: true` (no email verification needed)
   - Sets role to 'student' in user metadata
   - Trigger creates `public.users` record
   - Creates `student_profiles` record with `teacher_id`
   - Marks invite as used (`used_at` timestamp)

5. **Redirect to login**:
   - Student can now log in with credentials

**Code Reference:**
- UI: `/src/app/(auth)/invite/[token]/page.tsx`
- Action: `/src/app/(auth)/invite/[token]/actions.ts` → `acceptInvite()`

**Note:** The admin client is required to bypass email verification and auto-confirm the student account. This provides a streamlined onboarding experience.

### Login Flow

1. **User visits `/login`**
2. **Enters email and password** (or uses OAuth)
3. **Supabase Auth validates credentials**
4. **Session created** (cookie-based)
5. **Middleware checks session**:
   - Validates user is authenticated
   - Redirects to `/dashboard`

**Code Reference:** `/src/app/(auth)/login/page.tsx`

### Session Management

**Middleware** (`/src/middleware.ts`):
- Runs on every request
- Refreshes session if expired
- Protects routes:
  - Public routes: `/`, `/login`, `/signup`, `/invite/*`
  - Protected routes: `/dashboard/*` (requires authentication)
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages

**Supabase Middleware** (`/src/lib/supabase/middleware.ts`):
- Updates session cookies
- Calls `supabase.auth.getUser()` to verify session

### OAuth (Google)

Teachers can sign up with Google OAuth:

1. **Click "Continue with Google"**
2. **Redirects to Google consent screen**
3. **Google redirects to `/auth/callback`**
4. **Callback handler exchanges code for session**
5. **Trigger creates user profile**
6. **Redirect to dashboard**

**Code Reference:** `/src/app/auth/callback/route.ts`

### Logout

1. **User clicks "Log out" in dropdown**
2. **Calls `supabase.auth.signOut()`**
3. **Clears session cookies**
4. **Redirects to homepage**

**Code Reference:** `/src/components/layouts/DashboardLayout.tsx`

---

## Features Documentation

### Teacher Features

#### Student Management

**Location:** `/dashboard/students`

**Capabilities:**
- View all students in roster
- Invite new students via email
- View student profiles with instrument and skill level
- Add private notes about students
- Remove students from roster
- View student assignment history
- View student practice logs

**Components:**
- `StudentList.tsx`: Table of all students
- `InviteStudentDialog.tsx`: Modal to create invite links
- `StudentProfileCard.tsx`: Individual student details
- `AssignmentHistory.tsx`: Student's assignment completion
- `PracticeHistory.tsx`: Student's practice logs

**Server Actions:**
- `createInvite(email)`: Generate invite token
- `cancelInvite(inviteId)`: Delete unused invite
- `updateStudentNotes(studentId, notes)`: Update teacher notes
- `removeStudent(studentId)`: Remove student from roster

#### Assignment Creation

**Location:** `/dashboard/assignments`

**Capabilities:**
- Create assignments with title, description, and due date
- Assign to one or multiple students
- Attach resources from library
- View all assignments with student count
- Track assignment status (pending/submitted/reviewed)

**Components:**
- `AssignmentList.tsx`: Teacher's assignment list
- `CreateAssignmentDialog.tsx`: Modal to create new assignment

**Server Actions:**
- `createAssignment(data)`: Create assignment and link to students

**Data Flow:**
```
1. Teacher fills form
2. createAssignment() inserts into assignments table
3. Links students via assignment_students table
4. Links resources via assignment_resources table
5. Students see new assignment in their dashboard
```

#### Submission Review

**Location:** `/dashboard/submissions`

**Capabilities:**
- View all pending submissions across all students
- Play audio/video submissions inline
- Read student notes
- Provide written feedback
- Give 1-5 star rating
- Mark submission as reviewed

**Components:**
- `SubmissionsList.tsx`: List of all submissions
- `MediaPlayer.tsx`: Audio/video player
- `FeedbackForm.tsx`: Form to submit feedback

**Server Actions:**
- `submitFeedback(data)`: Create feedback and update status

**Data Flow:**
```
1. Teacher navigates to submission detail page
2. Plays submission media
3. Fills feedback form
4. submitFeedback() creates feedback record
5. Updates assignment_students.status to 'reviewed'
6. Student can now view feedback
```

#### Resource Library

**Location:** `/dashboard/library`

**Capabilities:**
- Upload PDF, audio, and video files
- Organize resources by type
- Link resources to assignments
- Delete resources

**Components:**
- `ResourceList.tsx`: Grid of uploaded resources
- `UploadResourceDialog.tsx`: Upload form

**Server Actions:**
- `uploadResource(file, title)`: Upload to Supabase Storage and create record
- `deleteResource(resourceId)`: Remove resource

#### Lesson Scheduling

**Location:** `/dashboard/schedule`

**Capabilities:**
- Create lesson appointments with students
- View weekly calendar
- Mark lessons as completed or cancelled
- Add lesson notes

**Components:**
- `WeeklyCalendar.tsx`: Calendar view of lessons
- `CreateLessonDialog.tsx`: Form to schedule lesson

**Server Actions:**
- `createLesson(data)`: Create lesson appointment
- `updateLessonStatus(lessonId, status)`: Update lesson status

### Student Features

#### View Assignments

**Location:** `/dashboard/assignments`

**Capabilities:**
- View all assigned assignments
- See assignment status (pending/submitted/reviewed)
- View assignment details and attached resources
- Submit work for assignments

**Components:**
- `StudentAssignmentList.tsx`: List of assigned assignments
- `SubmitAssignmentDialog.tsx`: Submission form

**Server Actions:**
- `getStudentAssignments()`: Fetch assignments for current student
- `submitAssignment(data)`: Upload submission file

**Data Flow:**
```
1. Student views assignment list
2. Clicks on assignment
3. Views details and resources
4. Uploads audio/video submission
5. submitAssignment() creates submission record
6. Updates assignment_students.status to 'submitted'
```

#### Practice Logging

**Location:** `/dashboard/practice`

**Capabilities:**
- Log daily practice sessions
- Record duration in minutes
- Add practice notes
- View practice history
- See weekly practice goal progress
- Track practice streaks

**Components:**
- `PracticeLogList.tsx`: Table of practice logs
- `LogPracticeDialog.tsx`: Form to log practice
- `StreakCard.tsx`: Practice streak display
- `GoalProgress.tsx`: Weekly goal tracker

**Server Actions:**
- `logPracticeSession(data)`: Create practice log
- `getStudentPracticeLogs()`: Fetch all logs for student

#### View Feedback

**Location:** `/dashboard/feedback`

**Capabilities:**
- View all feedback received from teacher
- See ratings and written comments
- Link back to original assignment and submission

**Components:**
- `FeedbackList.tsx`: List of feedback with ratings

**Server Actions:**
- `getStudentFeedback()`: Fetch all feedback for student

### Shared Features

#### Profile Settings

**Location:** `/dashboard/settings`

**Capabilities:**
- Update full name
- Change password
- Upload profile avatar
- View account information

**Components:**
- `ProfileForm.tsx`: Name update form
- `PasswordForm.tsx`: Password change form
- `AvatarUpload.tsx`: Avatar upload with preview

**Server Actions:**
- `updateProfile(data)`: Update user full name
- `updatePassword(data)`: Change password
- `updateAvatar(url)`: Update avatar URL

**Avatar Upload Flow:**
```
1. User selects image file
2. File uploaded to Supabase Storage (uploads/avatars/)
3. Returns public URL
4. updateAvatar() saves URL to users table
5. Avatar displays in navbar and profile
```

#### Messaging

**Location:** `/dashboard/messages`

**Capabilities:**
- Direct messaging between teacher and students
- Real-time message delivery
- Mark messages as read
- Conversation threads

**Components:**
- `ChatLayout.tsx`: Message list and conversation view
- `ChatWindow.tsx`: Message thread display

**Server Actions:**
- `sendMessage(receiverId, content)`: Send message
- `markAsRead(messageId)`: Mark message as read
- `getConversations()`: Fetch all conversations

---

## API Reference

All data mutations are handled via Next.js Server Actions. These are server-side functions that can be called from Client Components.

### Authentication Actions

No explicit auth actions (uses Supabase client methods directly).

**Example:**
```typescript
// In client component
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Student Management Actions

**File:** `/src/app/(dashboard)/dashboard/students/actions.ts`

#### `createInvite(email: string)`

Generate a student invite link.

**Parameters:**
- `email` (string): Student's email address (optional)

**Returns:**
```typescript
{ inviteUrl: string } | { error: string }
```

**Example:**
```typescript
const result = await createInvite('student@example.com');
if (result.inviteUrl) {
  // Copy link: result.inviteUrl
}
```

#### `cancelInvite(inviteId: string)`

Delete an unused invite.

**Parameters:**
- `inviteId` (string): UUID of invite to cancel

**Returns:**
```typescript
{ success: true } | { error: string }
```

#### `updateStudentNotes(studentUserId: string, notes: string)`

Update teacher's private notes about a student.

**Parameters:**
- `studentUserId` (string): Student's user ID
- `notes` (string): Updated notes

**Returns:**
```typescript
{ success: true } | { error: string }
```

#### `removeStudent(studentUserId: string)`

Remove a student from teacher's roster.

**Parameters:**
- `studentUserId` (string): Student's user ID

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Note:** This deletes the `student_profiles` record but does not delete the user account.

### Assignment Actions

**File:** `/src/app/(dashboard)/dashboard/assignments/actions.ts`

#### `createAssignment(data: CreateAssignmentInput)`

Create a new assignment and assign to students.

**Input Schema:**
```typescript
{
  title: string;              // Required
  description?: string;       // Optional
  dueDate?: string;           // ISO date string
  studentIds: string[];       // Array of student user IDs (min 1)
  resourceIds?: string[];     // Array of resource IDs to link
}
```

**Returns:**
```typescript
{ success: true, assignmentId: string } | { error: string }
```

**Example:**
```typescript
const result = await createAssignment({
  title: 'Practice C Major Scale',
  description: 'Two octaves, hands together',
  dueDate: '2025-12-31T23:59:59Z',
  studentIds: ['uuid1', 'uuid2'],
  resourceIds: ['resource-uuid'],
});
```

#### `getTeacherAssignments()`

Fetch all assignments created by the current teacher.

**Returns:**
```typescript
Array<Assignment & { studentCount: number }>
```

#### `getStudentAssignments()`

Fetch all assignments assigned to the current student.

**Returns:**
```typescript
Array<{
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'submitted' | 'reviewed';
  teacher_name: string;
}>
```

### Submission & Feedback Actions

**File:** `/src/app/(dashboard)/dashboard/submissions/[id]/actions.ts`

#### `submitFeedback(data: FeedbackInput)`

Provide feedback on a student submission.

**Input Schema:**
```typescript
{
  submissionId: string;       // UUID
  content: string;            // Feedback text (min 1 char)
  rating?: number;            // 1-5 stars
}
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Example:**
```typescript
const result = await submitFeedback({
  submissionId: 'uuid',
  content: 'Great rhythm! Work on dynamics.',
  rating: 4,
});
```

**Side Effects:**
- Creates `feedback` record
- Updates `assignment_students.status` to 'reviewed'

### Practice Log Actions

**File:** `/src/app/(dashboard)/dashboard/practice/actions.ts`

#### `logPracticeSession(data: LogPracticeInput)`

Log a practice session.

**Input Schema:**
```typescript
{
  date: string;               // ISO date string
  durationMinutes: number;    // Must be positive integer
  notes?: string;             // Optional practice notes
}
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Example:**
```typescript
const result = await logPracticeSession({
  date: '2025-12-24',
  durationMinutes: 45,
  notes: 'Focused on scales and arpeggios',
});
```

#### `getStudentPracticeLogs()`

Fetch all practice logs for the current student.

**Returns:**
```typescript
Array<PracticeLog>
```

### Settings Actions

**File:** `/src/app/(dashboard)/dashboard/settings/actions.ts`

#### `updateProfile(data: UpdateProfileInput)`

Update user's full name.

**Input Schema:**
```typescript
{
  fullName: string;  // Min 1 character
}
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

#### `updatePassword(data: UpdatePasswordInput)`

Change user's password.

**Input Schema:**
```typescript
{
  currentPassword: string;    // Min 6 chars
  newPassword: string;        // Min 6 chars
  confirmPassword: string;    // Must match newPassword
}
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

#### `updateAvatar(avatarUrl: string)`

Update user's profile picture URL.

**Parameters:**
- `avatarUrl` (string): URL to image in Supabase Storage

**Returns:**
```typescript
{ success: true } | { error: string }
```

#### `getUserProfile()`

Fetch current user's profile including role-specific data.

**Returns:**
```typescript
{
  id: string;
  email: string;
  fullName: string | null;
  role: 'teacher' | 'student';
  avatarUrl: string | null;
  createdAt: string;
  profile: TeacherProfile | StudentProfile | null;
} | null
```

### Invite Acceptance Actions

**File:** `/src/app/(auth)/invite/[token]/actions.ts`

#### `acceptInvite(data: AcceptInviteInput)`

Create student account from invite link.

**Input Schema:**
```typescript
{
  token: string;
  email: string;
  password: string;           // Min 6 chars
  fullName: string;
  instrument: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}
```

**Returns:**
```typescript
{ success: true, message: string } | { error: string }
```

**Important:** This action uses the admin client (`SUPABASE_SERVICE_ROLE_KEY`) to auto-confirm the student account without email verification.

---

## Supabase Integration

### Client Types

MusicLMS uses three different Supabase clients depending on the execution context.

#### Server Client

**File:** `/src/lib/supabase/server.ts`

**Used in:**
- Server Components
- Server Actions
- API Route Handlers

**Features:**
- Cookie-based session management
- Automatic session refresh
- SSR-compatible

**Usage:**
```typescript
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('assignments')
    .select('*')
    .eq('teacher_id', user.id);

  return <div>{/* ... */}</div>;
}
```

#### Browser Client

**File:** `/src/lib/supabase/client.ts`

**Used in:**
- Client Components
- Browser-side interactions

**Features:**
- LocalStorage session persistence
- Real-time subscriptions
- Client-side queries

**Usage:**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export function ClientComponent() {
  const supabase = createClient();

  async function handleLogin(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  return <form onSubmit={/* ... */} />;
}
```

#### Admin Client

**File:** `/src/lib/supabase/admin.ts`

**Used in:**
- Student invite acceptance (auto-confirm users)
- Administrative operations that bypass RLS

**Features:**
- Uses `SUPABASE_SERVICE_ROLE_KEY`
- Bypasses Row Level Security
- Full database access

**Warning:** NEVER use in client-side code. Only in Server Actions.

**Usage:**
```typescript
import { createAdminClient } from '@/lib/supabase/admin';

export async function acceptInvite(data: AcceptInviteInput) {
  const adminClient = createAdminClient();

  // Create user without email verification
  const { data: authData } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'student' },
  });
}
```

### Storage Bucket Configuration

**Bucket Name:** `uploads`

**Access:** Private (not public)

**Structure:**
```
uploads/
├── avatars/              # User profile pictures
│   └── {userId}/
│       └── avatar.jpg
├── submissions/          # Student submission files
│   └── {submissionId}/
│       └── file.mp3
├── resources/            # Teacher resource library
│   └── {resourceId}/
│       └── document.pdf
└── assignments/          # Assignment reference files
    └── {assignmentId}/
        └── reference.pdf
```

**RLS Policies** (set in Supabase Storage):
- Authenticated users can upload to their own folders
- Students can read resources linked to their assignments
- Teachers can read all files for their students

**Upload Example:**
```typescript
const supabase = createClient();

// Upload file
const filePath = `submissions/${submissionId}/${file.name}`;
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(filePath, file);

if (!error) {
  // Get public URL (even though bucket is private, user has access via RLS)
  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  const fileUrl = urlData.publicUrl;
}
```

### Row Level Security Patterns

#### Pattern 1: Own Data Access

Users can only access their own data.

```sql
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

**Used in:** `users`, `practice_logs`, `submissions`

#### Pattern 2: Teacher-Student Relationship

Teachers can access data for their students.

```sql
CREATE POLICY "Teachers can read their students profiles" ON public.student_profiles
  FOR SELECT USING (teacher_id = auth.uid());
```

**Used in:** `student_profiles`, `practice_logs`

#### Pattern 3: Assignment-Based Access

Students can access data linked via assignments.

```sql
CREATE POLICY "Students can read assigned assignments" ON public.assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_students ast
      WHERE ast.assignment_id = assignments.id
        AND ast.student_id = auth.uid()
    )
  );
```

**Used in:** `assignments`, `assignment_files`, `resources`

#### Pattern 4: Transitive Access

Teachers can access student submissions for their assignments.

```sql
CREATE POLICY "Teachers can read submissions for their assignments" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );
```

**Used in:** `submissions`, `feedback`

### Database Triggers

#### `handle_new_user()`

Automatically creates user profile when account is created.

**Trigger:** `on_auth_user_created` on `auth.users` (AFTER INSERT)

**Logic:**
1. Inserts into `public.users` with role from metadata
2. If role is 'teacher', creates `teacher_profiles` record
3. Student profiles are created manually during invite acceptance

**Code:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    NEW.raw_user_meta_data->>'full_name'
  );

  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `update_updated_at_column()`

Automatically updates `updated_at` timestamp on row updates.

**Triggers:** Applied to `users`, `teacher_profiles`, `student_profiles`, `assignments`, `assignment_students`

**Logic:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### Realtime Subscriptions

Supabase supports real-time subscriptions for live updates (not heavily used in current implementation but available).

**Example:**
```typescript
const supabase = createClient();

// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Update UI
    }
  )
  .subscribe();

// Cleanup
return () => {
  channel.unsubscribe();
};
```

---

## Component Library

### UI Components

MusicLMS uses shadcn/ui components, which are based on Radix UI primitives and styled with Tailwind CSS.

**Location:** `/src/components/ui/`

#### Core Components

**Button** (`button.tsx`)
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Menu item</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Input** (`input.tsx`)
```typescript
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Enter name" />
<Input type="email" />
<Input type="password" />
```

**Label** (`label.tsx`)
```typescript
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email address</Label>
```

**Card** (`card.tsx`)
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

**Dialog** (`dialog.tsx`)
```typescript
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <div>Modal content</div>
  </DialogContent>
</Dialog>
```

**Select** (`select.tsx`)
```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Textarea** (`textarea.tsx`)
```typescript
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter notes" rows={4} />
```

**Avatar** (`avatar.tsx`)
```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src={avatarUrl} alt={name} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

**Badge** (`badge.tsx`)
```typescript
import { Badge } from '@/components/ui/badge';

<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Pending</Badge>
```

**Separator** (`separator.tsx`)
```typescript
import { Separator } from '@/components/ui/separator';

<Separator />
<Separator orientation="vertical" />
```

**Table** (`table.tsx`)
```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Skeleton** (`skeleton.tsx`)
```typescript
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-4 w-full" />
<Skeleton className="h-12 w-12 rounded-full" />
```

### Custom Components

#### Audio Recorder (`audio-recorder.tsx`)

Custom component for recording audio in the browser.

**Features:**
- Start/stop recording
- Playback preview
- Returns Blob for upload

**Usage:**
```typescript
import { AudioRecorder } from '@/components/ui/audio-recorder';

<AudioRecorder
  onRecordingComplete={(blob) => {
    // Upload blob
  }}
/>
```

### Form Handling Patterns

Forms use React Hook Form with Zod validation.

**Pattern:**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  async function onSubmit(data: FormData) {
    // Call server action
    const result = await myServerAction(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Success!');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Toast Notifications

Uses Sonner for toast notifications.

**Setup** (in root layout):
```typescript
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**Usage:**
```typescript
import { toast } from 'sonner';

toast.success('Profile updated!');
toast.error('Something went wrong');
toast.info('New message received');
toast.loading('Uploading...');
```

### Common Component Patterns

#### Modal Dialog with Form

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Assignment</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit">Create</Button>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

#### Confirmation Dialog

```typescript
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Loading States

```typescript
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
) : (
  <div>{/* Content */}</div>
)}
```

---

## Deployment Guide

### Build Process

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run linter**:
   ```bash
   npm run lint
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

   This command:
   - Compiles TypeScript
   - Bundles client and server code
   - Generates optimized static assets
   - Creates `.next` directory with production build

4. **Test production build locally**:
   ```bash
   npm start
   ```

### Environment Variables for Production

Create environment variables in your deployment platform with the following:

**Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Optional:**
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Important:** Never commit `.env.local` to version control. Use your deployment platform's environment variable settings.

### Supabase Project Setup

#### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and name
4. Select region close to your users
5. Set a strong database password

#### 2. Run Database Schema

1. Navigate to SQL Editor in Supabase dashboard
2. Copy contents of `/supabase/schema.sql`
3. Run the entire script
4. Verify tables created in Table Editor

#### 3. Configure Storage

1. Go to Storage section
2. Create new bucket named `uploads`
3. Set to **private** (not public)
4. Add RLS policies for file access:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow users to read files they own or are assigned to
CREATE POLICY "Users can read their files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

#### 4. Configure Authentication

1. Go to Authentication > Settings
2. **Enable Email Provider**:
   - Configure SMTP settings (or use Supabase default for testing)
   - Customize email templates (optional)

3. **Enable OAuth Providers** (optional):
   - Google: Add Client ID and Secret
   - Configure redirect URLs

4. **Set Site URL**:
   - Add your production domain (e.g., `https://your-domain.com`)

5. **Configure Redirect URLs**:
   - Add `https://your-domain.com/auth/callback`

#### 5. Get API Keys

1. Go to Project Settings > API
2. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key (public) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Deployment Platforms

#### Vercel (Recommended)

**Pros:**
- Built for Next.js
- Automatic deployments from Git
- Zero configuration
- Free tier available

**Steps:**
1. Push code to GitHub/GitLab
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

**Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### Railway

**Steps:**
1. Connect GitHub repository at [railway.app](https://railway.app)
2. Add environment variables
3. Deploy

#### Other Platforms

MusicLMS can be deployed to any platform that supports Next.js:
- AWS (Amplify, ECS, EC2)
- Google Cloud (Cloud Run, App Engine)
- DigitalOcean (App Platform)
- Fly.io
- Render

See `/DEPLOYMENT.md` for detailed deployment options and recommendations.

### Post-Deployment Checklist

- [ ] Verify homepage loads correctly
- [ ] Test teacher signup flow
- [ ] Test student invite flow and account creation
- [ ] Test login/logout
- [ ] Upload test file to verify Storage bucket works
- [ ] Create test assignment
- [ ] Submit test submission
- [ ] Provide test feedback
- [ ] Check RLS policies are enforcing access control
- [ ] Monitor error logs for issues
- [ ] Set up custom domain (optional)
- [ ] Configure email templates (optional)

### Monitoring and Logging

**Supabase Dashboard:**
- Database > Logs: SQL query logs
- Auth > Logs: Authentication events
- Storage > Logs: File upload/download events

**Vercel Dashboard:**
- Runtime Logs: Server-side errors
- Function Metrics: Performance monitoring
- Analytics: Page views and performance

### Backup and Recovery

**Database Backups:**
- Supabase Pro plan: Daily automated backups
- Free plan: Manual backups via SQL export

**Manual Backup:**
1. Go to Database > Backups
2. Click "Backup now"
3. Download SQL dump

**Restore:**
1. Create new Supabase project
2. Import SQL dump in SQL Editor

### Scaling Considerations

**Database:**
- Free tier: Up to 500MB database
- Pro tier: Up to 8GB database
- Enterprise: Custom limits

**Storage:**
- Free tier: 1GB file storage
- Pro tier: 100GB file storage
- Consider CDN for large media files

**Performance:**
- Use database indexes (already configured in schema)
- Enable caching with React Query
- Optimize images with Next.js Image component
- Use Edge Functions for global performance

---

## Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

### Project Files

- Main Schema: `/supabase/schema.sql`
- Type Definitions: `/src/types/database.ts`
- Environment Template: `.env.example`
- Deployment Guide: `/DEPLOYMENT.md`
- Claude Context: `/CLAUDE.md`

### Getting Help

For issues or questions:
1. Check this documentation
2. Review Supabase logs for database errors
3. Check browser console for client-side errors
4. Review server logs for API errors

### Future Enhancements

Potential features to add:
- Video lesson integration (Zoom, Google Meet)
- Payment processing for lessons (Stripe)
- Parent portal for viewing student progress
- Mobile app (React Native)
- Bulk assignment creation
- Assignment templates
- Practice reminders (email/push notifications)
- Analytics dashboard for teachers
- Student portfolios
- Recital/event management

---

**Last Updated:** December 24, 2025
**Version:** 0.1.0
**Project Location:** `/Users/frank/claude-projects/LMS/music-lms`

