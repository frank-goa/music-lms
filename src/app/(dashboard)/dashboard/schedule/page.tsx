import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getLessons, getMyStudents } from './actions';
import { WeeklyCalendar } from './WeeklyCalendar';
import { CreateLessonDialog } from './CreateLessonDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isTeacher = profile?.role === 'teacher';
  
  const [lessons, students] = await Promise.all([
    getLessons(),
    isTeacher ? getMyStudents() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            Manage your lessons and upcoming events. Click on a day to schedule.
          </p>
        </div>
      </div>

      <Suspense fallback={<CalendarSkeleton />}>
        <WeeklyCalendar lessons={lessons} students={students} isTeacher={isTeacher} />
      </Suspense>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px border rounded-lg overflow-hidden h-[500px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-background p-3 border-r last:border-r-0">
            <div className="flex flex-col items-center gap-2 mb-4">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
