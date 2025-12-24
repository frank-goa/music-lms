"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Loader2 } from "lucide-react";
import { toast } from "sonner";

const instruments = [
  "Piano",
  "Guitar",
  "Violin",
  "Viola",
  "Cello",
  "Voice",
  "Flute",
  "Clarinet",
  "Saxophone",
  "Trumpet",
  "Trombone",
  "Drums",
  "Bass",
  "Ukulele",
  "Other",
];

const skillLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

interface InviteData {
  id: string;
  teacher_id: string;
  email: string | null;
  expires_at: string;
  teacher?: {
    full_name: string | null;
  };
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instrument, setInstrument] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; role?: string } | null>(null);

  useEffect(() => {
    async function checkSessionAndValidate() {
      const supabase = createClient();

      // Check for existing session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch role
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        
        setCurrentUser({ 
          email: user.email || "Unknown", 
          role: userData?.role 
        });
        setIsValidating(false);
        return; // Stop here, don't validate token yet or show form
      }

      // First get the invite
      const { data: inviteResult, error: inviteError } = await supabase
        .from("invites")
        .select("id, teacher_id, email, expires_at")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (inviteError || !inviteResult) {
        setError("This invite link is invalid or has expired.");
        setIsValidating(false);
        return;
      }

      // Type assertion for the invite result
      const invite = inviteResult as {
        id: string;
        teacher_id: string;
        email: string | null;
        expires_at: string;
      };

      // Get teacher info
      const { data: teacherResult } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", invite.teacher_id)
        .single();

      const inviteData: InviteData = {
        id: invite.id,
        teacher_id: invite.teacher_id,
        email: invite.email,
        expires_at: invite.expires_at,
        teacher: (teacherResult as { full_name: string | null } | null) || undefined,
      };
      setInvite(inviteData);
      if (invite.email) {
        setEmail(invite.email);
      }
      setIsValidating(false);
    }

    checkSessionAndValidate();
  }, [token]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    window.location.reload(); // Reload to re-trigger validation
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!invite) return;

    setIsLoading(true);

    try {
      const { acceptInvite } = await import("./actions");

      const result = await acceptInvite({
        token,
        email,
        password,
        fullName,
        instrument,
        skillLevel: skillLevel as "beginner" | "intermediate" | "advanced",
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Account created! Please log in to continue.");
      router.push("/login");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MusicLMS</span>
            </Link>
            <CardTitle className="text-2xl">Already Logged In</CardTitle>
            <CardDescription>
              You are currently logged in as <span className="font-medium text-foreground">{currentUser.email}</span>
              {currentUser.role && <span className="capitalize"> ({currentUser.role})</span>}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              To accept this student invite, you must create a new student account. Please log out first.
            </p>
            <div className="grid gap-2">
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                Log Out & Accept Invite
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MusicLMS</span>
            </Link>
            <CardTitle className="text-2xl">Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please ask your teacher for a new invite link.
            </p>
            <Link href="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MusicLMS</span>
          </Link>
          <CardTitle className="text-2xl">Join as a Student</CardTitle>
          <CardDescription>
            {invite?.teacher?.full_name
              ? `${invite.teacher.full_name} has invited you to join their studio`
              : "You've been invited to join a music studio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!invite?.email}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instrument">Primary Instrument</Label>
              <Select value={instrument} onValueChange={setInstrument} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your instrument" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((inst) => (
                    <SelectItem key={inst} value={inst.toLowerCase()}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
