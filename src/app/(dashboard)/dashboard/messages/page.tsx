import { getConversations } from './actions';
import { ChatLayout } from './ChatLayout';

export default async function MessagesPage() {
  const { contacts, userId } = await getConversations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Chat with your students and teachers.
        </p>
      </div>

      <ChatLayout contacts={contacts} currentUser={userId} />
    </div>
  );
}
