# Music LMS - Authentication Testing Guide

## Overview
This guide provides comprehensive information for manually testing the Authentication category of the Music LMS application.

**Application URL**: http://localhost:3000
**Date**: 2024-12-24

---

## Table of Contents
1. [Pre-Test Setup](#pre-test-setup)
2. [Test Data Reference](#test-data-reference)
3. [Implementation Analysis](#implementation-analysis)
4. [Test Cases with Detailed Steps](#test-cases-with-detailed-steps)
5. [Identified Issues and Gaps](#identified-issues-and-gaps)
6. [Additional Test Scenarios](#additional-test-scenarios)

---

## Pre-Test Setup

### Database Seeding
The application includes test data in `/Users/frank/claude-projects/LMS/music-lms/supabase/seed-data.sql`. However, **this seed data does NOT include authentication credentials** because it only populates the `public.users` table, not the `auth.users` table.

### Required Setup Steps

#### Option 1: Create Test Accounts Manually via UI
1. Open http://localhost:3000/signup
2. Create test accounts using the signup form
3. Use the credentials you created for testing

#### Option 2: Create Test Accounts via Supabase Dashboard
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" or "Invite User"
3. Create test accounts with known passwords

### Recommended Test Accounts

Create the following accounts for comprehensive testing:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| teacher.test@musiclms.com | Test123! | teacher | Primary teacher account |
| teacher2@musiclms.com | Test123! | teacher | Secondary teacher account |
| student.test@musiclms.com | Test123! | student | Student account (via invite) |
| student2@musiclms.com | Test123! | student | Second student account |
| invalid@test.com | N/A | N/A | For negative testing |

### Environment Verification
1. Ensure `.env` file exists with valid Supabase credentials
2. Verify dev server is running: `http://localhost:3000`
3. Check Supabase project is accessible

---

## Test Data Reference

### Seeded Users (from seed-data.sql)
**Note**: These users exist in `public.users` but may NOT have auth credentials unless you create them separately.

#### Teachers:
- **Sarah Johnson**: sarah.johnson@musicstudio.com (Teacher ID: 11111111-1111-1111-1111-111111111111)
- **Michael Chen**: michael.chen@guitarschool.com (Teacher ID: 33333333-3333-3333-3333-333333333333)

#### Students:
- **Emma Williams**: emma.williams@email.com (Student of Sarah Johnson)
- **James Brown**: james.brown@email.com (Student of Sarah Johnson)
- **Sophia Davis**: sophia.davis@email.com (Student of Sarah Johnson)
- **Olivia Martinez**: olivia.martinez@email.com (Student of Sarah Johnson)
- **Alexander Taylor**: alexander.taylor@email.com (Student of Michael Chen)
- **Isabella Anderson**: isabella.anderson@email.com (Student of Michael Chen)
- **Ethan Thomas**: ethan.thomas@email.com (Student of Michael Chen)

**ACTION REQUIRED**: If you want to use these accounts for login testing, you must create corresponding auth.users entries with passwords via Supabase Dashboard.

---

## Implementation Analysis

### Authentication Architecture

#### Key Components:

1. **Login Page** (`/src/app/(auth)/login/page.tsx`)
   - Email/password authentication via Supabase Auth
   - Google OAuth support
   - Magic link (OTP) support
   - Client-side validation (HTML5 required fields)
   - Error handling via toast notifications

2. **Signup Page** (`/src/app/(auth)/signup/page.tsx`)
   - Email/password registration
   - Google OAuth signup
   - **CRITICAL**: Role is hardcoded to "teacher" (line 36)
   - Email confirmation required (redirects to /login after signup)
   - Minimum password length: 6 characters (client-side validation)

3. **Invite Flow** (`/src/app/(auth)/invite/[token]/page.tsx` & `actions.ts`)
   - Token-based invite validation
   - Checks for expired invites (7 days from seed data)
   - Creates student accounts via admin API (auto-confirmed, no email verification)
   - Prevents duplicate accounts
   - Requires instrument and skill level selection
   - Links student to teacher via `student_profiles` table

4. **Middleware** (`/src/middleware.ts` & `/src/lib/supabase/middleware.ts`)
   - Protects dashboard routes (redirects to /login if not authenticated)
   - Prevents authenticated users from accessing /login and /signup
   - Public routes: /, /login, /signup, /auth/callback, /invite/*

5. **Dashboard Layout** (`/src/app/(dashboard)/layout.tsx`)
   - Server-side authentication check
   - Creates user profile for OAuth users (defaults to teacher role)
   - Fetches user data and notifications
   - Redirects to /login if no auth user

6. **Logout** (in `DashboardLayout.tsx`)
   - Client-side logout via user menu dropdown
   - Calls `supabase.auth.signOut()`
   - Redirects to homepage

---

## Test Cases with Detailed Steps

### AUTH-001: Teacher Login - Valid Credentials

**Priority**: High
**Category**: Functional - Positive Path

**Preconditions**:
- Create teacher account via signup: teacher.test@musiclms.com / Test123!
- Ensure user is logged out

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Verify login page loads with:
   - MusicLMS logo and branding
   - "Welcome back" heading
   - Google login button
   - Email and password input fields
   - "Log in" button
   - "Send me a magic link instead" option
   - "Sign up" link in footer
3. Enter email: `teacher.test@musiclms.com`
4. Enter password: `Test123!`
5. Click "Log in" button
6. Observe loading state (spinner on button)

**Expected Results**:
- User is redirected to `/dashboard`
- URL changes to `http://localhost:3000/dashboard`
- Dashboard displays "Welcome back, [FirstName]!" heading
- Teacher navigation items visible in sidebar:
  - Dashboard, Students, Schedule, Assignments, Library, Messages, Submissions, Settings
- Stats cards display: Total Students, Assignments, Pending Reviews
- User avatar/menu appears in top-right corner
- No error messages displayed

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**:

---

### AUTH-002: Teacher Login - Invalid Password

**Priority**: High
**Category**: Functional - Negative Path

**Preconditions**:
- Valid teacher account exists: teacher.test@musiclms.com / Test123!
- User is logged out

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter email: `teacher.test@musiclms.com`
3. Enter password: `WrongPassword123!`
4. Click "Log in" button

**Expected Results**:
- Toast error message appears (top-right or center of screen)
- Error message text: "Invalid login credentials" or similar from Supabase
- User remains on `/login` page
- Form fields are cleared or retain email value
- No navigation occurs
- Login button returns to normal state (not loading)

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**:

---

### AUTH-003: Teacher Login - Non-existent Email

**Priority**: High
**Category**: Functional - Negative Path

**Preconditions**:
- User is logged out

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter email: `nonexistent.user@example.com`
3. Enter password: `AnyPassword123!`
4. Click "Log in" button

**Expected Results**:
- Toast error message appears
- Error message text: "Invalid login credentials" or "Email not found"
- User remains on `/login` page
- No navigation occurs

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**:

---

### AUTH-004: Student Login - Valid Credentials

**Priority**: High
**Category**: Functional - Positive Path

**Preconditions**:
- Create student account via invite flow or manually in Supabase Dashboard
- Student email: student.test@musiclms.com / Test123!
- Ensure role is set to 'student' in public.users table
- Student must be linked to a teacher in student_profiles table

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter email: `student.test@musiclms.com`
3. Enter password: `Test123!`
4. Click "Log in" button

**Expected Results**:
- User is redirected to `/dashboard`
- Dashboard displays "Welcome back, [FirstName]!" heading
- **Student navigation items visible** in sidebar (different from teacher):
  - Dashboard, Assignments, Schedule, Practice Log, Feedback, Messages, Settings
- Stats cards display: Pending Assignments, Practice This Week
- **No** "Students", "Library", or "Submissions" menu items (teacher-only features)
- User avatar/menu appears in top-right corner with role = "student"

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**: This test verifies role-based UI rendering

---

### AUTH-005: Teacher Signup - New Account

**Priority**: High
**Category**: Functional - Positive Path

**Preconditions**:
- User is logged out
- Email does not exist in database: newteacher@test.com

**Test Steps**:
1. Navigate to http://localhost:3000/signup
2. Verify signup page displays:
   - "Create your account" heading
   - Google signup button
   - Full Name, Email, Password fields
   - "Create Account" button
   - "Log in" link in footer
3. Enter Full Name: `New Teacher`
4. Enter Email: `newteacher@test.com`
5. Enter Password: `Test123!` (6+ characters)
6. Click "Create Account" button
7. Observe loading state

**Expected Results**:
- Success toast message: "Check your email to confirm your account!"
- User is redirected to `/login` page
- **Email confirmation required** (user cannot login until email is confirmed)
- Check Supabase Dashboard > Authentication > Users to verify:
  - User created with email: newteacher@test.com
  - User metadata includes: full_name = "New Teacher", role = "teacher"
  - Email confirmation status = "not confirmed" or "pending"

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**:
- The code shows email confirmation is required (line 33 in signup page)
- User must click confirmation link in email before they can login
- **ISSUE IDENTIFIED**: No role selection in UI - hardcoded to "teacher"

---

### AUTH-006: Teacher Signup - Existing Email

**Priority**: Medium
**Category**: Functional - Negative Path

**Preconditions**:
- Existing account: teacher.test@musiclms.com / Test123!

**Test Steps**:
1. Navigate to http://localhost:3000/signup
2. Enter Full Name: `Duplicate User`
3. Enter Email: `teacher.test@musiclms.com` (existing email)
4. Enter Password: `NewPassword123!`
5. Click "Create Account" button

**Expected Results**:
- Toast error message appears
- Error text: "User already registered" or "Email already exists"
- User remains on `/signup` page
- No account is created
- No email is sent

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**: Supabase handles duplicate email detection

---

### AUTH-007: Teacher Signup - Weak Password

**Priority**: Medium
**Category**: Functional - Validation

**Preconditions**:
- User is logged out

**Test Steps**:
1. Navigate to http://localhost:3000/signup
2. Enter Full Name: `Test User`
3. Enter Email: `weakpass@test.com`
4. Enter Password: `12345` (less than 6 characters)
5. Click "Create Account" button

**Expected Results**:
- **Client-side validation** triggers (HTML5 minLength constraint)
- Browser displays validation message: "Please lengthen this text to 6 characters or more"
- Form does not submit
- User remains on signup page
- No API call is made to Supabase

**Alternative Test** (if above passes, try 6 characters exactly):
6. Enter Password: `123456` (exactly 6 characters)
7. Click "Create Account" button
8. Should succeed (6 is the minimum)

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**: Password field has `minLength={6}` attribute (line 166)

---

### AUTH-008: Student Invite - Accept Valid Invite

**Priority**: High
**Category**: Functional - Complex Flow

**Preconditions**:
- Teacher account exists and is logged in
- Teacher has created an invite (need to test invite creation flow separately)

**Setup Steps** (Teacher creates invite):
1. Login as teacher
2. Navigate to /dashboard/students
3. Click "Add Student" or "Invite Student" button
4. Enter student email: `newinvite@test.com`
5. Generate invite link
6. Copy the invite URL (format: http://localhost:3000/invite/[token])
7. Logout from teacher account

**Test Steps** (Student accepts invite):
1. Navigate to the invite URL: `http://localhost:3000/invite/[token]`
2. Verify invite page displays:
   - "Join as a Student" heading
   - Teacher name in description: "[Teacher Name] has invited you to join their studio"
   - Full Name, Email (pre-filled if invite has email), Password fields
   - Primary Instrument dropdown
   - Skill Level dropdown (Beginner, Intermediate, Advanced)
   - "Create Student Account" button
3. Enter Full Name: `New Student`
4. Verify Email field shows: `newinvite@test.com` (disabled/pre-filled)
5. Enter Password: `Test123!`
6. Select Primary Instrument: `Piano`
7. Select Skill Level: `Beginner`
8. Click "Create Student Account" button

**Expected Results**:
- Success toast: "Account created! Please log in to continue."
- User redirected to `/login` page
- Student can immediately login (no email confirmation required - auto-confirmed via admin API)
- After login, verify:
  - Student dashboard displays
  - Student is linked to correct teacher
  - Navigation shows student menu items
  - Check database: `student_profiles` table has entry with teacher_id
  - Invite is marked as used (`used_at` timestamp set in `invites` table)

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**:
- Invite flow uses admin API to create user (line 61 in actions.ts)
- Email is auto-confirmed (`email_confirm: true`)
- Student role is set automatically
- Invite token is validated for expiration and usage

---

### AUTH-009: Student Invite - Expired Invite

**Priority**: Medium
**Category**: Functional - Negative Path

**Preconditions**:
- Access to database to create/modify invite records
- User is logged out

**Setup Steps**:
1. Manually insert an expired invite in Supabase database:
   ```sql
   INSERT INTO public.invites (teacher_id, email, token, expires_at, created_at)
   VALUES (
     '[valid-teacher-uuid]',
     'expired@test.com',
     'expired-token-123',
     NOW() - INTERVAL '8 days',  -- 8 days ago (expired)
     NOW() - INTERVAL '10 days'
   );
   ```

**Test Steps**:
1. Navigate to: `http://localhost:3000/invite/expired-token-123`
2. Wait for page to load

**Expected Results**:
- Loading spinner appears briefly (while validating)
- Error page displays:
  - "Invalid Invite" heading
  - Error message: "This invite link is invalid or has expired."
  - Suggestion: "Please ask your teacher for a new invite link."
  - "Go to Homepage" button
- No signup form is shown
- Cannot create account with expired invite

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**: Code validates `gt("expires_at", new Date().toISOString())` (line 91, invite page)

---

### AUTH-010: Logout - From Dashboard

**Priority**: High
**Category**: Functional - Positive Path

**Preconditions**:
- User is logged in (either teacher or student)
- User is on any dashboard page

**Test Steps**:
1. Login as teacher: teacher.test@musiclms.com
2. Navigate to `/dashboard`
3. Verify user avatar appears in top-right corner
4. Click on user avatar to open dropdown menu
5. Verify dropdown shows:
   - User name
   - User email
   - User role (teacher/student)
   - "Settings" option
   - "Log out" option (in red/destructive color)
6. Click "Log out"

**Expected Results**:
- User is immediately logged out
- Supabase session is cleared (cookies removed)
- User is redirected to homepage: `/` (root)
- Cannot access `/dashboard` without logging in again
- Verify logout by trying to navigate to `/dashboard`:
  - Should redirect to `/login`

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**: Logout function in DashboardLayout.tsx (line 124-129)

---

### AUTH-011: Session Protection - Access Dashboard Without Login

**Priority**: High
**Category**: Security - Authorization

**Preconditions**:
- User is logged out (clear browser cookies/session)
- No active Supabase session

**Test Steps**:
1. Clear all browser cookies for localhost:3000
2. In browser, directly navigate to: `http://localhost:3000/dashboard`
3. Observe behavior

**Expected Results**:
- User is **immediately redirected** to `/login` page
- URL changes to: `http://localhost:3000/login`
- Dashboard content never displays (server-side redirect)
- No error message (silent redirect)

**Additional Verification**:
4. Try accessing other protected routes:
   - `/dashboard/students` → redirects to `/login`
   - `/dashboard/assignments` → redirects to `/login`
   - `/dashboard/settings` → redirects to `/login`

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail

**Notes**:
- Middleware handles this (line 42-46 in middleware.ts)
- Dashboard layout also checks (line 13-15 in layout.tsx)

---

### AUTH-012: OAuth - Login with Google

**Priority**: Medium
**Category**: Functional - OAuth Integration

**Preconditions**:
- Google OAuth is enabled in Supabase project
- User has a Google account
- User is logged out

**Setup Verification**:
1. Check Supabase Dashboard > Authentication > Providers
2. Verify "Google" provider is enabled
3. Verify OAuth credentials are configured

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Verify "Continue with Google" button displays with Google logo
3. Click "Continue with Google" button
4. Observe loading state (spinner on button)
5. Google OAuth popup/redirect appears
6. Select Google account or login to Google
7. Approve permissions (if prompted)
8. Wait for redirect back to application

**Expected Results**:
- User is redirected to `/auth/callback` first (OAuth callback route)
- Then redirected to `/dashboard`
- User account is created automatically in `public.users` table:
  - Email from Google account
  - Role defaults to "teacher" (line 30 in dashboard layout)
  - Full name from Google profile (if available)
  - Avatar URL from Google profile (if available)
- Teacher profile is created in `teacher_profiles` table
- User can access dashboard immediately (no email confirmation)
- User avatar displays Google profile picture

**Alternative Path - Existing Google User**:
- If user already signed in with Google before:
  - User is simply logged in (no new account created)
  - Dashboard displays with existing data

**Actual Results**: [To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] N/A (OAuth not configured)

**Notes**:
- OAuth may not be configured in dev environment
- If Google provider is not enabled, button may still show but fail on click
- Check browser console for OAuth errors

---

## Identified Issues and Gaps

### Critical Issues

#### ISSUE-001: No Role Selection in Signup
**Severity**: High
**Location**: `/src/app/(auth)/signup/page.tsx`, line 36
**Description**: The signup form hardcodes the user role as "teacher". There is no UI element for users to select their role (teacher vs. student). This means:
- Normal signup always creates teacher accounts
- Students can only be created through the invite flow
- No way for a student to self-register

**Test Impact**: AUTH-005 test case is incomplete - should verify role selection exists

**Recommendation**:
- Add role selection dropdown in signup form
- Validate role selection is required
- Add test case for student signup (if implemented)
- Or document that only invite flow creates students (design decision)

#### ISSUE-002: Missing Invite Creation Flow Testing
**Severity**: Medium
**Description**: AUTH-008 assumes teachers can create invites, but this flow is not tested. Need to verify:
- How teachers create invites
- UI location for invite creation
- Token generation mechanism
- Email sending (if implemented)
- Invite expiration calculation

**Test Impact**: AUTH-008 cannot be fully tested without invite creation flow

**Recommendation**: Add test cases for invite creation flow (separate category or under AUTH)

#### ISSUE-003: Invite Token Format Unknown
**Severity**: Low
**Location**: Seed data shows tokens like "token-abc-123", but actual generation method unknown
**Description**: Cannot create realistic test invites without knowing token format

**Test Impact**: AUTH-009 may use incorrect token format

**Recommendation**: Check InviteStudentDialog component for token generation logic

### Validation Gaps

#### GAP-001: Email Format Validation
**Test Coverage**: Not explicitly tested
**Description**: No test case for invalid email formats (e.g., "notanemail", "test@", "@example.com")
**Recommendation**: Add test case AUTH-013 for email format validation

#### GAP-002: Password Complexity
**Test Coverage**: Partial - only tests minimum length
**Description**: Only minimum 6 characters is enforced. No tests for:
- Maximum password length
- Special character requirements (if any)
- Uppercase/lowercase requirements (if any)

**Recommendation**: Verify Supabase password policy and add corresponding tests

#### GAP-003: SQL Injection / XSS Testing
**Test Coverage**: None
**Description**: No security testing for malicious input:
- SQL injection in email/password fields
- XSS in full name field
- Script tags in input fields

**Recommendation**: Add security test cases (may be out of scope for manual testing)

#### GAP-004: Session Timeout
**Test Coverage**: None
**Description**: No test for session expiration after inactivity

**Recommendation**: Add test case for session timeout behavior (may require long wait time)

#### GAP-005: Concurrent Login Sessions
**Test Coverage**: None
**Description**: What happens if user logs in from two browsers simultaneously?

**Recommendation**: Add test case for multi-device login

### UI/UX Issues

#### UX-001: No "Forgot Password" Link
**Observation**: Login page does not have a "Forgot Password" or "Reset Password" option
**Impact**: Users with forgotten passwords have no recovery path except magic link
**Test Impact**: Cannot test password reset flow

#### UX-002: No Loading State on Redirect
**Observation**: After successful login, redirect may appear instant or have no feedback
**Impact**: User may be confused if redirect takes time
**Recommendation**: Test and note user experience during redirect

#### UX-003: Error Message Consistency
**Observation**: Error messages come from Supabase - may not be user-friendly
**Recommendation**: Document actual error messages during testing for UX review

### Edge Cases Not Covered

#### EDGE-001: Already Logged In Navigation
**Scenario**: What happens if logged-in user navigates to /login or /signup?
**Expected**: Should redirect to /dashboard
**Test Case**: Not explicitly included
**Recommendation**: Add test case AUTH-014

#### EDGE-002: Invite Link While Logged In
**Scenario**: What happens if logged-in teacher clicks a student invite link?
**Current Implementation**: Shows "Already Logged In" page with logout option (line 172-204 in invite page)
**Test Case**: Not explicitly included
**Recommendation**: Add test case AUTH-015

#### EDGE-003: Magic Link vs Password Login
**Scenario**: User created via magic link, then tries password login
**Test Case**: Not explicitly included
**Recommendation**: Add test case for magic link flow

#### EDGE-004: Case Sensitivity
**Scenario**: Are emails case-sensitive? (test@example.com vs TEST@example.com)
**Expected**: Should be case-insensitive
**Recommendation**: Add test case AUTH-016

---

## Additional Test Scenarios

### AUTH-013: Email Format Validation

**Priority**: Medium
**Category**: Functional - Validation

**Test Steps**:
1. Navigate to `/login`
2. Test various invalid email formats:
   - No @ symbol: `invalidemail`
   - No domain: `test@`
   - No username: `@example.com`
   - Spaces: `test @example.com`
   - Multiple @: `test@@example.com`

**Expected Results**:
- HTML5 validation prevents form submission
- Browser shows "Please enter a valid email address" message

---

### AUTH-014: Redirect Logged-In User from Auth Pages

**Priority**: Medium
**Category**: Functional - Navigation

**Test Steps**:
1. Login as teacher
2. Navigate to `/login`
3. Observe behavior
4. Navigate to `/signup`
5. Observe behavior

**Expected Results**:
- Both pages immediately redirect to `/dashboard`
- No login/signup form is displayed
- Middleware handles redirect (line 48-53 in middleware.ts)

---

### AUTH-015: Invite Link While Logged In

**Priority**: Low
**Category**: Functional - Edge Case

**Test Steps**:
1. Login as teacher
2. Navigate to valid invite URL: `/invite/[valid-token]`

**Expected Results**:
- "Already Logged In" page displays
- Shows current user email and role
- Message: "To accept this student invite, you must create a new student account. Please log out first."
- Two buttons:
  - "Log Out & Accept Invite" (destructive/red)
  - "Go to Dashboard" (outline)

---

### AUTH-016: Email Case Sensitivity

**Priority**: Low
**Category**: Functional - Edge Case

**Preconditions**:
- Create account: teacher.test@musiclms.com / Test123!

**Test Steps**:
1. Navigate to `/login`
2. Enter email in uppercase: `TEACHER.TEST@MUSICLMS.COM`
3. Enter password: `Test123!`
4. Click "Log in"

**Expected Results**:
- Login succeeds (emails are case-insensitive)
- User is redirected to dashboard

---

### AUTH-017: Magic Link Login

**Priority**: Medium
**Category**: Functional - Alternative Auth Method

**Test Steps**:
1. Navigate to `/login`
2. Enter email: `teacher.test@musiclms.com`
3. Click "Send me a magic link instead" button
4. Observe behavior
5. Check email inbox for magic link
6. Click link in email

**Expected Results**:
- Success toast: "Check your email for the login link!"
- Email sent with magic link
- Clicking link logs user in
- Redirects to dashboard

**Notes**: Email sending may not work in dev environment without SMTP configured

---

## Testing Checklist

### Pre-Testing Tasks
- [ ] Verify dev server is running on localhost:3000
- [ ] Verify Supabase project is accessible
- [ ] Create test teacher account(s)
- [ ] Create test student account(s) via invite flow
- [ ] Clear browser cache and cookies before testing
- [ ] Have browser DevTools open for debugging
- [ ] Check console for errors during testing

### During Testing
- [ ] Take screenshots of error messages
- [ ] Note actual error text (not just "error displayed")
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed API calls
- [ ] Verify database state after operations (use Supabase dashboard)
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile viewport (responsive design)

### Post-Testing Tasks
- [ ] Document all actual results
- [ ] Log all bugs found in bug tracking system
- [ ] Report any security concerns immediately
- [ ] Verify all test data can be cleaned up
- [ ] Update test cases based on findings

---

## Bug Report Template

When reporting issues found during testing, use this format:

```
**Bug ID**: AUTH-BUG-XXX
**Test Case**: AUTH-XXX
**Severity**: Critical / High / Medium / Low
**Priority**: High / Medium / Low

**Summary**: [One-line description]

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots**: [Attach if available]

**Environment**:
- Browser:
- OS:
- App Version/Commit:

**Additional Notes**:
```

---

## Risk Assessment

### High-Risk Areas
1. **Invite Flow**: Complex logic with multiple validation points - high chance of edge case bugs
2. **Role Assignment**: Hardcoded teacher role in signup - design flaw or intentional?
3. **Session Management**: Middleware and layout both check auth - potential for inconsistency
4. **OAuth Flow**: External dependency - can fail silently

### Medium-Risk Areas
1. **Password Validation**: Only client-side minimum length - Supabase may have additional rules
2. **Error Messages**: Coming from Supabase - may expose sensitive information
3. **Redirect Logic**: Multiple redirect scenarios - potential for loops or incorrect destination

### Low-Risk Areas
1. **Login Flow**: Standard Supabase implementation - well-tested library
2. **Logout**: Simple auth.signOut() call
3. **UI Rendering**: React components - low chance of critical bugs

---

## Test Execution Order

Recommended sequence for efficient testing:

1. **Setup Phase**: Create test accounts (AUTH-005)
2. **Basic Login**: AUTH-001 (teacher), AUTH-004 (student)
3. **Logout**: AUTH-010
4. **Negative Login**: AUTH-002, AUTH-003
5. **Signup Validation**: AUTH-006, AUTH-007
6. **Session Protection**: AUTH-011
7. **Invite Flow**: AUTH-008, AUTH-009 (requires teacher to create invite first)
8. **OAuth**: AUTH-012 (if configured)
9. **Additional Scenarios**: AUTH-013 through AUTH-017
10. **Edge Cases**: Exploratory testing

---

## Success Criteria

The authentication module passes testing if:
- [ ] All High priority test cases pass
- [ ] No critical or high severity bugs found
- [ ] Login and logout work for both teacher and student roles
- [ ] Invite flow successfully creates student accounts
- [ ] Session protection prevents unauthorized access
- [ ] Error messages are clear and user-friendly
- [ ] No security vulnerabilities discovered
- [ ] UI is responsive and accessible

---

## Notes for Tester

1. **Create Test Accounts First**: You cannot test logins without accounts. Use signup flow or Supabase dashboard.

2. **Seed Data Limitation**: The seed-data.sql only creates public.users records, not auth.users. You must create auth credentials separately.

3. **Invite Testing**: You'll need to explore the teacher dashboard to find how to create invites before testing AUTH-008.

4. **OAuth Testing**: Google OAuth may not work in localhost without proper configuration. Mark as N/A if not configured.

5. **Database Access**: You'll need Supabase dashboard access to verify data integrity and create test scenarios like expired invites.

6. **Error Messages**: Document the exact error text from toasts - this helps UX team improve messaging.

7. **Browser Console**: Always check for JavaScript errors - uncaught exceptions are bugs even if UI appears to work.

8. **Role Verification**: After login, always verify the correct role-specific navigation appears (teacher vs student menus are different).

---

**Document Version**: 1.0
**Last Updated**: 2024-12-24
**Prepared by**: QA Testing Agent
