'use client';

import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

export interface StudentAssignment {
  id: string; // Assignment ID
  title: string;
  due_date: string | null;
  status: 'pending' | 'submitted' | 'reviewed';
  teacher_name: string;
}

interface StudentAssignmentListProps {
  assignments: StudentAssignment[];
}

export function StudentAssignmentList({ assignments }: StudentAssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No assignments yet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          You don&apos;t have any pending assignments. Enjoy your practice!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                <Link 
                  href={`/dashboard/assignments/${assignment.id}`}
                  className="hover:underline"
                >
                  {assignment.title}
                </Link>
              </TableCell>
              <TableCell>{assignment.teacher_name}</TableCell>
              <TableCell>
                <StatusBadge status={assignment.status} />
              </TableCell>
              <TableCell>
                {assignment.due_date ? (
                  <span className={new Date(assignment.due_date) < new Date() && assignment.status === 'pending' ? "text-red-500 font-medium" : ""}>
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/dashboard/assignments/${assignment.id}`}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'Pending', icon: AlertCircle, style: 'bg-yellow-100 text-yellow-800' },
    submitted: { label: 'Submitted', icon: CheckCircle, style: 'bg-blue-100 text-blue-800' },
    reviewed: { label: 'Reviewed', icon: CheckCircle, style: 'bg-green-100 text-green-800' },
  };

  const { label, icon: Icon, style } = config[status as keyof typeof config] || config.pending;

  return (
    <Badge variant="secondary" className={`flex w-fit items-center gap-1 ${style}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
