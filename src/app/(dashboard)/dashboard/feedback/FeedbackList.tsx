'use client';

import { format } from 'date-fns';
import { Star, FileAudio, FileVideo, FileText, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FeedbackItem {
  id: string;
  file_url: string;
  file_type: string;
  notes: string | null;
  submitted_at: string;
  assignments: {
    title: string;
    due_date: string | null;
  } | null;
  feedback: {
    rating: number | null;
    content: string;
    created_at: string;
  }[];
}

interface FeedbackListProps {
  items: FeedbackItem[];
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('audio')) return <FileAudio className="h-5 w-5 text-blue-500" />;
  if (type.startsWith('video')) return <FileVideo className="h-5 w-5 text-purple-500" />;
  return <FileText className="h-5 w-5 text-gray-500" />;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function FeedbackList({ items }: FeedbackListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No submissions found.</p>
        <p className="text-sm text-muted-foreground">
          Complete assignments to receive feedback from your teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const feedback = item.feedback && item.feedback.length > 0 ? item.feedback[0] : null;

        return (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{item.assignments?.title || 'Untitled Assignment'}</CardTitle>
                    {feedback ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending Review</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted {format(new Date(item.submitted_at), 'MMM d, yyyy')}
                    </span>
                    {item.assignments?.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {format(new Date(item.assignments.due_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Submission Details */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">Your Submission</div>
                  <div className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
                    <FileIcon type={item.file_type} />
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {item.file_url.split('/').pop()}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground italic">"{item.notes}"</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback Details */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">Teacher Feedback</div>
                  {feedback ? (
                    <div className="rounded-lg border p-4 bg-muted/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <StarRating rating={feedback.rating || 0} />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed">
                        {feedback.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[100px] rounded-lg border border-dashed text-sm text-muted-foreground">
                      Waiting for teacher feedback...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
