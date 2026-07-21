'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, BarChart3, FileText, Activity, Loader2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionButton } from '@/components/dashboard/QuickActionButton';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);

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

  // Fetch recent analyses on component mount
  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      try {
        setIsLoadingAnalyses(true);
        const response = await fetch('/api/patients');
        if (!response.ok) throw new Error('Failed to fetch patients');

        const data = await response.json();
        const patients = data.patients || [];

        // Transform patients with their latest analysis results
        const analysesData = patients
          .filter((patient: any) => patient.analysisHistory && patient.analysisHistory.length > 0)
          .map((patient: any) => {
            const latestAnalysis = patient.analysisHistory[0]; // First one is most recent (sorted by visitDate: -1)
            return {
              id: patient._id,
              patientId: patient.patientId,
              patient: `${patient.firstName} ${patient.lastName}`,
              date: latestAnalysis.visitDate 
                ? new Date(latestAnalysis.visitDate).toISOString().split('T')[0]
                : new Date(patient.createdAt || new Date()).toISOString().split('T')[0],
              status: latestAnalysis?.status === 'completed' ? 'Completed' : latestAnalysis?.status || 'Processing',
              gm: latestAnalysis?.gm_percent !== undefined && latestAnalysis?.gm_percent !== null 
                ? `${latestAnalysis.gm_percent.toFixed(2)}%` 
                : '-',
              wm: latestAnalysis?.wm_percent !== undefined && latestAnalysis?.wm_percent !== null 
                ? `${latestAnalysis.wm_percent.toFixed(2)}%` 
                : '-',
              csf: latestAnalysis?.csf_percent !== undefined && latestAnalysis?.csf_percent !== null 
                ? `${latestAnalysis.csf_percent.toFixed(2)}%` 
                : '-',
            };
          })
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3); // Take only first 3 most recent

        setRecentAnalyses(analysesData);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        setRecentAnalyses([]);
      } finally {
        setIsLoadingAnalyses(false);
      }
    };

    if (showContent) {
      fetchRecentAnalyses();
    }
  }, [showContent]);

  // Listen for external updates (e.g., upload page patched a history)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = async (e: any) => {
      try {
        setIsLoadingAnalyses(true);
        const resp = await fetch('/api/patients');
        if (!resp.ok) throw new Error('Failed to fetch patients');
        const data = await resp.json();
        const patients = data.patients || [];
        const analysesData = patients
          .filter((patient: any) => patient.analysisHistory && patient.analysisHistory.length > 0)
          .map((patient: any) => {
            const latestAnalysis = patient.analysisHistory[0];
            return {
              id: patient._id,
              patientId: patient.patientId,
              patient: `${patient.firstName} ${patient.lastName}`,
              date: latestAnalysis.visitDate ? new Date(latestAnalysis.visitDate).toISOString().split('T')[0] : new Date(patient.createdAt || new Date()).toISOString().split('T')[0],
              status: latestAnalysis?.status === 'completed' ? 'Completed' : latestAnalysis?.status || 'Processing',
              gm: latestAnalysis?.gm_percent !== undefined && latestAnalysis?.gm_percent !== null ? `${latestAnalysis.gm_percent.toFixed(2)}%` : '-',
              wm: latestAnalysis?.wm_percent !== undefined && latestAnalysis?.wm_percent !== null ? `${latestAnalysis.wm_percent.toFixed(2)}%` : '-',
              csf: latestAnalysis?.csf_percent !== undefined && latestAnalysis?.csf_percent !== null ? `${latestAnalysis.csf_percent.toFixed(2)}%` : '-',
            };
          })
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);

        setRecentAnalyses(analysesData);
      } catch (err) {
        console.error('Error refreshing analyses after update event:', err);
      } finally {
        setIsLoadingAnalyses(false);
      }
    };

    // Same-window events
    window.addEventListener('patient-history-updated', handler as EventListener);

    // BroadcastChannel for cross-tab messaging
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('patient-history');
      bc.addEventListener('message', handler as EventListener);
    } catch (e) {
      bc = null;
    }

    // localStorage fallback for older browsers / contexts
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === 'patient-history-updated') {
        handler(ev);
      }
    };
    window.addEventListener('storage', storageHandler as EventListener);

    return () => {
      window.removeEventListener('patient-history-updated', handler as EventListener);
      if (bc) {
        try { bc.removeEventListener('message', handler as EventListener); bc.close(); } catch {};
      }
      window.removeEventListener('storage', storageHandler as EventListener);
    };
  }, []);

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
        icon={Activity}
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
        className="bg-gradient-to-br from-slate-50/80 via-white/50 to-mri-blue/5 border-slate-200/50 backdrop-blur-md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
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
        {isLoadingAnalyses ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading analyses...</span>
          </div>
        ) : recentAnalyses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No analyses found. Start by uploading an MRI image.</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={tableColumns}
              data={recentAnalyses}
              actionButton={{
                label: 'View',
                href: (row) => `/dashboard/patients/${row.id}`,
              }}
            />
            <div className="mt-6 pt-5 border-t border-slate-200/50 flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/patients')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full hover:bg-slate-100/50 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="font-semibold text-slate-700">Explore More Patients</span>
                <ChevronRight className="w-4 h-4 text-mri-blue" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

