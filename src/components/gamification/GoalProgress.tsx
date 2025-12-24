import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GoalProgressProps {
  current: number;
  target: number;
}

export function GoalProgress({ current, target }: GoalProgressProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-baseline">
          <div className="text-2xl font-bold">{current}m</div>
          <div className="text-xs text-muted-foreground">/ {target}m</div>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {percentage >= 100 
            ? "Goal reached! Great job! 🎉" 
            : `${target - current} minutes to go`}
        </p>
      </CardContent>
    </Card>
  );
}
