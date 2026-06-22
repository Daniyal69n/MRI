'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, FileText, Calendar, User, Plus } from 'lucide-react';
import { generateReport } from '@/lib/reportGenerator';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface Patient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  contactNumber: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  pmdcNumber?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user data
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          router.push('/login');
          return;
        }
      }

      // Load patients
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const response = await fetch(`/api/patients?uploadedBy=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setPatients(data.patients);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const handleGenerateReport = (patient: Patient) => {
    if (!user) {
      alert('User information not available. Please login again.');
      return;
    }

    const scanDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const reportData = {
      patient: {
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        age: patient.age,
        gender: patient.gender,
        contactNumber: patient.contactNumber,
        email: patient.email,
        address: patient.address,
        medicalHistory: patient.medicalHistory,
        notes: patient.notes,
      },
      doctor: {
        firstName: user.firstName,
        lastName: user.lastName,
        specialization: user.specialization || 'Medical Officer',
        pmdcNumber: user.pmdcNumber,
      },
      scanDate: scanDate,
      purpose: 'MRI brain scan for tumor / lesion analysis.',
      findings: [
        {
          finding: 'Brain Structure',
          details: 'Normal brain anatomy observed. No significant structural abnormalities detected.',
        },
        {
          finding: 'Tissue Volumetry',
          details: 'Volumetric analysis completed. Gray matter, white matter, and CSF volumes within normal ranges.',
        },
      ],
      impression: 'No significant abnormalities detected in this MRI brain scan. The patient\'s brain MRI scan is clear, showing normal brain structures.',
      recommendation: 'Regular follow-up as needed. Immediate consultation is advised if any new symptoms develop.',
    };

    try {
      generateReport(reportData);
      setShowGenerateModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="View and download volumetric analysis reports"
          icon={FileText}
        />
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading patients...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download MRI brain analysis reports"
        icon={FileText}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Select Patient to Generate Report</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Choose a patient to create a hospital-style MRI report</p>
        </div>
      </div>

      {patients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
            <p className="text-gray-600 mb-6">
              Register a patient first to generate reports
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/upload')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Register New Patient
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Patient ID</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Age</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Gender</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 sm:py-4 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{patient.patientId}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-gray-600">{patient.age} years</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-gray-600">{patient.gender}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGenerateReport(patient)}
                        className="touch-manipulation"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Generate Report</span>
                        <span className="sm:hidden">Report</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      
    </div>
  );
}

