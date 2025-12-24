import { Suspense } from 'react';
import { getResources } from './actions';
import { ResourceList } from './ResourceList';
import { UploadResourceDialog } from './UploadResourceDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default async function LibraryPage() {
  const resources = await getResources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Manage your teaching materials, sheet music, and audio tracks.
          </p>
        </div>
        <UploadResourceDialog />
      </div>

      <Suspense fallback={<LibrarySkeleton />}>
        <ResourceList resources={resources} />
      </Suspense>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
