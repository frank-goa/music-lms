'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Circle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { markAsRead, markAllAsRead } from './notifications-actions';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationBellProps {
  userId: string;
  initialNotifications: Notification[];
}

export function NotificationBell({ userId, initialNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const supabase = createClient();

  useEffect(() => {
    console.log('Subscribing to notifications for user:', userId);
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification received:', payload.new);
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from notifications');
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkRead = async (id: string) => {
    // Remove from UI immediately for better responsiveness
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    await markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-4 cursor-pointer",
                  !n.read_at && "bg-muted/50"
                )}
                onClick={() => handleMarkRead(n.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className="font-medium text-sm">{n.title}</span>
                  {!n.read_at && <Circle className="h-2 w-2 fill-primary text-primary mt-1.5" />}
                </div>
                {n.content && <p className="text-xs text-muted-foreground line-clamp-2">{n.content}</p>}
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
                {n.link && (
                  <Link 
                    href={n.link} 
                    className="absolute inset-0 z-10"
                    onClick={(e) => {
                      if (e.target instanceof HTMLButtonElement) e.preventDefault();
                    }}
                  />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
