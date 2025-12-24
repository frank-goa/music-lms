"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Music,
  Clock,
  ClipboardCheck,
  Mail,
  MoreHorizontal,
  Copy,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cancelInvite } from "./actions";

interface StudentWithProfile {
  id: string;
  user_id: string;
  instrument: string | null;
  skill_level: "beginner" | "intermediate" | "advanced" | null;
  notes: string | null;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  stats: {
    assignmentsCompleted: number;
    totalAssignments: number;
    weeklyPracticeMinutes: number;
  };
}

interface PendingInvite {
  id: string;
  email: string | null;
  token: string;
  expires_at: string;
  created_at: string;
}

interface StudentListProps {
  students: StudentWithProfile[];
  pendingInvites: PendingInvite[];
}

const skillLevelColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  advanced:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

function StudentCard({ student }: { student: StudentWithProfile }) {
  const initials = student.user.full_name
    ? student.user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : student.user.email[0].toUpperCase();

  const hours = Math.floor(student.stats.weeklyPracticeMinutes / 60);
  const minutes = student.stats.weeklyPracticeMinutes % 60;

  return (
    <Link href={`/dashboard/students/${student.user_id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={student.user.avatar_url || undefined}
                alt={student.user.full_name || ""}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold truncate">
                  {student.user.full_name || "Unnamed Student"}
                </h3>
                {student.skill_level && (
                  <Badge
                    variant="secondary"
                    className={skillLevelColors[student.skill_level]}
                  >
                    {student.skill_level}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {student.user.email}
              </p>
              {student.instrument && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <Music className="h-3 w-3" />
                  <span>{student.instrument}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium">
                  {student.stats.assignmentsCompleted}
                </span>
                <span className="text-muted-foreground">
                  /{student.stats.totalAssignments} done
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium">
                  {hours > 0 ? `${hours}h ` : ""}
                  {minutes}m
                </span>
                <span className="text-muted-foreground"> /wk</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PendingInviteCard({ invite }: { invite: PendingInvite }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const expiresAt = new Date(invite.expires_at);
  const isExpiringSoon =
    expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  async function handleCopyLink() {
    const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard");
  }

  async function handleCancelInvite() {
    setIsCancelling(true);
    try {
      const result = await cancelInvite(invite.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Invite cancelled");
      }
    } catch {
      toast.error("Failed to cancel invite");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{invite.email || "No email"}</p>
              <p className="text-sm text-muted-foreground">
                Expires{" "}
                {expiresAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {isExpiringSoon && (
                <Badge variant="destructive" className="mt-1">
                  Expiring soon
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy invite link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCancelInvite}
                disabled={isCancelling}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel invite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentList({ students, pendingInvites }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [instrumentFilter, setInstrumentFilter] = useState<string>("all");

  // Get unique instruments from students
  const instruments = Array.from(
    new Set(students.map((s) => s.instrument).filter(Boolean))
  ) as string[];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === "" ||
      student.user.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.instrument?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      skillFilter === "all" || student.skill_level === skillFilter;

    const matchesInstrument =
      instrumentFilter === "all" || student.instrument === instrumentFilter;

    return matchesSearch && matchesSkill && matchesInstrument;
  });

  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList>
        <TabsTrigger value="active">
          Active Students ({students.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending Invites ({pendingInvites.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {instruments.length > 0 && (
            <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All instruments</SelectItem>
                {instruments.map((instrument) => (
                  <SelectItem key={instrument} value={instrument}>
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Student Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : students.length > 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No students found</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                No students match your current filters. Try adjusting your
                search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No students yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                Start building your studio by inviting your first student.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        {pendingInvites.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvites.map((invite) => (
              <PendingInviteCard key={invite.id} invite={invite} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No pending invites</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                All your invites have been accepted or have expired.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
