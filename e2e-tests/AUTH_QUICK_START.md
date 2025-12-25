# Music LMS Authentication Testing - Quick Start Guide

**Start testing in 10 minutes!**

---

## Step 1: Verify Environment (2 minutes)

### Check Dev Server
1. Open browser: http://localhost:3000
2. Should see Music LMS homepage
3. If not working, check with development team

### Verify Supabase Connection
1. Click "Sign up" link on homepage
2. Should see signup form (not error page)
3. If error, check `.env` file configuration

**Status**: [ ] Environment Working [ ] Need Help

---

## Step 2: Create Test Accounts (5 minutes)

### Create Teacher Account
1. Go to http://localhost:3000/signup
2. Fill in:
   - Full Name: `Test Teacher`
   - Email: `teacher.test@musiclms.com`
   - Password: `Test123!`
3. Click "Create Account"
4. **Important**: Check email for confirmation link and click it
5. Return to app and login

**Status**: [ ] Teacher Account Created

### Create Student Account via Invite
1. Login as teacher (teacher.test@musiclms.com / Test123!)
2. Go to http://localhost:3000/dashboard/students
3. Look for "Invite Student" button (may be in a dialog or card)
4. Click button and enter email: `student.test@musiclms.com`
5. Click "Send Invite"
6. **Copy the invite URL** that appears
7. Logout (click avatar top-right > Logout)
8. Paste invite URL in browser
9. Fill invite form:
   - Full Name: `Test Student`
   - Email: student.test@musiclms.com (should be pre-filled)
   - Password: `Test123!`
   - Instrument: `Piano`
   - Skill Level: `Beginner`
10. Click "Create Student Account"
11. Login as student

**Invite URL**: ________________________________________________

**Status**: [ ] Student Account Created

---

## Step 3: Quick Smoke Test (3 minutes)

### Test Teacher Login
1. Go to http://localhost:3000/login
2. Login: teacher.test@musiclms.com / Test123!
3. Should see dashboard with:
   - "Welcome back, Test!" heading
   - Teacher menu: Students, Submissions, Library
   - Stats cards
4. Click avatar > Logout

**Status**: [ ] Teacher Login Works

### Test Student Login
1. Go to http://localhost:3000/login
2. Login: student.test@musiclms.com / Test123!
3. Should see dashboard with:
   - "Welcome back, Test!" heading
   - Student menu: Assignments, Practice Log, Feedback
   - NO "Students" or "Submissions" menu
4. Click avatar > Logout

**Status**: [ ] Student Login Works

### Test Session Protection
1. Clear all browser cookies
2. Go directly to http://localhost:3000/dashboard
3. Should immediately redirect to http://localhost:3000/login
4. Should NOT see dashboard content

**Status**: [ ] Session Protection Works

---

## You're Ready to Test!

If all statuses above are checked, you can proceed with full test execution.

### Next Steps:

**Option A: Detailed Testing** (Recommended)
- Open: `AUTH_TESTING_GUIDE.md`
- Follow detailed test cases with expected results
- Document findings thoroughly

**Option B: Quick Testing** (Fast)
- Open: `AUTH_TEST_EXECUTION_SHEET.md`
- Follow checklist format
- Check pass/fail for each test

**Option C: Executive Summary** (Overview)
- Open: `AUTH_TESTING_SUMMARY.md`
- Understand risks and priorities
- Review critical issues

---

## Quick Reference

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| teacher.test@musiclms.com | Test123! | teacher |
| student.test@musiclms.com | Test123! | student |

### Test URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Homepage |
| http://localhost:3000/login | Login page |
| http://localhost:3000/signup | Signup page |
| http://localhost:3000/dashboard | Dashboard (protected) |
| http://localhost:3000/invite/[token] | Student invite page |

### Expected Navigation by Role

**Teacher Menu**:
- Dashboard, Students, Schedule, Assignments, Library, Messages, Submissions, Settings

**Student Menu**:
- Dashboard, Assignments, Schedule, Practice Log, Feedback, Messages, Settings

---

## Troubleshooting

### "Check your email to confirm your account"
- Check spam folder for confirmation email
- Or use Supabase Dashboard > Authentication > Users > Click user > Confirm email manually

### Invite button not found
- Look in /dashboard/students page
- May be labeled "Add Student" or "Invite Student"
- May be a plus icon or button in top-right area

### OAuth not working
- Google OAuth may not be configured in dev environment
- Mark test case as "N/A" if not configured
- Check with dev team if needed

### Cannot login after signup
- Email confirmation may be required
- Check email and click confirmation link
- Or verify in Supabase dashboard

---

## Need Help?

- **Environment Issues**: Contact development team
- **Supabase Access**: Contact DevOps/Admin
- **Test Case Questions**: See AUTH_TESTING_GUIDE.md
- **Bug Reporting**: Use template in AUTH_TEST_EXECUTION_SHEET.md

---

**Ready to test?** Open `AUTH_TEST_EXECUTION_SHEET.md` and start checking boxes!
