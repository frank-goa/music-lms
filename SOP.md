# MusicLMS Standard Operating Procedures (SOP)

**Version:** 1.0
**Date:** December 25, 2025
**Scope:** This document outlines the standard procedures for using and maintaining the MusicLMS application for Teachers, Students, and Administrators.

---

## 1. Access & Authentication

### 1.1 Teacher Registration (First Time)
**Objective:** Create a new teacher account to manage a studio.

1.  Navigate to the **Signup Page** (`/signup`).
2.  Choose a registration method:
    *   **Email:** Enter Full Name, Email, and create a Password (min 6 chars). Click "Create Account".
    *   **Google:** Click "Continue with Google" and follow the prompts.
3.  Upon successful registration, you will be redirected to the **Dashboard**.
    *   *Note:* If email confirmation is enabled, check your inbox and click the confirmation link first.

### 1.2 Teacher Login
**Objective:** Access the teacher dashboard.

1.  Navigate to the **Login Page** (`/login`).
2.  Enter your registered Email and Password.
3.  Click "Sign In".
4.  Alternatively, use "Continue with Google".

### 1.3 Student Onboarding (Invite Only)
**Objective:** Register a new student account. *Students cannot self-register.*

**Teacher Action:**
1.  Log in to the Teacher Dashboard.
2.  Navigate to **Students** (`/dashboard/students`).
3.  Click **"Invite Student"**.
4.  Enter the student's Email (optional) and click "Generate Invite".
5.  Copy the generated link (e.g., `.../invite/token-xyz`) and send it to the student.

**Student Action:**
1.  Click the invite link received from the teacher.
2.  Fill out the **Accept Invite** form:
    *   Full Name
    *   Email (if not pre-filled)
    *   Password
    *   Instrument (e.g., Piano, Guitar)
    *   Skill Level (Beginner, Intermediate, Advanced)
3.  Click "Join Studio".
4.  You will be redirected to the Login page. Log in with your new credentials.

---

## 2. Teacher Workflows

### 2.1 Managing Students
**Objective:** View roster, update notes, or remove students.

1.  Go to **Students** (`/dashboard/students`).
2.  **View Details:** Click on a student's card to view their profile, assignment history, and practice logs.
3.  **Private Notes:** In the student profile, use the "Notes" section to add private comments visible only to you.
4.  **Remove Student:** Click the "Remove" button (usually in a dropdown or danger zone) to remove them from your roster. *Note: This does not delete their account, only the association.*

### 2.2 Creating Assignments
**Objective:** Assign practice tasks to students.

1.  Go to **Assignments** (`/dashboard/assignments`).
2.  Click **"Create Assignment"**.
3.  Fill in the details:
    *   **Title:** Required (e.g., "C Major Scale").
    *   **Description:** Instructions.
    *   **Due Date:** Optional.
    *   **Assign To:** Select one or multiple students.
    *   **Resources:** (Optional) Select files from your Library to attach.
4.  Click "Create". The assignment will appear in the selected students' dashboards as "Pending".

### 2.3 Reviewing Submissions
**Objective:** Provide feedback on student work.

1.  Go to **Submissions** (`/dashboard/submissions`).
2.  Locate "Pending Reviews".
3.  Click on a submission to view details.
4.  **Review:**
    *   Listen/Watch the student's recording using the inline player.
    *   Read the student's notes.
5.  **Feedback:**
    *   Enter written **Feedback**.
    *   Select a **Rating** (1-5 stars).
    *   Click "Submit Feedback".
6.  The submission status changes to "Reviewed".

### 2.4 Managing Resources (Library)
**Objective:** Upload and organize shared materials (PDFs, Audio, Video).

1.  Go to **Library** (`/dashboard/library`).
2.  Click **"Upload Resource"**.
3.  Select a file from your computer and give it a Title.
4.  Click "Upload".
5.  These resources can now be attached to Assignments.

### 2.5 Scheduling Lessons
**Objective:** Manage the weekly lesson calendar.

1.  Go to **Schedule** (`/dashboard/schedule`).
2.  Click a time slot or **"New Lesson"**.
3.  Select the **Student**, **Date**, **Start Time**, and **End Time**.
4.  Click "Schedule".
5.  To update status (Completed/Cancelled), click on the existing lesson in the calendar.

---

## 3. Student Workflows

### 3.1 Completing Assignments
**Objective:** View tasks and submit recordings.

1.  Log in and go to **Assignments** (`/dashboard/assignments`).
2.  Click on an assignment with "Pending" status.
3.  Read instructions and view any attached resources.
4.  **Submit Work:**
    *   Record audio/video directly (if supported) or Upload a file.
    *   Add comments/notes about your practice.
    *   Click "Submit".
5.  Status changes to "Submitted". Wait for teacher feedback.

### 3.2 Logging Practice
**Objective:** Track daily practice time.

1.  Go to **Practice Log** (`/dashboard/practice`).
2.  Click **"Log Practice"**.
3.  Enter:
    *   **Date:** Today or past date.
    *   **Duration:** Minutes practiced.
    *   **Notes:** What you worked on.
4.  Click "Save".
5.  View your **Streak** and **Weekly Goal** progress on the Dashboard home.

### 3.3 Viewing Feedback
**Objective:** See teacher's comments on submissions.

1.  Go to **Feedback** (`/dashboard/feedback`).
2.  View the list of reviewed assignments.
3.  Click an item to see the Rating and detailed Comments from your teacher.

---

## 4. System Maintenance & Troubleshooting

### 4.1 Clearing the Database (Development Only)
**Warning:** This deletes ALL users and data. Do not run in production.

1.  Open a terminal in the project root.
2.  Run the script: `node scripts/clear-db.js`
3.  This uses the Admin API to cascade delete all users.

### 4.2 Database Seeding (Development Only)
**Objective:** Populate the database with test data.

1.  Ensure the database is clear or fresh.
2.  Open the **Supabase SQL Editor** (web dashboard).
3.  Copy the content of `supabase/seed-data.sql`.
4.  Run the SQL query.
5.  *Prerequisite:* You must create the Auth Users (UUIDs matching the seed file) first, or use the SQL script provided in `supabase/seed-instructions.md` that inserts into `auth.users` directly (only works if you have appropriate permissions/hashing).

### 4.3 Common Issues

*   **"Page not fully loading" / "Sidebar only":**
    *   *Cause:* A server-side query failed.
    *   *Fix:* Check browser console or server logs. Ensure database schema matches code. (Specifically, check `DashboardPage` query syntax).
*   **"Trigger failed" / User not created:**
    *   *Cause:* Database trigger `handle_new_user` failed.
    *   *Fix:* The system has a fallback mechanism in `layout.tsx` that attempts to self-heal by creating the user record on next login. If issues persist, an admin may need to check Supabase logs.
*   **"File Upload Error":**
    *   *Cause:* Storage bucket policies or size limits.
    *   *Fix:* Ensure `uploads` bucket exists and RLS policies allow authenticated inserts.

### 4.4 Getting Help
For technical support, contact the system administrator or refer to `docs/README.md` for developer documentation.

