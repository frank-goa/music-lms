import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentList } from "./StudentList";
import { InviteStudentDialog } from "./InviteStudentDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface StudentWithProfile {
  id: string;
  user_id: string;
  instrument: string | null;
  skill_level: "beginner" | "intermediate" | "advanced" | null;
  notes: string | null;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  stats: {
    assignmentsCompleted: number;
    totalAssignments: number;
    weeklyPracticeMinutes: number;
  };
}

interface PendingInvite {
  id: string;
  email: string | null;
  token: string;
  expires_at: string;
  created_at: string;
}

async function getStudentsWithStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string
): Promise<StudentWithProfile[]> {
  // Get all student profiles for this teacher (without joining users due to RLS)
  const { data: studentProfiles, error } = await supabase
    .from("student_profiles")
    .select("id, user_id, instrument, skill_level, notes, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error || !studentProfiles || studentProfiles.length === 0) {
    console.error("Error fetching students:", error);
    return [];
  }

  // Get user IDs to fetch user data
  const userIds = studentProfiles.map((sp) => sp.user_id);

  // Fetch user data separately - this works with RLS because we're fetching by ID
  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url")
    .in("id", userIds);

  // Create a map for quick lookup
  const userMap = new Map(users?.map((u) => [u.id, u]) || []);

  // Get stats for each student
  const studentsWithStats = await Promise.all(
    studentProfiles.map(async (student) => {
      const [assignmentsResult, practiceResult] = await Promise.all([
        supabase
          .from("assignment_students")
          .select("id, status")
          .eq("student_id", student.user_id),
        supabase
          .from("practice_logs")
          .select("duration_minutes")
          .eq("student_id", student.user_id)
          .gte(
            "date",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          ),
      ]);

      const assignments = assignmentsResult.data || [];
      const totalAssignments = assignments.length;
      const assignmentsCompleted = assignments.filter(
        (a) => a.status === "reviewed" || a.status === "submitted"
      ).length;

      const weeklyPracticeMinutes =
        practiceResult.data?.reduce(
          (sum, log) => sum + log.duration_minutes,
          0
        ) || 0;

      // Get user data from map
      const userData = userMap.get(student.user_id);

      return {
        id: student.id,
        user_id: student.user_id,
        instrument: student.instrument,
        skill_level: student.skill_level,
        notes: student.notes,
        created_at: student.created_at,
        user: {
          id: userData?.id || student.user_id,
          email: userData?.email || "Unknown",
          full_name: userData?.full_name || null,
          avatar_url: userData?.avatar_url || null,
        },
        stats: {
          assignmentsCompleted,
          totalAssignments,
          weeklyPracticeMinutes,
        },
      };
    })
  );

  return studentsWithStats;
}

async function getPendingInvites(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string
): Promise<PendingInvite[]> {
  const { data: invites, error } = await supabase
    .from("invites")
    .select("id, email, token, expires_at, created_at")
    .eq("teacher_id", teacherId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invites:", error);
    return [];
  }

  return invites || [];
}

export default async function StudentsPage() {
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

  const [students, pendingInvites] = await Promise.all([
    getStudentsWithStats(supabase, user.id),
    getPendingInvites(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage your students and send invitations
          </p>
        </div>
        <InviteStudentDialog>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Student
          </Button>
        </InviteStudentDialog>
      </div>

      <StudentList students={students} pendingInvites={pendingInvites} />
    </div>
  );
}
