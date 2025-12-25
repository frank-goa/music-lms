'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createNotification } from '../notifications-actions';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  studentIds: z.array(z.string()).min(1, 'Select at least one student'),
  resourceIds: z.array(z.string()).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export async function createAssignment(data: CreateAssignmentInput) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Validate input
  const result = createAssignmentSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const { title, description, dueDate, studentIds, resourceIds } = result.data;

  // 1. Create the assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .insert({
      teacher_id: user.id,
      title,
      description,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    })
    .select()
    .single();

  if (assignmentError) {
    console.error('Error creating assignment:', assignmentError);
    return { error: 'Failed to create assignment' };
  }

  // 2. Assign to students
  if (studentIds.length > 0) {
    const assignmentStudents = studentIds.map((studentId) => ({
      assignment_id: assignment.id,
      student_id: studentId,
      status: 'pending' as const,
    }));

    const { error: linkError } = await supabase
      .from('assignment_students')
      .insert(assignmentStudents);

    if (linkError) {
      console.error('Error assigning students:', linkError);
      return { error: 'Assignment created but failed to link students' };
    }
  }

  // 3. Link Resources
  if (resourceIds && resourceIds.length > 0) {
    const assignmentResources = resourceIds.map((resourceId) => ({
      assignment_id: assignment.id,
      resource_id: resourceId,
    }));

    const { error: resourceError } = await supabase
      .from('assignment_resources')
      .insert(assignmentResources);

    if (resourceError) {
      console.error('Error linking resources:', resourceError);
      // Non-fatal error
    }
  }

  // 4. Trigger Notifications
  const { data: teacher } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  await Promise.all(
    studentIds.map((studentId) =>
      createNotification(studentId, {
        type: 'assignment',
        title: 'New Assignment',
        content: `${teacher?.full_name || 'Your teacher'} created a new assignment: "${title}"`,
        link: `/dashboard/assignments`,
      })
    )
  );

  revalidatePath('/dashboard/assignments');
  return { success: true, assignmentId: assignment.id };
}

export async function getTeacherAssignments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      assignment_students (count)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }

  return data.map(a => ({
    ...a,
    studentCount: a.assignment_students[0]?.count || 0
  }));
}

export async function getStudentAssignments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get assignments assigned to this student
  const { data: assignmentStudents, error: asError } = await supabase
    .from('assignment_students')
    .select('assignment_id, status, created_at, updated_at')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  if (asError || !assignmentStudents || assignmentStudents.length === 0) {
    if (asError) console.error('Error fetching student assignments:', asError);
    return [];
  }

  // Get the assignment details
  const assignmentIds = assignmentStudents.map(as => as.assignment_id);
  const { data: assignments, error: aError } = await supabase
    .from('assignments')
    .select('id, title, description, due_date, created_at, teacher_id')
    .in('id', assignmentIds);

  if (aError || !assignments) {
    console.error('Error fetching assignment details:', aError);
    return [];
  }

  // Get teacher info
  const teacherIds = [...new Set(assignments.map(a => a.teacher_id))];
  const { data: teachers } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', teacherIds);

  const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);

  // Combine the data
  return assignmentStudents.map(as => {
    const assignment = assignments.find(a => a.id === as.assignment_id);
    return {
      id: as.assignment_id,
      title: assignment?.title || 'Unknown',
      description: assignment?.description,
      due_date: assignment?.due_date,
      created_at: assignment?.created_at,
      status: as.status,
      teacher_name: teacherMap.get(assignment?.teacher_id || '') || 'Unknown Teacher',
    };
  });
}