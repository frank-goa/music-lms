import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubmissionsList } from "./SubmissionsList";

interface SubmissionWithDetails {
  id: string;
  submitted_at: string;
  file_url: string;
  file_type: "pdf" | "audio" | "video";
  notes: string | null;
  student: {
    id: string;
    full_name: string | null;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
  };
  feedback: {
    id: string;
    content: string;
    rating: number | null;
    created_at: string;
  } | null;
}

async function getTeacherSubmissions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string
): Promise<SubmissionWithDetails[]> {
  // Get all submissions for assignments owned by this teacher
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      submitted_at,
      file_url,
      file_type,
      notes,
      student_id,
      assignment_id,
      assignments!inner (
        id,
        title,
        teacher_id
      ),
      feedback (
        id,
        content,
        rating,
        created_at
      )
    `
    )
    .eq("assignments.teacher_id", teacherId)
    .order("submitted_at", { ascending: false });

  if (error || !submissions) {
    console.error("Error fetching submissions:", error);
    return [];
  }

  // Get student info for all submissions
  const studentIds = [...new Set(submissions.map((s) => s.student_id))];

  const { data: students } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", studentIds.length > 0 ? studentIds : ["none"]);

  const studentMap = new Map(
    (students || []).map((s) => [s.id, { id: s.id, full_name: s.full_name, email: s.email }])
  );

  return submissions.map((s) => {
    const assignment = s.assignments as unknown as {
      id: string;
      title: string;
      teacher_id: string;
    };
    const feedbackArray = s.feedback as Array<{
      id: string;
      content: string;
      rating: number | null;
      created_at: string;
    }>;

    return {
      id: s.id,
      submitted_at: s.submitted_at,
      file_url: s.file_url,
      file_type: s.file_type as "pdf" | "audio" | "video",
      notes: s.notes,
      student: studentMap.get(s.student_id) || {
        id: s.student_id,
        full_name: null,
        email: "Unknown",
      },
      assignment: {
        id: assignment.id,
        title: assignment.title,
      },
      feedback: feedbackArray?.[0] || null,
    };
  });
}

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!user || user.role !== "teacher") {
    redirect("/dashboard");
  }

  const submissions = await getTeacherSubmissions(supabase, user.id);

  // Split into pending and reviewed
  const pendingSubmissions = submissions.filter((s) => !s.feedback);
  const reviewedSubmissions = submissions.filter((s) => s.feedback);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">
          Review student submissions and provide feedback
        </p>
      </div>

      <SubmissionsList
        pendingSubmissions={pendingSubmissions}
        reviewedSubmissions={reviewedSubmissions}
      />
    </div>
  );
}
