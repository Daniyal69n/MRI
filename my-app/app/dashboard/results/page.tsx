'use client';

import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ResultCard } from '@/components/dashboard/ResultCard';
import { BarChart3 } from 'lucide-react';

export default function ResultsPage() {
  const results = [
    {
      id: 1,
      patientId: 'Patient #001',
      date: '2025-11-20',
      status: 'Completed' as const,
      metrics: {
        dice: 0.94,
        iou: 0.89,
        accuracy: 0.96,
        f1: 0.93,
      },
      volumes: {
        grayMatter: 45.2,
        whiteMatter: 38.7,
        csf: 16.1,
      },
    },
    {
      id: 2,
      patientId: 'Patient #002',
      date: '2025-11-19',
      status: 'Completed' as const,
      metrics: {
        dice: 0.91,
        iou: 0.85,
        accuracy: 0.94,
        f1: 0.90,
      },
      volumes: {
        grayMatter: 42.8,
        whiteMatter: 40.1,
        csf: 17.1,
      },
    },
    {
      id: 3,
      patientId: 'Patient #003',
      date: '2025-11-19',
      status: 'Processing' as const,
      metrics: null,
      volumes: null,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Analysis Results"
        description="View volumetric analysis results and performance metrics"
        icon={BarChart3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            id={result.id}
            patientId={result.patientId}
            date={result.date}
            status={result.status}
            metrics={result.metrics || undefined}
            volumes={result.volumes || undefined}
          />
        ))}
      </div>

      {/* Summary Statistics */}
      <Card title="Summary Statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">94.2%</p>
            <p className="text-sm text-gray-600 mt-1">Average Dice Score</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">89.5%</p>
            <p className="text-sm text-gray-600 mt-1">Average IoU</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">95.8%</p>
            <p className="text-sm text-gray-600 mt-1">Average Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">92.1%</p>
            <p className="text-sm text-gray-600 mt-1">Average F1-Score</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

