-- Music LMS Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'reviewed');
CREATE TYPE file_type AS ENUM ('pdf', 'audio', 'video');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Teacher profiles
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  studio_name TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Student profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  instrument TEXT,
  skill_level skill_level,
  notes TEXT,
  weekly_practice_goal_minutes INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Invites for students
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Assignment to student mapping (many-to-many)
CREATE TABLE public.assignment_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status assignment_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- Assignment reference files
CREATE TABLE public.assignment_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Student submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type file_type NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Teacher feedback on submissions
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Practice logs
CREATE TABLE public.practice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lessons / Schedule
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Resource Library
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Junction table for assignments <-> resources
CREATE TABLE public.assignment_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(assignment_id, resource_id)
);

-- Gamification: Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_key TEXT NOT NULL, -- e.g. 'flame', 'star', 'trophy'
  criteria_type TEXT NOT NULL, -- e.g. 'streak_days', 'total_practice_hours'
  threshold INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Messaging
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_student_profiles_teacher ON public.student_profiles(teacher_id);
CREATE INDEX idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX idx_assignment_students_assignment ON public.assignment_students(assignment_id);
CREATE INDEX idx_assignment_students_student ON public.assignment_students(student_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_feedback_submission ON public.feedback(submission_id);
CREATE INDEX idx_practice_logs_student ON public.practice_logs(student_id);
CREATE INDEX idx_practice_logs_date ON public.practice_logs(date);
CREATE INDEX idx_lessons_teacher ON public.lessons(teacher_id);
CREATE INDEX idx_lessons_student ON public.lessons(student_id);
CREATE INDEX idx_lessons_start_time ON public.lessons(start_time);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_teacher ON public.invites(teacher_id);
CREATE INDEX idx_resources_teacher ON public.resources(teacher_id);
CREATE INDEX idx_assignment_resources_assignment ON public.assignment_resources(assignment_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read own data, teachers can read their students
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can read their students" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      WHERE sp.user_id = users.id AND sp.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teacher profiles: teachers can manage their own
CREATE POLICY "Teachers can read own profile" ON public.teacher_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert own profile" ON public.teacher_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can update own profile" ON public.teacher_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Student profiles: students see own, teachers see their students
CREATE POLICY "Students can read own profile" ON public.student_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can read their students profiles" ON public.student_profiles
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students can insert own profile" ON public.student_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own profile" ON public.student_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their students profiles" ON public.student_profiles
  FOR UPDATE USING (teacher_id = auth.uid());

-- Invites: teachers manage their own invites
CREATE POLICY "Teachers can manage their invites" ON public.invites
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Anyone can read invites by token" ON public.invites
  FOR SELECT USING (true);

-- Assignments: teachers manage, assigned students can read
CREATE POLICY "Teachers can manage their assignments" ON public.assignments
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can read assigned assignments" ON public.assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_students ast
      WHERE ast.assignment_id = assignments.id AND ast.student_id = auth.uid()
    )
  );

-- Assignment students: teachers manage, students can read their own
CREATE POLICY "Teachers can manage assignment students" ON public.assignment_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_students.assignment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can read their assignment links" ON public.assignment_students
  FOR SELECT USING (student_id = auth.uid());

-- Assignment files: teachers manage, assigned students can read
CREATE POLICY "Teachers can manage assignment files" ON public.assignment_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_files.assignment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can read assignment files" ON public.assignment_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_students ast
      WHERE ast.assignment_id = assignment_files.assignment_id AND ast.student_id = auth.uid()
    )
  );

-- Submissions: students manage own, teachers can read from their assignments
CREATE POLICY "Students can manage their submissions" ON public.submissions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers can read submissions for their assignments" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
    )
  );

-- Feedback: teachers manage, students can read their own
CREATE POLICY "Teachers can manage feedback" ON public.feedback
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can read their feedback" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = feedback.submission_id AND s.student_id = auth.uid()
    )
  );

-- Practice logs: students manage own, teachers can read their students
CREATE POLICY "Students can manage their practice logs" ON public.practice_logs
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers can read their students practice logs" ON public.practice_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      WHERE sp.user_id = practice_logs.student_id AND sp.teacher_id = auth.uid()
    )
  );

-- Lessons: teachers manage, students can read their own
CREATE POLICY "Teachers can manage their lessons" ON public.lessons
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can read their lessons" ON public.lessons
  FOR SELECT USING (student_id = auth.uid());

-- Resources: teachers manage own
CREATE POLICY "Teachers can manage their resources" ON public.resources
  FOR ALL USING (teacher_id = auth.uid());

-- Students can read resources that are linked to their assignments
CREATE POLICY "Students can read assigned resources" ON public.resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_resources ar
      JOIN public.assignment_students ast ON ar.assignment_id = ast.assignment_id
      WHERE ar.resource_id = resources.id AND ast.student_id = auth.uid()
    )
  );

-- Assignment Resources: teachers manage
CREATE POLICY "Teachers can manage assignment resources" ON public.assignment_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_resources.assignment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can read assignment resources" ON public.assignment_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_students ast
      WHERE ast.assignment_id = assignment_resources.assignment_id AND ast.student_id = auth.uid()
    )
  );

-- Badges: everyone can read
CREATE POLICY "Anyone can read badges" ON public.badges
  FOR SELECT USING (true);

-- User Badges: users can read their own
CREATE POLICY "Users can read own badges" ON public.user_badges
  FOR SELECT USING (user_id = auth.uid());

-- Messages: users can read/write their own conversations
CREATE POLICY "Users can read their messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_students_updated_at
  BEFORE UPDATE ON public.assignment_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
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

  -- Create teacher profile if role is teacher
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for files (run in Storage settings)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);
