'use client';

import DashboardStats from '@/component/features/DashboardStats';
import RecentActivity from '@/component/features/RecentActivity';
import QuickActions from '@/component/features/QuickActions';
import DashboardHeader from '@/component/features/DashboardHeader';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '@/hook/useAuthActions';

export default function Dashboard() {
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    // Try to load user from localStorage first
    const cached = localStorage.getItem('dashboardUser');
    if (cached) {
      setUser(JSON.parse(cached));
    }
    // Always fetch in background to update localStorage
    getCurrentUserProfile().then((profile) => {
      if (profile) {
        setUser(profile);
        localStorage.setItem('dashboardUser', JSON.stringify(profile));
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardStats />
          <RecentActivity />
        </div>
        <div className="space-y-6 mt-12">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}