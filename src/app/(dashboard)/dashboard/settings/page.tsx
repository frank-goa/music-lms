import { redirect } from 'next/navigation';
import { getUserProfile } from './actions';
import { ProfileForm } from './ProfileForm';
import { PasswordForm } from './PasswordForm';
import { AvatarUpload } from './AvatarUpload';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Calendar, Music } from 'lucide-react';

export default async function SettingsPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email[0].toUpperCase();

  const roleColors = {
    teacher: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <AvatarUpload
                currentAvatarUrl={user.avatarUrl}
                initials={initials}
                userId={user.id}
              />
              <h3 className="mt-4 text-lg font-semibold">
                {user.fullName || 'Unnamed User'}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={`mt-2 ${roleColors[user.role as keyof typeof roleColors]}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              {user.role === 'student' && user.profile?.instrument && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music className="h-4 w-4" />
                  <span>{user.profile.instrument}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialData={{
                  fullName: user.fullName,
                  email: user.email,
                }}
              />
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
