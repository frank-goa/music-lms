'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, UserPlus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { seedAssignments, seedInvites } from './actions';

export default function SeederPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSeedAssignments() {
    setLoading('assignments');
    try {
      const result = await seedAssignments();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Success! Created ${result.count} assignments.`);
      }
    } catch {
      toast.error('Failed to seed assignments');
    } finally {
      setLoading(null);
    }
  }

  async function handleSeedInvites() {
    setLoading('invites');
    try {
      const result = await seedInvites();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Success! Created ${result.count} dummy invites.`);
      }
    } catch {
      toast.error('Failed to seed invites');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Data Seeder
        </h1>
        <p className="text-muted-foreground">
          Use these tools to populate your database with test data. 
          <br />
          <span className="text-yellow-600 font-medium">Warning: This creates real records in your production database.</span>
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>
              Create 5 random assignments linked to your teacher account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedAssignments} 
              disabled={!!loading}
              className="w-full sm:w-auto"
            >
              {loading === 'assignments' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FileText className="mr-2 h-4 w-4" />
              Generate 5 Assignments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Invites</CardTitle>
            <CardDescription>
              Create 3 pending invites for dummy emails (e.g., student123@example.com).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedInvites} 
              disabled={!!loading}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {loading === 'invites' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <UserPlus className="mr-2 h-4 w-4" />
              Generate 3 Invites
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
