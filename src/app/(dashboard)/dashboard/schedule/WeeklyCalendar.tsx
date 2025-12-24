'use client';

import { format, isSameDay, startOfWeek, addDays, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, User, Video, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CreateLessonDialog } from './CreateLessonDialog';
import { LessonDetailDialog } from './LessonDetailDialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Lesson {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  student_id: string;
  student?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[];
  teacher?: { full_name: string | null } | { full_name: string | null }[];
}

interface WeeklyCalendarProps {
  lessons: Lesson[];
  students: any[];
  weekOffset?: number;
  isTeacher?: boolean;
}

export function WeeklyCalendar({ lessons, students, isTeacher = true }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  
  // Get the start of the current view's week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Generate the 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setCurrentDate(date => addDays(date, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(date => addDays(date, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(weekStart, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(currentDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
        {weekDays.map((day) => {
          const dayLessons = lessons.filter((lesson) => 
            isSameDay(parseISO(lesson.start_time), day)
          );

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "min-h-[200px] bg-background p-3 space-y-3 cursor-pointer transition-colors hover:bg-muted/20",
                isToday(day) && "bg-muted/10"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex flex-col items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground font-medium uppercase">
                  {format(day, 'EEE')}
                </span>
                <span className={cn(
                  "text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full mt-1",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-2">
                {dayLessons.length === 0 ? (
                  <div className="flex items-center justify-center h-20 opacity-0 hover:opacity-100 transition-opacity">
                     <Plus className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                ) : (
                  dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="text-xs p-2 rounded-md border bg-card shadow-sm space-y-1 hover:border-primary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLesson(lesson);
                        setLessonDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-1 font-semibold text-primary">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(lesson.start_time), 'h:mm a')}
                      </div>
                      <div className="font-medium truncate">
                        {(Array.isArray(lesson.student) ? lesson.student[0]?.full_name : lesson.student?.full_name) ||
                         (Array.isArray(lesson.teacher) ? lesson.teacher[0]?.full_name : lesson.teacher?.full_name) ||
                         'User'}
                      </div>
                      {lesson.notes && (
                        <div className="text-muted-foreground truncate text-[10px]">
                          {lesson.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateLessonDialog
        students={students}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selectedDate}
      />

      {selectedLesson && (
        <LessonDetailDialog
          lesson={selectedLesson}
          students={students}
          open={lessonDetailOpen}
          onOpenChange={(open) => {
            setLessonDetailOpen(open);
            if (!open) setSelectedLesson(null);
          }}
          isTeacher={isTeacher}
        />
      )}
    </div>
  );
}
