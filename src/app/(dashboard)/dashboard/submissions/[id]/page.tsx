import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileAudio,
  FileVideo,
  FileText,
  Music,
  Star,
  Download,
} from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";
import { MediaPlayer } from "./MediaPlayer";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getSubmissionDetails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  submissionId: string,
  userId: string
) {
  const { data: submission, error } = await supabase
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
        description,
        due_date,
        teacher_id
      ),
      feedback (
        id,
        content,
        rating,
        created_at,
        teacher_id
      )
    `
    )
    .eq("id", submissionId)
    .single();

  if (error || !submission) {
    return null;
  }

  const assignment = submission.assignments as unknown as {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    teacher_id: string;
  };

  // Check if user is the teacher or the student
  const isTeacher = assignment.teacher_id === userId;
  const isStudent = submission.student_id === userId;

  if (!isTeacher && !isStudent) {
    return null;
  }

  // Get student details
  const { data: student } = await supabase
    .from("users")
    .select("id, full_name, email, avatar_url")
    .eq("id", submission.student_id)
    .single();

  // Get student profile for instrument info
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("instrument, skill_level")
    .eq("user_id", submission.student_id)
    .single();

  const feedbackArray = submission.feedback as Array<{
    id: string;
    content: string;
    rating: number | null;
    created_at: string;
    teacher_id: string;
  }>;

  return {
    id: submission.id,
    submitted_at: submission.submitted_at,
    file_url: submission.file_url,
    file_type: submission.file_type as "pdf" | "audio" | "video",
    notes: submission.notes,
    student: {
      id: submission.student_id,
      full_name: student?.full_name || null,
      email: student?.email || "Unknown",
      avatar_url: student?.avatar_url || null,
      instrument: studentProfile?.instrument || null,
      skill_level: studentProfile?.skill_level || null,
    },
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
    },
    feedback: feedbackArray?.[0] || null,
    isTeacher,
  };
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const submission = await getSubmissionDetails(supabase, id, authUser.id);

  if (!submission) {
    notFound();
  }

  const initials = submission.student.full_name
    ? submission.student.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : submission.student.email[0].toUpperCase();

  const fileTypeIcons = {
    audio: FileAudio,
    video: FileVideo,
    pdf: FileText,
  };
  const FileIcon = fileTypeIcons[submission.file_type];

  const skillLevelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={submission.isTeacher ? "/dashboard/submissions" : `/dashboard/assignments/${submission.assignment.id}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {submission.isTeacher ? "Back to Submissions" : "Back to Assignment"}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{submission.assignment.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={submission.student.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {submission.student.full_name || submission.student.email}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {submission.feedback ? (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Reviewed
              {submission.feedback.rating && ` - ${submission.feedback.rating}/5`}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              Awaiting Review
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Media Player */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileIcon className="h-5 w-5" />
                Submission
              </CardTitle>
              <CardDescription>
                {submission.file_type.charAt(0).toUpperCase() +
                  submission.file_type.slice(1)}{" "}
                file submitted by student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaPlayer
                fileUrl={submission.file_url}
                fileType={submission.file_type}
              />

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {submission.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Student Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{submission.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>
                {submission.isTeacher
                  ? submission.feedback
                    ? "Your feedback on this submission"
                    : "Provide feedback to the student"
                  : "Feedback from your teacher"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submission.feedback ? (
                <div className="space-y-4">
                  {submission.feedback.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= submission.feedback!.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Comments:</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {submission.feedback.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reviewed on{" "}
                    {new Date(submission.feedback.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : submission.isTeacher ? (
                <FeedbackForm submissionId={submission.id} />
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Your teacher hasn&apos;t provided feedback yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Info (Teacher view only) */}
          {submission.isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle>Student Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={submission.student.avatar_url || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {submission.student.full_name || "Unnamed Student"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {submission.student.email}
                    </p>
                  </div>
                </div>

                {(submission.student.instrument || submission.student.skill_level) && (
                  <div className="flex flex-wrap gap-2">
                    {submission.student.instrument && (
                      <Badge variant="outline">
                        <Music className="mr-1 h-3 w-3" />
                        {submission.student.instrument}
                      </Badge>
                    )}
                    {submission.student.skill_level && (
                      <Badge
                        className={
                          skillLevelColors[
                            submission.student.skill_level as keyof typeof skillLevelColors
                          ]
                        }
                      >
                        {submission.student.skill_level}
                      </Badge>
                    )}
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/students/${submission.student.id}`}>
                    View Student Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">{submission.assignment.title}</p>
                {submission.assignment.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {submission.assignment.description}
                  </p>
                )}
              </div>

              {submission.assignment.due_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Due:{" "}
                    {new Date(submission.assignment.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/dashboard/assignments/${submission.assignment.id}`}>
                  View Assignment
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
