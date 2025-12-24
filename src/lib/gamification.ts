import { differenceInDays, parseISO, startOfDay } from 'date-fns';

interface PracticeLog {
  date: string; // ISO date string
}

export function calculateStreak(logs: PracticeLog[]): number {
  if (!logs || logs.length === 0) return 0;

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique dates (normalized to YYYY-MM-DD)
  const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date.split('T')[0])));
  
  if (uniqueDates.length === 0) return 0;

  const today = startOfDay(new Date());
  const lastPracticeDate = startOfDay(parseISO(uniqueDates[0]));

  // If last practice was before yesterday, streak is broken (unless it's today)
  const daysSinceLastPractice = differenceInDays(today, lastPracticeDate);
  if (daysSinceLastPractice > 1) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = startOfDay(parseISO(uniqueDates[i]));
    const prev = startOfDay(parseISO(uniqueDates[i + 1]));
    
    if (differenceInDays(current, prev) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
