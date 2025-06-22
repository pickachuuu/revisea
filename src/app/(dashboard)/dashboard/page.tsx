import { Metadata } from 'next';
import DashboardStats from '@/component/features/DashboardStats';
import RecentActivity from '@/component/features/RecentActivity';
import QuickActions from '@/component/features/QuickActions';
import DashboardHeader from '@/component/features/DashboardHeader';

export const metadata: Metadata = {
  title: 'Dashboard | Stendhal',
  description: 'Your learning dashboard - track progress, manage notes, and review flashcards',
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardStats />
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}