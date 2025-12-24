"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Assignment {
  id: string;
  status: "pending" | "submitted" | "reviewed";
  created_at: string;
  assignment_id: string;
  title: string;
  due_date: string | null;
}

interface AssignmentHistoryProps {
  assignments: Assignment[];
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "outline" as const,
    className: "text-yellow-600 border-yellow-600",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    variant: "secondary" as const,
    className: "text-blue-600 bg-blue-100 dark:bg-blue-900",
  },
  reviewed: {
    label: "Reviewed",
    icon: CheckCircle2,
    variant: "default" as const,
    className: "bg-green-600",
  },
};

export function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No assignments yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-1">
            This student hasn&apos;t been assigned any work yet. Create an assignment
            and assign it to this student.
          </p>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment History</CardTitle>
        <CardDescription>
          All assignments for this student
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const status = statusConfig[assignment.status];
              const StatusIcon = status.icon;
              const dueDate = assignment.due_date
                ? new Date(assignment.due_date)
                : null;
              const isOverdue =
                dueDate &&
                dueDate < now &&
                assignment.status === "pending";

              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.title}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.created_at).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    {dueDate ? (
                      <div className="flex items-center gap-2">
                        <span>
                          {dueDate.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {isOverdue && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No due date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className={status.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
