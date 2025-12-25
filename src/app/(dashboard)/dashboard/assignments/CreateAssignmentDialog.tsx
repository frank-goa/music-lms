'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, FileText, FileAudio, FileVideo, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createAssignment } from './actions';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  studentIds: z.array(z.string()).min(1, 'Select at least one student'),
  resourceIds: z.array(z.string()).optional(),
});

interface Student {
  id: string;
  full_name: string | null;
  email?: string | null;
}

interface Resource {
  id: string;
  title: string;
  file_type: string;
}

interface CreateAssignmentDialogProps {
  students: Student[];
  resources: Resource[];
}

function ResourceIcon({ type }: { type: string }) {
  if (type.startsWith('audio')) return <FileAudio className="h-4 w-4 text-blue-500" />;
  if (type.startsWith('video')) return <FileVideo className="h-4 w-4 text-purple-500" />;
  return <FileText className="h-4 w-4 text-gray-500" />;
}

export function CreateAssignmentDialog({ students, resources }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      studentIds: [],
      resourceIds: [],
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createAssignment(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Assignment created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    }
  }

  const handleToggle = (field: 'studentIds' | 'resourceIds', id: string, checked: boolean) => {
    const current = form.getValues(field) || [];
    if (checked) {
      form.setValue(field, [...current, id]);
    } else {
      form.setValue(
        field,
        current.filter((itemId) => itemId !== id)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>
            Create a new assignment and attach resources from your library.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Major Scales Practice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instructions for the student..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Assign to Students</FormLabel>
                    <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                      {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No students found.
                        </p>
                      ) : (
                        students.map((student) => (
                          <div key={student.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              onChange={(e) => handleToggle('studentIds', student.id, e.target.checked)}
                            />
                            <label
                              htmlFor={`student-${student.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {student.full_name || 'Unnamed Student'}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resourceIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Attach Resources</FormLabel>
                    <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                      {resources.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Library is empty.
                        </p>
                      ) : (
                        resources.map((resource) => (
                          <div key={resource.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`resource-${resource.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              onChange={(e) => handleToggle('resourceIds', resource.id, e.target.checked)}
                            />
                            <label
                              htmlFor={`resource-${resource.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 truncate"
                            >
                              <ResourceIcon type={resource.file_type} />
                              <span className="truncate max-w-[120px]">{resource.title}</span>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Assignment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}