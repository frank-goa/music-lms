"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Clock } from "lucide-react";

interface PracticeLog {
  id: string;
  date: string;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
}

interface PracticeHistoryProps {
  practiceLogs: PracticeLog[];
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function PracticeHistory({ practiceLogs }: PracticeHistoryProps) {
  if (practiceLogs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No practice logs yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-1">
            This student hasn&apos;t logged any practice sessions in the last 30 days.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by week
  const totalMinutes = practiceLogs.reduce(
    (sum, log) => sum + log.duration_minutes,
    0
  );
  const avgPerSession = Math.round(totalMinutes / practiceLogs.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Log</CardTitle>
        <CardDescription>
          Last 30 days: {practiceLogs.length} sessions, {formatDuration(totalMinutes)} total,{" "}
          {formatDuration(avgPerSession)} avg per session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-1/2">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {practiceLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDuration(log.duration_minutes)}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
