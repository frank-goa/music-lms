import { Suspense } from 'react';
import { getStudentPracticeLogs } from './actions';
import { LogPracticeDialog } from './LogPracticeDialog';
import { PracticeLogList } from './PracticeLogList';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PracticePage() {
  const logs = await getStudentPracticeLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Log</h1>
          <p className="text-muted-foreground">
            Track your daily practice sessions and progress.
          </p>
        </div>
        <LogPracticeDialog />
      </div>

      <Suspense fallback={<PracticeListSkeleton />}>
        <PracticeLogList logs={logs} />
      </Suspense>
    </div>
  );
}

function PracticeListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
