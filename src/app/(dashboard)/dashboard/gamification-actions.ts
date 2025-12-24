'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateStreak } from '@/lib/gamification';

export async function getStudentGamificationStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch practice logs for streak calculation
  const { data: logs } = await supabase
    .from('practice_logs')
    .select('date')
    .eq('student_id', user.id)
    .order('date', { ascending: false });

  // 2. Fetch weekly goal from profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('weekly_practice_goal_minutes')
    .eq('user_id', user.id)
    .single();

  // 3. Fetch logs for this week to calculate progress
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const { data: weeklyLogs } = await supabase
    .from('practice_logs')
    .select('duration_minutes')
    .eq('student_id', user.id)
    .gte('date', startOfWeek.toISOString());

  const streak = calculateStreak(logs || []);
  const weeklyTotal = weeklyLogs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0;
  const goal = profile?.weekly_practice_goal_minutes || 120;

  return {
    streak,
    weeklyTotal,
    goal,
  };
}
