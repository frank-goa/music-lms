import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Music,
  Calendar,
  Clock,
  ClipboardList,
  FileAudio,
  TrendingUp,
} from "lucide-react";
import { StudentProfileCard } from "./StudentProfileCard";
import { AssignmentHistory } from "./AssignmentHistory";
import { PracticeHistory } from "./PracticeHistory";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getStudentDetails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  studentUserId: string
) {
  // Get student profile (without joining users due to RLS)
  const { data: studentProfile, error } = await supabase
    .from("student_profiles")
    .select("id, user_id, instrument, skill_level, notes, created_at")
    .eq("teacher_id", teacherId)
    .eq("user_id", studentUserId)
    .single();

  if (error || !studentProfile) {
    return null;
  }

  // Fetch user data separately
  const { data: userData } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, created_at")
    .eq("id", studentUserId)
    .single();

  if (!userData) {
    return null;
  }

  // Get assignment stats
  const { data: assignmentData } = await supabase
    .from("assignment_students")
    .select(
      `
      id,
      status,
      created_at,
      assignments!inner (
        id,
        title,
        due_date
      )
    `
    )
    .eq("student_id", studentUserId)
    .order("created_at", { ascending: false });

  // Get practice logs for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: practiceData } = await supabase
    .from("practice_logs")
    .select("id, date, duration_minutes, notes, created_at")
    .eq("student_id", studentUserId)
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: false });

  // Get submissions
  const { data: submissionData } = await supabase
    .from("submissions")
    .select(
      `
      id,
      submitted_at,
      file_type,
      notes,
      assignments!inner (
        id,
        title
      ),
      feedback (
        id,
        content,
        rating,
        created_at
      )
    `
    )
    .eq("student_id", studentUserId)
    .order("submitted_at", { ascending: false })
    .limit(10);

  // Calculate stats
  const assignments = assignmentData || [];
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "submitted" || a.status === "reviewed"
  ).length;
  const pendingAssignments = assignments.filter(
    (a) => a.status === "pending"
  ).length;

  const practiceLogs = practiceData || [];
  const totalPracticeMinutes = practiceLogs.reduce(
    (sum, log) => sum + log.duration_minutes,
    0
  );
  const avgPracticePerDay =
    practiceLogs.length > 0
      ? Math.round(totalPracticeMinutes / 30)
      : 0;

  // Week over week practice comparison
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const thisWeekPractice = practiceLogs
    .filter((l) => l.date >= oneWeekAgo)
    .reduce((sum, l) => sum + l.duration_minutes, 0);

  const lastWeekPractice = practiceLogs
    .filter((l) => l.date >= twoWeeksAgo && l.date < oneWeekAgo)
    .reduce((sum, l) => sum + l.duration_minutes, 0);

  const practiceChange =
    lastWeekPractice > 0
      ? Math.round(((thisWeekPractice - lastWeekPractice) / lastWeekPractice) * 100)
      : thisWeekPractice > 0
      ? 100
      : 0;

  return {
    profile: {
      id: studentProfile.id,
      user_id: studentProfile.user_id,
      instrument: studentProfile.instrument,
      skill_level: studentProfile.skill_level as "beginner" | "intermediate" | "advanced" | null,
      notes: studentProfile.notes,
      created_at: studentProfile.created_at,
    },
    user: userData,
    stats: {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      totalPracticeMinutes,
      avgPracticePerDay,
      thisWeekPractice,
      practiceChange,
    },
    assignments: assignments.map((a) => {
      const assignment = a.assignments as unknown as {
        id: string;
        title: string;
        due_date: string | null;
      };
      return {
        id: a.id,
        status: a.status,
        created_at: a.created_at,
        assignment_id: assignment.id,
        title: assignment.title,
        due_date: assignment.due_date,
      };
    }),
    practiceLogs,
    submissions: (submissionData || []).map((s) => {
      const assignment = s.assignments as unknown as {
        id: string;
        title: string;
      };
      const feedback = s.feedback as unknown as Array<{
        id: string;
        content: string;
        rating: number | null;
        created_at: string;
      }>;
      return {
        id: s.id,
        submitted_at: s.submitted_at,
        file_type: s.file_type,
        notes: s.notes,
        assignment_title: assignment.title,
        feedback: feedback?.[0] || null,
      };
    }),
  };
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  const student = await getStudentDetails(supabase, user.id, id);

  if (!student) {
    notFound();
  }

  const initials = student.user.full_name
    ? student.user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : student.user.email[0].toUpperCase();

  const skillLevelColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  const thisWeekHours = Math.floor(student.stats.thisWeekPractice / 60);
  const thisWeekMinutes = student.stats.thisWeekPractice % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={student.user.avatar_url || undefined}
                alt={student.user.full_name || ""}
              />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {student.user.full_name || "Unnamed Student"}
              </h1>
              <p className="text-muted-foreground">{student.user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {student.profile.instrument && (
                  <Badge variant="outline">
                    <Music className="mr-1 h-3 w-3" />
                    {student.profile.instrument}
                  </Badge>
                )}
                {student.profile.skill_level && (
                  <Badge className={skillLevelColors[student.profile.skill_level]}>
                    {student.profile.skill_level}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.stats.completedAssignments}/{student.stats.totalAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              {student.stats.pendingAssignments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thisWeekHours > 0 ? `${thisWeekHours}h ` : ""}
              {thisWeekMinutes}m
            </div>
            <p className="text-xs text-muted-foreground">practice time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Avg</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.stats.avgPracticePerDay}m
            </div>
            <p className="text-xs text-muted-foreground">last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                student.stats.practiceChange > 0
                  ? "text-green-600"
                  : student.stats.practiceChange < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {student.stats.practiceChange > 0 ? "+" : ""}
              {student.stats.practiceChange}%
            </div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="practice">Practice Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <StudentProfileCard
              profile={student.profile}
              user={student.user}
            />

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest work submitted by this student</CardDescription>
              </CardHeader>
              <CardContent>
                {student.submissions.length > 0 ? (
                  <div className="space-y-4">
                    {student.submissions.slice(0, 5).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                      >
                        <FileAudio className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {submission.assignment_title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                          {submission.feedback ? (
                            <Badge variant="secondary" className="mt-1">
                              Reviewed
                              {submission.feedback.rating && (
                                <span className="ml-1">
                                  {submission.feedback.rating}/5
                                </span>
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-1">
                              Awaiting review
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No submissions yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentHistory assignments={student.assignments} />
        </TabsContent>

        <TabsContent value="practice">
          <PracticeHistory practiceLogs={student.practiceLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
