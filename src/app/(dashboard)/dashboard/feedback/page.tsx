import { Suspense } from 'react';
import { getStudentFeedback } from './actions';
import { FeedbackList } from './FeedbackList';
import { Skeleton } from '@/components/ui/skeleton';

export default async function FeedbackPage() {
  const items = await getStudentFeedback();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Feedback</h1>
        <p className="text-muted-foreground">
          View ratings and comments from your teacher on your submissions.
        </p>
      </div>

      <Suspense fallback={<FeedbackSkeleton />}>
        {/* @ts-expect-error - Supabase types are complex, data structure matches */}
        <FeedbackList items={items} />
      </Suspense>
    </div>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
