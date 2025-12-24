'use client';

import { format } from 'date-fns';
import { FileAudio, FileText, FileVideo, MoreVertical, Trash, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteResource } from './actions';

interface Resource {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  created_at: string;
}

interface ResourceListProps {
  resources: Resource[];
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('audio')) return <FileAudio className="h-4 w-4 text-blue-500" />;
  if (type.startsWith('video')) return <FileVideo className="h-4 w-4 text-purple-500" />;
  return <FileText className="h-4 w-4 text-gray-500" />;
}

export function ResourceList({ resources }: ResourceListProps) {
  const handleDelete = async (id: string) => {
    const result = await deleteResource(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Resource deleted');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No resources found. Upload your first file!
              </TableCell>
            </TableRow>
          ) : (
            resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <FileIcon type={resource.file_type} />
                </TableCell>
                <TableCell className="font-medium">{resource.title}</TableCell>
                <TableCell className="text-muted-foreground text-xs uppercase">
                  {resource.file_type.split('/')[1] || 'file'}
                </TableCell>
                <TableCell>
                  {format(new Date(resource.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
