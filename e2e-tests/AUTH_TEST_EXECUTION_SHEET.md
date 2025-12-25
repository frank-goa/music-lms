# Music LMS - Authentication Test Execution Sheet

**Test Date**: _______________
**Tester**: _______________
**Build/Version**: _______________
**Environment**: http://localhost:3000

---

## Quick Setup Checklist

- [ ] Dev server running on localhost:3000
- [ ] Supabase project accessible
- [ ] Browser DevTools open
- [ ] Test accounts created (see below)

### Test Accounts Setup

Create these accounts before testing:

| Purpose | Email | Password | Role | Created? |
|---------|-------|----------|------|----------|
| Primary Teacher | teacher.test@musiclms.com | Test123! | teacher | [ ] |
| Student via Invite | student.test@musiclms.com | Test123! | student | [ ] |
| For Duplicate Test | existing@musiclms.com | Test123! | teacher | [ ] |

---

## Test Execution Summary

| Test ID | Test Name | Priority | Status | Notes |
|---------|-----------|----------|--------|-------|
| AUTH-001 | Teacher Login - Valid | High | [ ] PASS [ ] FAIL | |
| AUTH-002 | Login - Invalid Password | High | [ ] PASS [ ] FAIL | |
| AUTH-003 | Login - Non-existent Email | High | [ ] PASS [ ] FAIL | |
| AUTH-004 | Student Login - Valid | High | [ ] PASS [ ] FAIL | |
| AUTH-005 | Teacher Signup - New Account | High | [ ] PASS [ ] FAIL | |
| AUTH-006 | Signup - Existing Email | Medium | [ ] PASS [ ] FAIL | |
| AUTH-007 | Signup - Weak Password | Medium | [ ] PASS [ ] FAIL | |
| AUTH-008 | Accept Valid Invite | High | [ ] PASS [ ] FAIL | |
| AUTH-009 | Expired Invite Link | Medium | [ ] PASS [ ] FAIL | |
| AUTH-010 | Logout from Dashboard | High | [ ] PASS [ ] FAIL | |
| AUTH-011 | Access Dashboard No Login | High | [ ] PASS [ ] FAIL | |
| AUTH-012 | Google OAuth Login | Medium | [ ] PASS [ ] N/A | |
| AUTH-013 | Email Format Validation | Medium | [ ] PASS [ ] FAIL | |
| AUTH-014 | Redirect Logged-In User | Medium | [ ] PASS [ ] FAIL | |
| AUTH-015 | Invite Link While Logged In | Low | [ ] PASS [ ] FAIL | |
| AUTH-016 | Email Case Sensitivity | Low | [ ] PASS [ ] FAIL | |
| AUTH-017 | Magic Link Login | Medium | [ ] PASS [ ] FAIL | |

**Total Tests**: 17
**Passed**: _____
**Failed**: _____
**Blocked**: _____
**N/A**: _____

---

## Detailed Test Results

### AUTH-001: Teacher Login - Valid Credentials

**Steps**:
1. Go to /login
2. Enter: teacher.test@musiclms.com / Test123!
3. Click "Log in"

**Expected**: Redirect to /dashboard, teacher nav items visible

**Result**: [ ] PASS [ ] FAIL

**Actual Behavior**:
________________________________________________
________________________________________________

**Screenshots**: ______________________________

---

### AUTH-002: Login - Invalid Password

**Steps**:
1. Go to /login
2. Enter: teacher.test@musiclms.com / WrongPassword123!
3. Click "Log in"

**Expected**: Error toast "Invalid login credentials", stay on /login

**Result**: [ ] PASS [ ] FAIL

**Actual Error Message**:
________________________________________________

---

### AUTH-003: Login - Non-existent Email

**Steps**:
1. Go to /login
2. Enter: nonexistent@test.com / AnyPassword123!
3. Click "Log in"

**Expected**: Error message, stay on /login

**Result**: [ ] PASS [ ] FAIL

**Actual Error Message**:
________________________________________________

---

### AUTH-004: Student Login - Valid Credentials

**Steps**:
1. Go to /login
2. Enter: student.test@musiclms.com / Test123!
3. Click "Log in"

**Expected**: Redirect to /dashboard, STUDENT nav items (Assignments, Practice Log, Feedback)

**Result**: [ ] PASS [ ] FAIL

**Nav Items Displayed**:
________________________________________________

**Issues Found**:
________________________________________________

---

### AUTH-005: Teacher Signup - New Account

**Steps**:
1. Go to /signup
2. Enter: Full Name: "New Teacher", Email: newteacher@test.com, Password: Test123!
3. Click "Create Account"

**Expected**: Success toast "Check your email to confirm", redirect to /login

**Result**: [ ] PASS [ ] FAIL

**Actual Behavior**:
________________________________________________

**Email Received?**: [ ] YES [ ] NO [ ] N/A

---

### AUTH-006: Signup - Existing Email

**Steps**:
1. Go to /signup
2. Enter email: existing@musiclms.com (existing account)
3. Click "Create Account"

**Expected**: Error "User already registered"

**Result**: [ ] PASS [ ] FAIL

**Actual Error**:
________________________________________________

---

### AUTH-007: Signup - Weak Password

**Steps**:
1. Go to /signup
2. Enter password: "12345" (less than 6 chars)
3. Try to submit

**Expected**: Browser validation "Please lengthen this text to 6 characters or more"

**Result**: [ ] PASS [ ] FAIL

**Actual Behavior**:
________________________________________________

---

### AUTH-008: Accept Valid Invite

**Setup**:
1. Login as teacher
2. Go to /dashboard/students
3. Click "Invite Student" button (look for button with "Invite" or "Add Student")
4. Enter email: newinvite@test.com
5. Click "Send Invite"
6. Copy invite URL
7. Logout

**Test Steps**:
1. Navigate to invite URL: /invite/[token]
2. Fill form: Full Name: "New Student", Email: newinvite@test.com, Password: Test123!, Instrument: Piano, Level: Beginner
3. Click "Create Student Account"

**Expected**: Success toast, redirect to /login, can login immediately (no email confirm)

**Result**: [ ] PASS [ ] FAIL

**Invite URL**: ________________________________________________

**Issues**:
________________________________________________

**Database Verification**:
- [ ] User created in auth.users
- [ ] User in public.users with role=student
- [ ] student_profiles entry created with correct teacher_id
- [ ] Invite marked as used (used_at timestamp set)

---

### AUTH-009: Expired Invite Link

**Setup** (requires database access):
```sql
INSERT INTO public.invites (teacher_id, email, token, expires_at, created_at)
VALUES ('[teacher-id]', 'expired@test.com', 'expired-token-123', NOW() - INTERVAL '8 days', NOW() - INTERVAL '10 days');
```

**Steps**:
1. Go to /invite/expired-token-123

**Expected**: Error page "This invite link is invalid or has expired"

**Result**: [ ] PASS [ ] FAIL [ ] BLOCKED (no DB access)

**Actual Behavior**:
________________________________________________

---

### AUTH-010: Logout from Dashboard

**Steps**:
1. Login as any user
2. Go to /dashboard
3. Click user avatar (top-right)
4. Click "Log out"

**Expected**: Redirect to /, cannot access /dashboard without login

**Result**: [ ] PASS [ ] FAIL

**Verification**:
- [ ] Redirected to homepage
- [ ] Accessing /dashboard redirects to /login

---

### AUTH-011: Access Dashboard Without Login

**Steps**:
1. Clear all cookies
2. Go to /dashboard directly

**Expected**: Immediate redirect to /login

**Result**: [ ] PASS [ ] FAIL

**Actual Behavior**:
________________________________________________

**Also Test**:
- /dashboard/students → redirects to /login? [ ] YES [ ] NO
- /dashboard/assignments → redirects to /login? [ ] YES [ ] NO

---

### AUTH-012: Google OAuth Login

**Precondition**: Google OAuth enabled in Supabase

**Steps**:
1. Go to /login
2. Click "Continue with Google"
3. Select Google account
4. Approve permissions

**Expected**: Redirect to /dashboard, account created with role=teacher

**Result**: [ ] PASS [ ] FAIL [ ] N/A (OAuth not configured)

**Issues**:
________________________________________________

---

### AUTH-013: Email Format Validation

**Steps**:
1. Go to /login
2. Test invalid emails: "notanemail", "test@", "@example.com"

**Expected**: HTML5 validation prevents submission

**Result**: [ ] PASS [ ] FAIL

**Emails Tested**:
- "notanemail" → [ ] Validated
- "test@" → [ ] Validated
- "@example.com" → [ ] Validated

---

### AUTH-014: Redirect Logged-In User from Auth Pages

**Steps**:
1. Login as teacher
2. Navigate to /login
3. Navigate to /signup

**Expected**: Both redirect to /dashboard immediately

**Result**: [ ] PASS [ ] FAIL

**Actual Behavior**:
________________________________________________

---

### AUTH-015: Invite Link While Logged In

**Steps**:
1. Login as teacher
2. Navigate to valid invite URL

**Expected**: "Already Logged In" page, button to "Log Out & Accept Invite"

**Result**: [ ] PASS [ ] FAIL

**Actual Behavior**:
________________________________________________

---

### AUTH-016: Email Case Sensitivity

**Steps**:
1. Login with uppercase email: TEACHER.TEST@MUSICLMS.COM

**Expected**: Login succeeds (case-insensitive)

**Result**: [ ] PASS [ ] FAIL

---

### AUTH-017: Magic Link Login

**Steps**:
1. Go to /login
2. Enter email
3. Click "Send me a magic link instead"
4. Check email
5. Click link

**Expected**: Success toast, email sent, clicking link logs in

**Result**: [ ] PASS [ ] FAIL [ ] N/A (email not configured)

**Issues**:
________________________________________________

---

## Bugs Found

### Bug 1
**ID**: AUTH-BUG-001
**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
**Test Case**: AUTH-___
**Summary**: ________________________________________________
**Steps to Reproduce**: ________________________________________________
**Expected**: ________________________________________________
**Actual**: ________________________________________________
**Screenshot**: ________________________________________________

### Bug 2
**ID**: AUTH-BUG-002
**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
**Test Case**: AUTH-___
**Summary**: ________________________________________________

### Bug 3
**ID**: AUTH-BUG-003
**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
**Test Case**: AUTH-___
**Summary**: ________________________________________________

---

## Known Issues from Code Review

### ISSUE-001: No Role Selection in Signup
- **Severity**: High
- **Description**: Signup hardcodes role as "teacher" - no UI for role selection
- **Impact**: Only teachers can signup normally, students must use invite
- **Observed During Testing?**: [ ] YES [ ] NO

### ISSUE-002: Missing Precondition Documentation
- **Description**: Test cases assume invite creation works but wasn't tested first
- **Impact**: AUTH-008 may be blocked
- **Resolved?**: [ ] YES [ ] NO

---

## Browser Compatibility

| Browser | Version | All Tests Pass? | Issues Found |
|---------|---------|-----------------|--------------|
| Chrome | _______ | [ ] YES [ ] NO | ____________ |
| Firefox | _______ | [ ] YES [ ] NO | ____________ |
| Safari | _______ | [ ] YES [ ] NO | ____________ |
| Edge | _______ | [ ] YES [ ] NO | ____________ |

---

## Mobile Testing

| Device/Viewport | Tests Pass? | Issues |
|-----------------|-------------|--------|
| iPhone (375px) | [ ] YES [ ] NO | ______ |
| iPad (768px) | [ ] YES [ ] NO | ______ |
| Android (412px) | [ ] YES [ ] NO | ______ |

---

## Additional Notes

### Observations:
________________________________________________
________________________________________________
________________________________________________

### Recommendations:
________________________________________________
________________________________________________
________________________________________________

### Questions for Development Team:
________________________________________________
________________________________________________
________________________________________________

---

## Sign-Off

**Test Execution Complete**: [ ] YES [ ] NO

**Critical Bugs Found**: _____ (Count)

**Recommendation**: [ ] PASS [ ] PASS WITH ISSUES [ ] FAIL

**Tester Signature**: ______________________ **Date**: __________

**Reviewed By**: ______________________ **Date**: __________

