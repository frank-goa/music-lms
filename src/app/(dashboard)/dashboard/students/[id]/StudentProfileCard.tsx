"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Save, X, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateStudentNotes, removeStudent } from "../actions";

interface StudentProfileCardProps {
  profile: {
    id: string;
    user_id: string;
    instrument: string | null;
    skill_level: "beginner" | "intermediate" | "advanced" | null;
    notes: string | null;
    created_at: string;
  };
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  };
}

export function StudentProfileCard({ profile, user }: StudentProfileCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(profile.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleSaveNotes() {
    setIsSaving(true);
    try {
      const result = await updateStudentNotes(profile.user_id, notes);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Notes updated");
        setIsEditing(false);
      }
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveStudent() {
    setIsRemoving(true);
    try {
      const result = await removeStudent(profile.user_id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student removed from studio");
        router.push("/dashboard/students");
      }
    } catch {
      toast.error("Failed to remove student");
    } finally {
      setIsRemoving(false);
    }
  }

  const joinDate = new Date(profile.created_at);
  const accountDate = new Date(user.created_at);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile & Notes</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNotes(profile.notes || "");
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Joined studio:</span>
            <span>
              {joinDate.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Account created:</span>
            <span>
              {accountDate.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Teacher Notes</label>
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this student..."
              className="min-h-24"
            />
          ) : (
            <p className="text-sm text-muted-foreground min-h-24 p-3 border rounded-md bg-muted/30">
              {profile.notes || "No notes yet. Click edit to add notes about this student."}
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from Studio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Student</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {user.full_name || user.email} from
                  your studio? This will remove their association with you but will
                  not delete their account. They will lose access to your assignments
                  and practice history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveStudent}
                  disabled={isRemoving}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isRemoving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Remove Student
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
