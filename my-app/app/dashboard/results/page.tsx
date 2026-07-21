'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ResultCard } from '@/components/dashboard/ResultCard';
import { BarChart3, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Patient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

interface PatientHistoryRecord {
  _id: string;
  visitDate: string;
  status: string;
  gm_percent?: number;
  wm_percent?: number;
  csf_percent?: number;
}

interface ResultDisplayData {
  id: string;
  patientId: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Pending' | 'Failed';
  volumes?: {
    grayMatter: number;
    whiteMatter: number;
    csf: number;
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ResultDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDynamicResults();
  }, []);

  const loadDynamicResults = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userData);

      // Fetch patients
      const response = await fetch(`/api/patients?uploadedBy=${user.id}`);
      const data = await response.json();

      if (response.ok && data.patients && data.patients.length > 0) {
        // Only take the top 6 most recent patients
        const topPatients = data.patients.slice(0, 6);
        const dynamicResults: ResultDisplayData[] = [];

        for (const patient of topPatients) {
          try {
            // Fetch history for each patient to get their latest analysis
            const histRes = await fetch(`/api/patients/${patient._id}/history`);
            const histData = await histRes.json();
            
            if (histRes.ok && histData.history && histData.history.length > 0) {
              const latestHistory = histData.history[0] as PatientHistoryRecord;
              
              const volumes = (latestHistory.gm_percent && latestHistory.wm_percent && latestHistory.csf_percent) 
                ? {
                    grayMatter: Number(latestHistory.gm_percent.toFixed(1)),
                    whiteMatter: Number(latestHistory.wm_percent.toFixed(1)),
                    csf: Number(latestHistory.csf_percent.toFixed(1))
                  }
                : undefined;

              let status: 'Completed' | 'Processing' | 'Pending' | 'Failed' = 'Pending';
              if (latestHistory.status === 'completed') status = 'Completed';
              else if (latestHistory.status === 'processing') status = 'Processing';
              else if (latestHistory.status === 'failed') status = 'Failed';

              dynamicResults.push({
                id: patient._id,
                patientId: `${patient.firstName} ${patient.lastName} (${patient.patientId})`,
                date: new Date(latestHistory.visitDate).toLocaleDateString(),
                status,
                volumes
              });
            } else {
              // Patient has no history yet
              dynamicResults.push({
                id: patient._id,
                patientId: `${patient.firstName} ${patient.lastName} (${patient.patientId})`,
                date: new Date().toLocaleDateString(),
                status: 'Pending'
              });
            }
          } catch (e) {
            console.error(`Error loading history for ${patient._id}:`, e);
          }
        }
        setResults(dynamicResults);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dynamic results:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Analysis Results"
        description="View volumetric analysis results for your recent patients"
        icon={BarChart3}
      />

      {isLoading ? (
        <Card>
          <div className="text-center py-12 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-mri-blue mb-4" />
            <p className="text-gray-500">Loading recent patient analysis data...</p>
          </div>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No results found</h3>
            <p className="text-gray-500 mt-2 mb-6">Upload MRI images for a patient to see analysis results here.</p>
            <Button onClick={() => router.push('/dashboard/patients')}>
              <Users className="w-4 h-4 mr-2" />
              Go to Patients
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                id={result.id}
                patientId={result.patientId}
                date={result.date}
                status={result.status}
                volumes={result.volumes}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-8 pt-4">
            <Button 
              variant="outline" 
              className="px-8 py-2.5 font-medium"
              onClick={() => router.push('/dashboard/patients')}
            >
              <Users className="w-4 h-4 mr-2" />
              View All Patients
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

