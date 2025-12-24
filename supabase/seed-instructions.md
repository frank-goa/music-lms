# MusicLMS Seed Data Instructions

## What's Included

`seed-data.sql` contains realistic dummy data for testing MusicLMS:

### Data Summary:
- **2 Teachers** (Piano & Guitar instructors)
- **7 Students** across different skill levels (beginner to advanced)
- **8 Assignments** covering various musical topics
- **8 Assignment-Student pairs** (assignments distributed to students)
- **4 Reference files** (PDF sheet music, audio backing tracks)
- **5 Student submissions** (audio & video recordings)
- **5 Feedback entries** (teacher reviews with ratings 1-5)
- **20 Practice logs** (tracking practice sessions and duration)

## How to Insert the Data

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to "SQL Editor" in the left sidebar

2. **Run Schema First**
   - If you haven't already, run `schema.sql` to create the tables
   - This also sets up RLS policies and triggers

3. **Run Seed Data**
   - Open `seed-data.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run"

4. **Verify the Data**
   ```sql
   SELECT
     (SELECT COUNT(*) FROM teacher_profiles) as teachers,
     (SELECT COUNT(*) FROM student_profiles) as students,
     (SELECT COUNT(*) FROM assignments) as assignments,
     (SELECT COUNT(*) FROM submissions) as submissions,
     (SELECT COUNT(*) FROM practice_logs) as practice_logs;
   ```

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   brew install supabase/tap/supabase  # Mac
   # or download from https://github.com/supabase/cli/releases
   ```

2. **Link your project**:
   ```bash
   supabase link --project-id your-project-id
   ```

3. **Run the seed file**:
   ```bash
   supabase db reset  # This runs both schema.sql and seed-data.sql
   ```

   Or to just run the seed data:
   ```bash
   supabase db reset --db-url "postgresql://postgres:password@localhost:54322/postgres"
   ```

### Option 3: Using psql (Direct Connection)

1. **Get your connection string** from Supabase:
   - Go to "Database Settings"
   - Copy the connection string under "Connection String"

2. **Run the SQL file**:
   ```bash
   psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" -f supabase/seed-data.sql
   ```

## Important Notes

### Auth Users Requirement

This seed data assumes you have already created users in `auth.users` table with the following IDs:
- Teacher 1: `11111111-1111-1111-1111-111111111111`
- Teacher 2: `33333333-3333-3333-3333-333333333333`
- Students: Various IDs starting with `55555555-...`, `66666666-...`, etc.

**The `users` table references these auth.user IDs**, so they must exist first.

To create auth users, you have two options:

#### Option A: Create Auth Users via API (Recommended)

Use Supabase Auth to sign up users first:

```javascript
// Example: Creating users via Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: 'sarah.johnson@musicstudio.com',
  password: 'password123',
  options: {
    data: {
      role: 'teacher',
      full_name: 'Sarah Johnson'
    }
  }
});
```

#### Option B: Manually Insert Auth Users (Not Recommended)

Only do this if you know what you're doing, as it affects authentication:

```sql
-- Example: Manual auth.users insert (requires password hashing)
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data) VALUES
('11111111-1111-1111-1111-111111111111',
 'sarah.johnson@musicstudio.com',
 '$2a$10$...hashedPassword...',
 '{"role": "teacher", "full_name": "Sarah Johnson"}'::jsonb);
```

### Data Relationships

The seed data maintains proper relationships:
- Students are linked to their teachers
- Assignments are created by teachers
- Submissions are linked to specific assignments and students
- Feedback is linked to submissions and given by teachers
- Practice logs are linked to students

### Customization

You can easily customize the dummy data:

1. **Change names**: Replace the names in the `full_name` fields
2. **Add more data**: Copy-paste and increment the IDs (`asgn009`, `asgn010`, etc.)
3. **Change instruments**: Modify the `instrument` field in student_profiles
4. **Adjust dates**: Change the `NOW() - INTERVAL 'X days'` to simulate different time periods

## Testing the Application

After seeding the data, you can test these scenarios:

### Teacher Login
- **Email**: `sarah.johnson@musicstudio.com` or `michael.chen@guitarschool.com`
- **View**: Student list, assignments, pending reviews

### Student Login
- **Email**: `emma.williams@email.com` (beginner piano)
- **Email**: `sophia.davis@email.com` (advanced piano)
- **View**: Assigned homework, practice logging, teacher feedback

### Key Testing Flows

1. **Teacher creates assignment** → Assigns to students → Students see it on dashboard
2. **Student submits recording** → Shows in teacher's pending reviews → Teacher provides feedback
3. **Student logs practice** → Appears in practice history → Teacher can view progress
4. **Teacher reviews submission** → Rating and comments appear for student

## Troubleshooting

### Foreign Key Errors
If you get foreign key constraint errors:
- Ensure auth.users exist with matching IDs
- Run schema.sql before seed-data.sql
- Check that teacher IDs exist before inserting students

### Duplicate Key Errors
If you get "duplicate key" errors:
- You may have already seeded the database
- Clear existing data first or use `ON CONFLICT DO NOTHING`
- Or reset the database entirely

### Clearing All Data
To start fresh:
```sql
-- DANGEROUS: Deletes all data in all tables
TRUNCATE public.users, public.teacher_profiles, public.student_profiles,
public.invites, public.assignments, public.assignment_students,
public.assignment_files, public.submissions, public.feedback,
public.practice_logs CASCADE;
```

Then re-run the seed data.

## Next Steps

After seeding, you can:
1. **Test the UI** with realistic data
2. **Demo the application** to stakeholders
3. **Run performance tests** with the sample data
4. **Continue development** with data-driven testing
5. **Create additional seed files** for specific scenarios (e.g., large classes, multiple teachers)

## Additional Resources

- **Schema Reference**: `supabase/schema.sql` - See table structures and RLS policies
- **TypeScript Types**: `src/types/database.ts` - View TypeScript interfaces
- **Deployment Guide**: `DEPLOYMENT.md` - Deploy to production with seed data

## Questions?

If you need to regenerate the data with different scenarios:
1. Modify this file directly
2. Or use the generate-dummy-data.js script (if created)
3. Consider using tools like Faker.js for programmatic data generation
