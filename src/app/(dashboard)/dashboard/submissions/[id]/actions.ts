"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const feedbackSchema = z.object({
  submissionId: z.string().uuid(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export async function submitFeedback(data: FeedbackInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user is a teacher
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    return { error: "Only teachers can provide feedback" };
  }

  const result = feedbackSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid input data" };
  }

  const { submissionId, content, rating } = result.data;

  // Verify the submission belongs to an assignment owned by this teacher
  const { data: submission } = await supabase
    .from("submissions")
    .select(
      `
      id,
      student_id,
      assignment_id,
      assignments!inner (
        teacher_id
      )
    `
    )
    .eq("id", submissionId)
    .single();

  if (!submission) {
    return { error: "Submission not found" };
  }

  const assignment = submission.assignments as unknown as { teacher_id: string };
  if (assignment.teacher_id !== user.id) {
    return { error: "You can only review submissions for your own assignments" };
  }

  // Check if feedback already exists
  const { data: existingFeedback } = await supabase
    .from("feedback")
    .select("id")
    .eq("submission_id", submissionId)
    .single();

  if (existingFeedback) {
    return { error: "Feedback has already been provided for this submission" };
  }

  // Create feedback record
  const { error: insertError } = await supabase.from("feedback").insert({
    submission_id: submissionId,
    teacher_id: user.id,
    content,
    rating,
  });

  if (insertError) {
    console.error("Error creating feedback:", insertError);
    return { error: "Failed to submit feedback" };
  }

  // Update assignment_students status to 'reviewed'
  const { error: updateError } = await supabase
    .from("assignment_students")
    .update({ status: "reviewed", updated_at: new Date().toISOString() })
    .eq("assignment_id", submission.assignment_id)
    .eq("student_id", submission.student_id);

  if (updateError) {
    console.error("Error updating status:", updateError);
    // Non-critical - feedback was saved
  }

  revalidatePath(`/dashboard/submissions/${submissionId}`);
  revalidatePath("/dashboard/submissions");
  revalidatePath(`/dashboard/assignments/${submission.assignment_id}`);

  return { success: true };
}
