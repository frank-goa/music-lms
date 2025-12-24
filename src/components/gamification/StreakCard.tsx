import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{streak} Days</div>
        <p className="text-xs text-muted-foreground">
          {streak > 0 ? "Keep it burning!" : "Practice today to start a streak!"}
        </p>
      </CardContent>
    </Card>
  );
}
