import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';
import { Download, Eye } from 'lucide-react';

interface ResultCardProps {
  id: number;
  patientId: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Pending' | 'Failed';
  metrics?: {
    dice: number;
    iou: number;
    accuracy: number;
    f1: number;
  };
  volumes?: {
    grayMatter: number;
    whiteMatter: number;
    csf: number;
  };
}

export const ResultCard: React.FC<ResultCardProps> = ({
  id,
  patientId,
  date,
  status,
  metrics,
  volumes,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{patientId}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{date}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {status === 'Completed' && volumes && (
          <>
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <VolumeBar label="Gray Matter" value={volumes.grayMatter} color="bg-blue-600" />
              <VolumeBar label="White Matter" value={volumes.whiteMatter} color="bg-green-600" />
              <VolumeBar label="CSF" value={volumes.csf} color="bg-purple-600" />
            </div>

            {metrics && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <MetricItem label="Dice Score" value={metrics.dice} />
                  <MetricItem label="IoU" value={metrics.iou} />
                  <MetricItem label="Accuracy" value={metrics.accuracy} />
                  <MetricItem label="F1-Score" value={metrics.f1} />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Link href={`/dashboard/results/${id}`} className="flex-1 min-w-0">
                <Button variant="primary" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {status === 'Processing' && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Processing in progress...</p>
          </div>
        )}
      </div>
    </Card>
  );
};

interface VolumeBarProps {
  label: string;
  value: number;
  color: string;
}

const VolumeBar: React.FC<VolumeBarProps> = ({ label, value, color }) => {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

interface MetricItemProps {
  label: string;
  value: number;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">
        {(value * 100).toFixed(1)}%
      </p>
    </div>
  );
};

