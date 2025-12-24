-- Run this SQL in your Supabase SQL Editor to apply the latest feature updates.

-- 1. Schedule / Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their lessons" ON public.lessons
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can read their lessons" ON public.lessons
  FOR SELECT USING (student_id = auth.uid());

-- 2. Resource Library
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assignment_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(assignment_id, resource_id)
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their resources" ON public.resources
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can read assigned resources" ON public.resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_resources ar
      JOIN public.assignment_students ast ON ar.assignment_id = ast.assignment_id
      WHERE ar.resource_id = resources.id AND ast.student_id = auth.uid()
    )
  );

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

-- 3. Gamification
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS weekly_practice_goal_minutes INTEGER DEFAULT 120;

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users can read own badges" ON public.user_badges FOR SELECT USING (user_id = auth.uid());

-- 4. Messaging
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON public.lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_resources_teacher ON public.resources(teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
