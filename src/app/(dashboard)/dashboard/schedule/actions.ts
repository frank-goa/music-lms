'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { createNotification } from '../notifications-actions';

const createLessonSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  durationMinutes: z.number().int().positive(),
  notes: z.string().optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

const updateLessonSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().min(1, 'Student is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  durationMinutes: z.number().int().positive(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

// Helper to check for time conflicts
async function checkTimeConflict(
  supabase: any,
  teacherId: string,
  startTime: Date,
  endTime: Date,
  excludeLessonId?: string
): Promise<{ hasConflict: boolean; conflictingLesson?: any }> {
  let query = supabase
    .from('lessons')
    .select('id, start_time, end_time, student:student_id(full_name)')
    .eq('teacher_id', teacherId)
    .neq('status', 'cancelled')
    .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`);

  if (excludeLessonId) {
    query = query.neq('id', excludeLessonId);
  }

  const { data: conflicts } = await query;

  if (conflicts && conflicts.length > 0) {
    return { hasConflict: true, conflictingLesson: conflicts[0] };
  }

  return { hasConflict: false };
}

export async function createLesson(data: CreateLessonInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { studentId, date, startTime, durationMinutes, notes } = data;

  // Construct timestamps
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  // Check for time conflicts
  const { hasConflict, conflictingLesson } = await checkTimeConflict(
    supabase,
    user.id,
    startDateTime,
    endDateTime
  );

  if (hasConflict) {
    const conflictTime = new Date(conflictingLesson.start_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const studentName = conflictingLesson.student?.full_name || 'another student';
    return {
      error: `Time conflict: You already have a lesson with ${studentName} at ${conflictTime}`
    };
  }

  const { error } = await supabase
    .from('lessons')
    .insert({
      teacher_id: user.id,
      student_id: studentId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'scheduled',
      notes: notes || null,
    });

  if (error) {
    console.error('Error creating lesson:', error);
    return { error: `Failed to schedule lesson: ${error.message}` };
  }

  // Trigger Notification
  const { data: teacher } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const lessonDate = startDateTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  const lessonTime = startDateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  await createNotification(studentId, {
    type: 'lesson',
    title: 'New Lesson Scheduled',
    content: `${teacher?.full_name || 'Your teacher'} scheduled a lesson for ${lessonDate} at ${lessonTime}.`,
    link: '/dashboard/schedule',
  });

  revalidatePath('/dashboard/schedule');
  return { success: true };
}

export async function updateLesson(data: UpdateLessonInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const result = updateLessonSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const { id, studentId, date, startTime, durationMinutes, notes, status } = result.data;

  // Verify ownership
  const { data: lesson } = await supabase
    .from('lessons')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (!lesson || lesson.teacher_id !== user.id) {
    return { error: 'Not authorized to edit this lesson' };
  }

  // Construct timestamps
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  // Check for time conflicts (excluding current lesson)
  const { hasConflict, conflictingLesson } = await checkTimeConflict(
    supabase,
    user.id,
    startDateTime,
    endDateTime,
    id
  );

  if (hasConflict) {
    const conflictTime = new Date(conflictingLesson.start_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const studentName = conflictingLesson.student?.full_name || 'another student';
    return {
      error: `Time conflict: You already have a lesson with ${studentName} at ${conflictTime}`
    };
  }

  const { error } = await supabase
    .from('lessons')
    .update({
      student_id: studentId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      notes: notes || null,
      status: status || 'scheduled',
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating lesson:', error);
    return { error: 'Failed to update lesson' };
  }

  revalidatePath('/dashboard/schedule');
  return { success: true };
}

export async function deleteLesson(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Verify ownership
  const { data: lesson } = await supabase
    .from('lessons')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (!lesson || lesson.teacher_id !== user.id) {
    return { error: 'Not authorized to delete this lesson' };
  }

  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lesson:', error);
    return { error: 'Failed to delete lesson' };
  }

  revalidatePath('/dashboard/schedule');
  return { success: true };
}

export async function getLessons(weekOffset: number = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Calculate the week range based on current date + offset
  const today = new Date();
  const targetDate = weekOffset === 0 ? today : (weekOffset > 0 ? addWeeks(today, weekOffset) : subWeeks(today, Math.abs(weekOffset)));
  
  const start = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(targetDate, { weekStartsOn: 1 });

  // Get user role to determine query
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  let query = supabase
    .from('lessons')
    .select(`
      id,
      start_time,
      end_time,
      status,
      notes,
      student_id,
      teacher_id,
      student:student_id (full_name, email),
      teacher:teacher_id (full_name)
    `)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    .order('start_time', { ascending: true });

  if (isTeacher) {
    query = query.eq('teacher_id', user.id);
  } else {
    query = query.eq('student_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data;
}

export async function getMyStudents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      user_id,
      user:users!user_id (id, full_name, email)
    `)
    .eq('teacher_id', user.id);

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return data.map(item => item.user).filter(Boolean);
}
