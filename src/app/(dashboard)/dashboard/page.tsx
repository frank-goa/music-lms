import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, FileAudio, Clock, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { getStudentGamificationStats } from "./gamification-actions";
import { StreakCard } from "@/components/gamification/StreakCard";
import { GoalProgress } from "@/components/gamification/GoalProgress";
import { DashboardSetupLoader } from "./DashboardSetupLoader";

async function getTeacherStats(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const [studentsResult, assignmentsResult, submissionsResult] = await Promise.all([
    supabase.from("student_profiles").select("id", { count: "exact" }).eq("teacher_id", userId),
    supabase.from("assignments").select("id", { count: "exact" }).eq("teacher_id", userId),
    supabase
      .from("submissions")
      .select("id, feedback(id), assignments!inner(teacher_id)")
      .eq("assignments.teacher_id", userId),
  ]);

  const pendingReviews =
    submissionsResult.data?.filter(
      (s) => !s.feedback || (Array.isArray(s.feedback) && s.feedback.length === 0)
    ).length || 0;

  return {
    studentCount: studentsResult.count || 0,
    assignmentCount: assignmentsResult.count || 0,
    pendingReviews: pendingReviews,
  };
}

async function getStudentStats(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const [assignmentsResult, practiceResult] = await Promise.all([
    supabase
      .from("assignment_students")
      .select("id", { count: "exact" })
      .eq("student_id", userId)
      .eq("status", "pending"),
    supabase
      .from("practice_logs")
      .select("duration_minutes")
      .eq("student_id", userId)
      .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
  ]);

  const weeklyPractice = practiceResult.data?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0;

  return {
    pendingAssignments: assignmentsResult.count || 0,
    weeklyPracticeMinutes: weeklyPractice,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", authUser.id).single();

  if (!user) {
    // User profile might not be created yet (race condition on new registration)
    // The layout will handle user creation - use client component to auto-refresh
    return <DashboardSetupLoader />;
  }

  const isTeacher = user.role === "teacher";

  if (isTeacher) {
    const stats = await getTeacherStats(supabase, user.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening in your studio.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/students">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studentCount}</div>
              <p className="text-xs text-muted-foreground">Active students in your studio</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignmentCount}</div>
              <p className="text-xs text-muted-foreground">Total assignments created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileAudio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">Submissions awaiting your feedback</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to help manage your studio</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/dashboard/students">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </Button>
              </Link>
              <Link href="/dashboard/assignments">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </Link>
              <Link href="/dashboard/submissions">
                <Button variant="outline" className="w-full justify-start">
                  <FileAudio className="mr-2 h-4 w-4" />
                  Review Submissions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Steps to set up your studio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      stats.studentCount > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stats.studentCount > 0 ? "✓" : "1"}
                  </div>
                  <div>
                    <p className="font-medium">Add your students</p>
                    <p className="text-sm text-muted-foreground">
                      Invite students to join your studio
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      stats.assignmentCount > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stats.assignmentCount > 0 ? "✓" : "2"}
                  </div>
                  <div>
                    <p className="font-medium">Create an assignment</p>
                    <p className="text-sm text-muted-foreground">
                      Assign practice to your students
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Review submissions</p>
                    <p className="text-sm text-muted-foreground">
                      Give feedback on student recordings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Student Dashboard
  const [stats, gamification] = await Promise.all([
    getStudentStats(supabase, user.id),
    getStudentGamificationStats(),
  ]);
  const hours = Math.floor(stats.weeklyPracticeMinutes / 60);
  const minutes = stats.weeklyPracticeMinutes % 60;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground">Track your progress and complete your assignments.</p>
      </div>

      {/* Gamification Cards */}
      {gamification && (
        <div className="grid gap-4 md:grid-cols-2">
          <StreakCard streak={gamification.streak} />
          <GoalProgress current={gamification.weeklyTotal} target={gamification.goal} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Assignments waiting for submission</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Practice This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hours > 0 ? `${hours}h ` : ""}
              {minutes}m
            </div>
            <p className="text-xs text-muted-foreground">Total practice time logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/dashboard/assignments">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="mr-2 h-4 w-4" />
                View Assignments
              </Button>
            </Link>
            <Link href="/dashboard/practice">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Log Practice
              </Button>
            </Link>
            <Link href="/dashboard/feedback">
              <Button variant="outline" className="w-full justify-start">
                <FileAudio className="mr-2 h-4 w-4" />
                View Feedback
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Consistent daily practice is more effective than long sessions once a week. Try to
              practice at the same time each day to build a habit.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
