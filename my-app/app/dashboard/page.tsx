'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, BarChart3, FileText, Activity, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionButton } from '@/components/dashboard/QuickActionButton';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export default function DashboardPage() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.isAdmin) {
          router.replace('/dashboard/users');
          return;
        }
      } catch {
        // ignore
      }
    }
    setShowContent(true);
  }, [router]);

  // Don't show Overview/Quick Actions until we know user is not admin (avoids flash for admin)
  if (!showContent) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Analyses', 
      value: '24', 
      icon: Activity, 
      color: 'bg-blue-500',
      trend: { value: '+12%', isPositive: true }
    },
    { 
      label: 'Pending Processing', 
      value: '3', 
      icon: Upload, 
      color: 'bg-yellow-500',
      trend: { value: '-2', isPositive: true }
    },
    { 
      label: 'Completed Reports', 
      value: '18', 
      icon: FileText, 
      color: 'bg-green-500',
      trend: { value: '+8%', isPositive: true }
    },
    { 
      label: 'Success Rate', 
      value: '94.2%', 
      icon: BarChart3, 
      color: 'bg-purple-500',
      trend: { value: '+2.1%', isPositive: true }
    },
  ];

  const recentAnalyses = [
    { id: 1, patient: 'Patient #001', date: '2025-11-20', status: 'Completed', gm: '45.2%', wm: '38.7%', csf: '16.1%' },
    { id: 2, patient: 'Patient #002', date: '2025-11-19', status: 'Completed', gm: '42.8%', wm: '40.1%', csf: '17.1%' },
    { id: 3, patient: 'Patient #003', date: '2025-11-19', status: 'Processing', gm: '-', wm: '-', csf: '-' },
  ];

  const tableColumns = [
    { key: 'patient', label: 'Patient ID' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as 'Completed' | 'Processing'} />,
    },
    { key: 'gm', label: 'Gray Matter' },
    { key: 'wm', label: 'White Matter' },
    { key: 'csf', label: 'CSF' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Overview"
        description="Monitor your brain tissue volumetric analysis"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      <Card
        title="Quick Actions"
        subtitle="Access frequently used features"
        className="bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 border-blue-200/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionButton
            href="/dashboard/upload"
            icon={Upload}
            label="Upload MRI Images"
            variant="primary"
          />
          <QuickActionButton
            href="/dashboard/results"
            icon={BarChart3}
            label="View Results"
            variant="outline"
          />
          <QuickActionButton
            href="/dashboard/reports"
            icon={FileText}
            label="Generate Report"
            variant="outline"
          />
        </div>
      </Card>

      <Card 
        title="Recent Analyses"
        subtitle="Latest volumetric analysis results"
      >
        <DataTable
          columns={tableColumns}
          data={recentAnalyses}
          actionButton={{
            label: 'View',
            href: (row) => `/dashboard/results/${row.id}`,
          }}
        />
      </Card>
    </div>
  );
}

