'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Upload, Calendar, Phone, Mail, MapPin, History, FileImage, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DataTable } from '@/components/dashboard/DataTable';

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

interface HistoryEntry {
  originalFilename: string;
  processedPath: string;
  processingSteps: string[];
  originalShape: number[];
  processedShape: number[];
  denoiseMethod: string;
}

interface PatientHistoryRecord {
  _id: string;
  visitDate: string;
  imageCount: number;
  status: string;
  entries: HistoryEntry[];
  notes?: string;
  gm_percent?: number;
  wm_percent?: number;
  csf_percent?: number;
  tumor_detected?: boolean;
  tumor_area_px?: number;
  createdAt: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [patientHistory, setPatientHistory] = useState<PatientHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatient?._id) {
      setPatientHistory([]);
      setExpandedHistoryId(null);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    fetch(`/api/patients/${selectedPatient._id}/history`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.history) setPatientHistory(data.history);
      })
      .catch(() => {
        if (!cancelled) setPatientHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedPatient?._id]);

  const loadPatients = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch(`/api/patients?uploadedBy=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setPatients(data.patients);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setIsLoading(false);
    }
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleUploadImages = (patientId: string) => {
    router.push(`/dashboard/upload?patientId=${patientId}`);
  };

  const tableColumns = [
    { key: 'patientId', label: 'Patient ID' },
    {
      key: 'name',
      label: 'Name',
      render: (_: any, row: Patient) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Patients"
          description="View and manage all registered patients"
          icon={User}
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
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="View and manage all registered patients"
        icon={User}
      />

      {showPatientDetails && selectedPatient ? (
        <Card>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Patient Details
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPatientDetails(false);
                  setSelectedPatient(null);
                }}
                className="self-start sm:self-center"
              >
                ← Back to List
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient ID</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatient.patientId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg text-gray-900">{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg text-gray-900">{selectedPatient.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                    <p className="text-lg text-gray-900">{selectedPatient.contactNumber}</p>
                  </div>
                </div>
                {selectedPatient.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg text-gray-900">{selectedPatient.email}</p>
                    </div>
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-lg text-gray-900">{selectedPatient.address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registered Date</p>
                    <p className="text-lg text-gray-900">
                      {new Date(selectedPatient.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedPatient.medicalHistory && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Medical History</p>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedPatient.medicalHistory}
                </p>
              </div>
            )}

            {selectedPatient.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedPatient.notes}
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Patient History</h3>
              </div>
              {historyLoading ? (
                <div className="flex items-center gap-2 text-gray-500 py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
                  <span className="text-sm">Loading history…</span>
                </div>
              ) : patientHistory.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 bg-gray-50 rounded-lg px-4">
                  No visits or uploads recorded yet. Upload MRI images to create history.
                </p>
              ) : (
                <ul className="space-y-3">
                  {patientHistory.map((h) => (
                    <li
                      key={h._id}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedHistoryId((prev) => (prev === h._id ? null : h._id))}
                        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {new Date(h.visitDate).toLocaleDateString(undefined, {
                                dateStyle: 'medium',
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {h.imageCount} image{h.imageCount !== 1 ? 's' : ''} uploaded
                              {h.notes ? ' · Has notes' : ''}
                            </p>
                          </div>
                        </div>
                        {expandedHistoryId === h._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                        )}
                      </button>
                      {expandedHistoryId === h._id && (
                        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
                          {/* Clustering Results */}
                          {(h.gm_percent !== undefined || h.wm_percent !== undefined || h.csf_percent !== undefined) && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Volumetric Analysis</p>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white rounded px-3 py-2 border border-gray-200">
                                  <p className="text-xs text-gray-500 font-medium">Gray Matter</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {h.gm_percent !== undefined ? `${h.gm_percent.toFixed(2)}%` : '-'}
                                  </p>
                                </div>
                                <div className="bg-white rounded px-3 py-2 border border-gray-200">
                                  <p className="text-xs text-gray-500 font-medium">White Matter</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {h.wm_percent !== undefined ? `${h.wm_percent.toFixed(2)}%` : '-'}
                                  </p>
                                </div>
                                <div className="bg-white rounded px-3 py-2 border border-gray-200">
                                  <p className="text-xs text-gray-500 font-medium">CSF</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {h.csf_percent !== undefined ? `${h.csf_percent.toFixed(2)}%` : '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {h.notes && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Visit notes</p>
                              <p className="text-sm text-gray-700">{h.notes}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Processed images</p>
                            <ul className="space-y-2">
                              {h.entries.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <FileImage className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{e.originalFilename}</p>
                                    <p className="text-gray-500 text-xs">
                                      {e.originalShape?.length >= 2 && `${e.originalShape[0]}×${e.originalShape[1]} → `}
                                      {e.processedShape?.length >= 2 && `${e.processedShape[0]}×${e.processedShape[1]}`}
                                      {e.denoiseMethod && ` · ${e.denoiseMethod}`}
                                    </p>
                                    {e.processingSteps?.length > 0 && (
                                      <p className="text-gray-500 text-xs mt-0.5">
                                        {e.processingSteps.join(' → ')}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-4 border-t">
              <Button
                variant="primary"
                onClick={() => handleUploadImages(selectedPatient._id)}
                className="w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload MRI Images
              </Button>
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {patients.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Patients Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by registering a new patient and uploading their MRI images
                </p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard/upload')}
                >
                  Register New Patient
                </Button>
              </div>
            </Card>
          ) : (
            <Card title={`All Patients (${patients.length})`}>
              <DataTable
                columns={tableColumns}
                data={patients.map(p => ({ ...p, name: `${p.firstName} ${p.lastName}`, id: p._id }))}
                actionButton={{
                  label: 'View Details',
                  onClick: (row: any) => {
                    const patient = patients.find(p => p._id === (row.id || row._id));
                    if (patient) handleViewDetails(patient);
                  },
                }}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
