'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getMessages, sendMessage } from './actions';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface ChatWindowProps {
  currentUser: string;
  contact: User;
  initialMessages: Message[];
}

export function ChatWindow({ currentUser, contact, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser}`, 
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === contact.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, contact.id, supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    
    // Optimistic update
    const tempId = Math.random().toString();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser,
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');

    const result = await sendMessage(contact.id, optimisticMsg.content);
    
    if (result.error) {
      toast.error('Failed to send message');
      // Revert optimistic update (simplified)
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
    
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar>
          <AvatarImage src={contact.avatar_url || undefined} />
          <AvatarFallback>{contact.full_name?.[0] || contact.email[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{contact.full_name || contact.email}</div>
          <div className="text-xs text-muted-foreground">Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                isMe
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {msg.content}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
