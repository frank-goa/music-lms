"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FileAudio,
  FileVideo,
  FileText,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";

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

interface SubmissionsListProps {
  pendingSubmissions: SubmissionWithDetails[];
  reviewedSubmissions: SubmissionWithDetails[];
}

const fileTypeIcons = {
  audio: FileAudio,
  video: FileVideo,
  pdf: FileText,
};

const fileTypeColors = {
  audio: "text-purple-600 bg-purple-100",
  video: "text-blue-600 bg-blue-100",
  pdf: "text-red-600 bg-red-100",
};

function SubmissionCard({ submission }: { submission: SubmissionWithDetails }) {
  const FileIcon = fileTypeIcons[submission.file_type];
  const iconColor = fileTypeColors[submission.file_type];

  const initials = submission.student.full_name
    ? submission.student.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : submission.student.email[0].toUpperCase();

  const timeSince = getTimeSince(new Date(submission.submitted_at));

  return (
    <Link href={`/dashboard/submissions/${submission.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${iconColor}`}>
              <FileIcon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate">
                    {submission.assignment.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {submission.student.full_name || submission.student.email}
                    </span>
                  </div>
                </div>

                {submission.feedback ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Reviewed
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeSince}
                  </span>
                  {submission.feedback?.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {submission.feedback.rating}/5
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Review
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function SubmissionsList({
  pendingSubmissions,
  reviewedSubmissions,
}: SubmissionsListProps) {
  return (
    <Tabs defaultValue="pending" className="space-y-6">
      <TabsList>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pending Review ({pendingSubmissions.length})
        </TabsTrigger>
        <TabsTrigger value="reviewed" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Reviewed ({reviewedSubmissions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingSubmissions.length > 0 ? (
          <div className="grid gap-4">
            {pendingSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                You have no pending submissions to review. Great job staying on
                top of your feedback!
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="reviewed" className="space-y-4">
        {reviewedSubmissions.length > 0 ? (
          <div className="grid gap-4">
            {reviewedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileAudio className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No reviewed submissions</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                Submissions you review will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
