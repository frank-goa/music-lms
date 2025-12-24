'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatWindow } from './ChatWindow';
import { getMessages } from './actions';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface ChatLayoutProps {
  contacts: User[];
  currentUser: string;
}

export function ChatLayout({ contacts, currentUser }: ChatLayoutProps) {
  const [selectedContact, setSelectedContact] = useState<User | null>(contacts.length > 0 ? contacts[0] : null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load messages when contact changes
  const handleSelectContact = async (contact: User) => {
    setSelectedContact(contact);
    setLoading(true);
    const msgs = await getMessages(contact.id);
    setMessages(msgs);
    setLoading(false);
  };

  // Initial load
  useState(() => {
    if (selectedContact) {
      handleSelectContact(selectedContact);
    }
  });

  return (
    <div className="grid md:grid-cols-[300px_1fr] h-[600px] gap-4">
      {/* Sidebar */}
      <div className="border rounded-lg bg-muted/10 p-2 overflow-y-auto">
        <h3 className="font-semibold px-4 py-2 text-sm text-muted-foreground">Contacts</h3>
        <div className="space-y-1">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors",
                selectedContact?.id === contact.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={contact.avatar_url || undefined} />
                <AvatarFallback>{contact.full_name?.[0] || contact.email[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left overflow-hidden">
                <div className="font-medium truncate">{contact.full_name || contact.email}</div>
              </div>
            </button>
          ))}
          {contacts.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No contacts found.
            </div>
          )}
        </div>
      </div>

      {/* Main Window */}
      <div>
        {selectedContact ? (
          loading ? (
            <div className="h-full flex items-center justify-center border rounded-lg">
              Loading...
            </div>
          ) : (
            <ChatWindow 
              key={selectedContact.id} // Force re-mount on change
              currentUser={currentUser}
              contact={selectedContact}
              initialMessages={messages}
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center border rounded-lg text-muted-foreground">
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
