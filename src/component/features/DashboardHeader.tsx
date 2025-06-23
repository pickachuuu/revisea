'use client';

import { format } from 'date-fns';

export default function DashboardHeader({ user }: { user?: { full_name?: string; email?: string } | null }) {
  const currentDate = new Date();
  const greeting = getGreeting();
  
  function getGreeting() {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div className="space-y-2">
      <h1 className="text-4xl font-bold text-foreground">
        {greeting}
        {user?.full_name ? `, ${user.full_name}` : user?.email ? `, ${user.email}` : ''}
      </h1>
      <p className="text-foreground-muted text-lg">
        {format(currentDate, 'EEEE, MMMM do, yyyy')}
      </p>
      <p className="text-foreground-muted">
        Ready to continue your learning journey?
      </p>
    </div>
  );
} 