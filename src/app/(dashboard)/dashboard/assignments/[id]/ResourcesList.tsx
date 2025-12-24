import { FileText, Music, Video, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Resource {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
}

interface ResourcesListProps {
  resources: Resource[];
}

function getFileIcon(fileType: string) {
  if (fileType.includes('audio') || fileType === 'audio') {
    return <Music className="h-4 w-4" />;
  }
  if (fileType.includes('video') || fileType === 'video') {
    return <Video className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
}

function getFileTypeLabel(fileType: string) {
  if (fileType.includes('audio') || fileType === 'audio') return 'Audio';
  if (fileType.includes('video') || fileType === 'video') return 'Video';
  if (fileType.includes('pdf') || fileType === 'pdf') return 'PDF';
  return fileType;
}

export function ResourcesList({ resources }: ResourcesListProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attached Resources</CardTitle>
        <CardDescription>
          Reference materials for this assignment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {getFileIcon(resource.file_type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {getFileTypeLabel(resource.file_type)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
