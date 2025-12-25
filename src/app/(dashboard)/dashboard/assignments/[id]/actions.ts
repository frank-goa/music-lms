'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createNotification } from '../../notifications-actions';

const submissionSchema = z.object({
  assignmentId: z.string().uuid(),
  fileUrl: z.string().url(),
  fileType: z.enum(['pdf', 'audio', 'video']),
  notes: z.string().optional(),
});

export type SubmitAssignmentInput = z.infer<typeof submissionSchema>;

const updateAssignmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
});

export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

export async function submitAssignment(data: SubmitAssignmentInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const result = submissionSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const { assignmentId, fileUrl, fileType, notes } = result.data;

  // 1. Create Submission Record
  const { error: insertError } = await supabase
    .from('submissions')
    .insert({
      assignment_id: assignmentId,
      student_id: user.id,
      file_url: fileUrl,
      file_type: fileType,
      notes: notes,
    });

  if (insertError) {
    console.error('Error creating submission:', insertError);
    return { error: 'Failed to save submission record' };
  }

  // 2. Update Assignment Student Status to 'submitted'
  const { error: updateError } = await supabase
    .from('assignment_students')
    .update({ status: 'submitted' })
    .eq('assignment_id', assignmentId)
    .eq('student_id', user.id);

  if (updateError) {
    console.error('Error updating status:', updateError);
    // Non-critical error, submission exists but status might be stale
  }

  // Trigger Notification
  const { data: assignment } = await supabase
    .from('assignments')
    .select('title, teacher_id')
    .eq('id', assignmentId)
    .single();

  if (assignment) {
    const { data: student } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    await createNotification(assignment.teacher_id, {
      type: 'submission',
      title: 'New Submission',
      content: `${student?.full_name || 'A student'} submitted work for "${assignment.title}".`,
      link: `/dashboard/submissions`,
    });
  }

  revalidatePath(`/dashboard/assignments/${assignmentId}`);
  revalidatePath('/dashboard/assignments');
  return { success: true };
}

export async function updateAssignment(data: UpdateAssignmentInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const result = updateAssignmentSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const { id, title, description, dueDate } = result.data;

  // Verify ownership
  const { data: assignment } = await supabase
    .from('assignments')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (!assignment || assignment.teacher_id !== user.id) {
    return { error: 'Not authorized to edit this assignment' };
  }

  const { error } = await supabase
    .from('assignments')
    .update({
      title,
      description: description || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating assignment:', error);
    return { error: 'Failed to update assignment' };
  }

  revalidatePath(`/dashboard/assignments/${id}`);
  revalidatePath('/dashboard/assignments');
  return { success: true };
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Verify ownership
  const { data: assignment } = await supabase
    .from('assignments')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (!assignment || assignment.teacher_id !== user.id) {
    return { error: 'Not authorized to delete this assignment' };
  }

  // Delete assignment (cascades to assignment_students, submissions, etc.)
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting assignment:', error);
    return { error: 'Failed to delete assignment' };
  }

  revalidatePath('/dashboard/assignments');
  redirect('/dashboard/assignments');
}

interface ResourceData {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
}

export async function getAssignmentResources(assignmentId: string): Promise<ResourceData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assignment_resources')
    .select(`
      resource_id,
      resources (
        id,
        title,
        file_url,
        file_type
      )
    `)
    .eq('assignment_id', assignmentId);

  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }

  // Extract resources from the join result
  const resources: ResourceData[] = [];
  for (const ar of data || []) {
    const resource = ar.resources;
    if (resource && !Array.isArray(resource)) {
      resources.push(resource as ResourceData);
    } else if (Array.isArray(resource) && resource.length > 0) {
      resources.push(resource[0] as ResourceData);
    }
  }

  return resources;
}
