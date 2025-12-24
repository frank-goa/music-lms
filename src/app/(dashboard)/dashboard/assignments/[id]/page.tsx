import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Clock } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubmitAssignmentDialog } from './SubmitAssignmentDialog';
import { EditAssignmentDialog } from './EditAssignmentDialog';
import { DeleteAssignmentDialog } from './DeleteAssignmentDialog';
import { ResourcesList } from './ResourcesList';
import { getAssignmentResources } from './actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch Assignment Details
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !assignment) {
    notFound();
  }

  // Ensure teacher owns this assignment OR student is assigned
  const isTeacher = assignment.teacher_id === user.id;

  if (!isTeacher) {
    const { data: link } = await supabase
      .from('assignment_students')
      .select('id')
      .eq('assignment_id', id)
      .eq('student_id', user.id)
      .single();

    if (!link) {
      redirect('/dashboard/assignments');
    }
  }

  // 2. Fetch Assigned Students (Only for teacher)
  interface AssignedStudent {
    status: string;
    student_id: string;
    users: { full_name: string | null; email: string } | { full_name: string | null; email: string }[];
  }
  let assignedStudents: AssignedStudent[] = [];
  if (isTeacher) {
    const { data } = await supabase
      .from('assignment_students')
      .select(`
        status,
        student_id,
        users (
          full_name,
          email
        )
      `)
      .eq('assignment_id', assignment.id);
    assignedStudents = data || [];
  }

  // 3. Fetch Submissions
  // Teacher sees all, Student sees their own
  let submissionsQuery = supabase
    .from('submissions')
    .select('student_id, submitted_at, id')
    .eq('assignment_id', assignment.id);
  
  if (!isTeacher) {
    submissionsQuery = submissionsQuery.eq('student_id', user.id);
  }

  const { data: submissions } = await submissionsQuery;

  // 4. Fetch Resources
  const resources = await getAssignmentResources(assignment.id);

  // Merge data (Teacher View)
  const studentRows = isTeacher ? (assignedStudents || []).map((record) => {
    // Handle potential array from join
    const studentUser = Array.isArray(record.users) ? record.users[0] : record.users;
    const submission = submissions?.find((s) => s.student_id === record.student_id);

    return {
      studentId: record.student_id,
      name: studentUser?.full_name || studentUser?.email || 'Unknown',
      status: record.status,
      submittedAt: submission?.submitted_at,
      submissionId: submission?.id,
    };
  }) : [];

  // Student specific data
  const mySubmission = !isTeacher && submissions && submissions.length > 0 ? submissions[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/assignments"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignments
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                </span>
              </div>
              {isTeacher && (
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span className="text-sm">{studentRows.length} Assigned</span>
                </div>
              )}
            </div>
          </div>
          {isTeacher && (
            <div className="flex items-center gap-2">
              <EditAssignmentDialog assignment={assignment} />
              <DeleteAssignmentDialog
                assignmentId={assignment.id}
                assignmentTitle={assignment.title}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Assignment Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {assignment.description || 'No description provided.'}
            </p>
          </CardContent>
        </Card>

        {/* Stats Card (Teacher) or Status Card (Student) */}
        {isTeacher ? (
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {studentRows.filter(s => s.status === 'pending').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Submitted</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {studentRows.filter(s => s.status === 'submitted').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reviewed</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {studentRows.filter(s => s.status === 'reviewed').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                 {mySubmission ? (
                   <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200 text-center">
                     <p className="font-medium">Submitted</p>
                     <p className="text-xs mt-1">{new Date(mySubmission.submitted_at).toLocaleDateString()}</p>
                   </div>
                 ) : (
                   <div className="p-4 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200 text-center">
                     <p className="font-medium">Pending</p>
                     <p className="text-xs mt-1">Not submitted yet</p>
                   </div>
                 )}
                 {!mySubmission && (
                   <SubmitAssignmentDialog assignmentId={assignment.id} />
                 )}
                 {mySubmission && (
                   <Button className="w-full" variant="outline" asChild>
                     <Link href={`/dashboard/submissions/${mySubmission.id}`}>
                       View Submission
                     </Link>
                   </Button>
                 )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resources Section */}
      <ResourcesList resources={resources} />

      {/* Student Progress Table (Teacher Only) */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
            <CardDescription>
              Track submissions and status for each student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No students assigned to this task.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentRows.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        {row.submittedAt ? (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(row.submittedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.submissionId ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/submissions/${row.submissionId}`}>
                              View Submission
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No submission</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
    submitted: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
    reviewed: 'bg-green-100 text-green-800 hover:bg-green-100/80',
  };

  const labels = {
    pending: 'Pending',
    submitted: 'Submitted',
    reviewed: 'Reviewed',
  };

  const style = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  const label = labels[status as keyof typeof labels] || status;

  return (
    <Badge variant="secondary" className={style}>
      {label}
    </Badge>
  );
}