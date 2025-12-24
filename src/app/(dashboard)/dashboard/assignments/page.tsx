import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTeacherAssignments, getStudentAssignments } from './actions';
import { getMyStudents } from '../schedule/actions';
import { getResources } from '../library/actions';
import { AssignmentList } from './AssignmentList';
import { StudentAssignmentList } from './StudentAssignmentList';
import { CreateAssignmentDialog } from './CreateAssignmentDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  const isTeacher = user?.role === 'teacher';

  if (isTeacher) {
    const [assignments, students, resources] = await Promise.all([
      getTeacherAssignments(),
      getMyStudents(),
      getResources(),
    ]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">
              Create and manage practice assignments for your students.
            </p>
          </div>
          <CreateAssignmentDialog
            students={students as any}
            resources={resources as any}
          />
        </div>

        <Suspense fallback={<AssignmentsSkeleton />}>
          <AssignmentList assignments={assignments} />
        </Suspense>
      </div>
    );
  }

  // Student view
  const assignments = await getStudentAssignments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
        <p className="text-muted-foreground">
          View and complete your practice assignments.
        </p>
      </div>

      <Suspense fallback={<AssignmentsSkeleton />}>
        <StudentAssignmentList assignments={assignments} />
      </Suspense>
    </div>
  );
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}