# Quick Start: Inserting Dummy Data

## Option 1: Direct SQL Insert (Fastest)

### Step 1: Copy the SQL file content
```bash
cat /Users/frank/claude-projects/LMS/music-lms/supabase/seed-data.sql | pbcopy  # Mac
cat /Users/frank/claude-projects/LMS/music-lms/supabase/seed-data.sql | clip  # Windows
```

### Step 2: Open Supabase SQL Editor
1. Go to [supabase.io](https://supabase.io)
2. Open your project
3. Click "SQL Editor" in left sidebar
4. Paste the copied SQL
5. Click "Run"

**That's it! Your database now has realistic test data.**

---

## Option 2: Using psql Command Line

```bash
# Replace with your connection details
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres" \
  -f /Users/frank/claude-projects/LMS/music-lms/supabase/seed-data.sql
```

---

## What's In The Data?

### Teachers (2):
- **Sarah Johnson** - Piano instructor, Harmony Music Studio
- **Michael Chen** - Guitar instructor, String Theory Guitar School

### Students (7):
- Emma, James, Sophia, Olivia (Piano students)
- Alexander, Isabella, Ethan (Guitar students)
- Mix of Beginner/Intermediate/Advanced levels

### Assignments (8):
- Scales, classical pieces, chord progressions
- Blues improvisation, jazz standards
- Due dates ranging from 5-21 days

### Submissions (5):
- Audio and video recordings from students
- Various statuses: pending review, completed
- Realistic student notes and feedback

### Practice Logs (20):
- 30-150 minute practice sessions
- Student notes about their practice
- Dates ranging from 1-7 days ago

---

## Verify the Data

Run this in Supabase SQL Editor:
```sql
SELECT 'Teachers: ' || COUNT(*) FROM public.teacher_profiles
UNION ALL
SELECT 'Students: ' || COUNT(*) FROM public.student_profiles
UNION ALL
SELECT 'Assignments: ' || COUNT(*) FROM public.assignments
UNION ALL
SELECT 'Submissions: ' || COUNT(*) FROM public.submissions
UNION ALL
SELECT 'Feedback: ' || COUNT(*) FROM public.feedback
UNION ALL
SELECT 'Practice Logs: ' || COUNT(*) FROM public.practice_logs;
```

Expected output:
```
Teachers: 2
Students: 7
Assignments: 8
Submissions: 5
Feedback: 5
Practice Logs: 20
```

---

## Important Prerequisites

**You MUST have auth.users with these IDs first:**
- `11111111-1111-1111-1111-111111111111` (Sarah)
- `33333333-3333-3333-3333-333333333333` (Michael)
- `55555555-5555-5555-5555-555555555555` (Emma)
- `66666666-6666-6666-6666-666666666666` (James)
- etc.

### If you haven't created users yet:

1. Run this SQL first to create auth users:
```sql
-- Create auth users manually
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, created_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'sarah.johnson@musicstudio.com', '$2a$10$YourHashedPassword', '{"role": "teacher", "full_name": "Sarah Johnson"}'::jsonb, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'emma.williams@email.com', '$2a$10$YourHashedPassword', '{"role": "student", "full_name": "Emma Williams"}'::jsonb, NOW(), NOW());
```

2. Or create them through your app first, then run the seed data

---

## Common Issues

### ❌ Foreign key violation
**Problem**: auth.user IDs don't exist
**Solution**: Create users in auth.users first (see above)

### ❌ Duplicate key
**Problem**: You ran the seed twice
**Solution**: Run this to clear data first:
```sql
TRUNCATE public.users, public.teacher_profiles, public.student_profiles,
public.assignments, public.assignment_students, public.submissions,
public.feedback, public.practice_logs CASCADE;
```

---

## Explore the Data

After inserting, explore with these queries:

### Find a student's pending assignments:
```sql
SELECT a.title, ast.status, a.due_date
FROM assignments a
JOIN assignment_students ast ON a.id = ast.assignment_id
WHERE ast.student_id = '55555555-5555-5555-5555-555555555555'
AND ast.status = 'pending';
```

### View teacher's pending reviews:
```sql
SELECT s.*, ast.*
FROM submissions s
JOIN assignments a ON s.assignment_id = a.id
JOIN assignment_students ast ON ast.assignment_id = a.id
WHERE a.teacher_id = '11111111-1111-1111-1111-111111111111'
AND ast.status = 'submitted';
```

### Student practice time this week:
```sql
SELECT SUM(duration_minutes) as total_minutes
FROM practice_logs
WHERE student_id = '55555555-5555-5555-5555-555555555555'
AND date >= CURRENT_DATE - INTERVAL '7 days';
```

---

## Next Steps

1. **Start your dev server**: `npm run dev`
2. **Sign in as a teacher**: sarah.johnson@musicstudio.com
3. **View students, assignments, and submissions**
4. **Test the full workflow**: Assignment → Submission → Feedback

## Full Documentation

See `/Users/frank/claude-projects/LMS/music-lms/supabase/seed-instructions.md` for:
- Detailed setup instructions
- All insert methods explained
- Troubleshooting guide
- Customization examples
- Testing scenarios
