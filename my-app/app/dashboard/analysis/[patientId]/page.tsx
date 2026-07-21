'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateReport } from '@/lib/reportGenerator';
import { ArrowLeft, FileText, Loader2, Calendar, User, Eye, Image as ImageIcon } from 'lucide-react';

interface HistoryEntry {
  originalFilename: string;
  processedPath: string;
  processingSteps: string[];
  originalShape: number[];
  processedShape: number[];
  denoiseMethod: string;
  original_image_base64?: string;
  processed_image_base64?: string;
  roi_base64?: string;
  final_overlay_base64?: string;
  gm_mask_base64?: string;
  wm_mask_base64?: string;
  csf_mask_base64?: string;
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
}

export default function ClinicalViewer({ params }: { params: Promise<{ patientId: string }> | { patientId: string } }) {
  const router = useRouter();
  const [history, setHistory] = useState<PatientHistoryRecord[]>([]);
  const [patientData, setPatientData] = useState<{ patientId: string, firstName: string, lastName: string, age?: number, gender?: string, contactNumber?: string, email?: string, address?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Editable fields for the report
  const [impression, setImpression] = useState("No significant abnormalities detected in this MRI brain scan. The patient's brain MRI scan is clear, showing normal brain structures.");
  const [recommendation, setRecommendation] = useState("Regular follow-up as needed. Immediate consultation is advised if any new symptoms develop.");

  // Safely unwrap params (works for both Next 14 object and Next 15 Promise)
  const resolvedParams = params instanceof Promise ? use(params) : params;

  useEffect(() => {
    fetch(`/api/patients/${resolvedParams.patientId}/history`)
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setHistory(data.history);
        }
        if (data.patient) {
          setPatientData(data.patient);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [resolvedParams.patientId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-mri-blue mb-4" />
        <p className="text-gray-500 font-medium">Loading Clinical Data...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Analysis History Found</h3>
            <p className="text-gray-500 mt-2">This patient has not undergone any MRI analysis yet.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show the most recent analysis by default
  const latestAnalysis = history[0];
  const displayPatientId = patientData ? patientData.patientId : resolvedParams.patientId;

  const handleExportPDF = () => {
    if (!latestAnalysis) return;

    // Build the data object required by the report generator
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userJson ? JSON.parse(userJson) : null;
    const doctorData = {
      firstName: user?.firstName || 'Unknown',
      lastName: user?.lastName || 'Doctor',
      specialization: 'Radiologist', // Default fallback
    };

    const scanDateFormatted = new Date(latestAnalysis.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let findings = [{
      finding: 'Brain Structure',
      details: 'Normal brain anatomy observed. No significant structural abnormalities detected.'
    }];

    if (latestAnalysis.gm_percent !== undefined) {
      findings.push({
        finding: 'Tissue Volumetry',
        details: `Volumetric analysis completed. Gray Matter: ${latestAnalysis.gm_percent.toFixed(2)}%, White Matter: ${latestAnalysis.wm_percent?.toFixed(2) || 'N/A'}%, CSF: ${latestAnalysis.csf_percent?.toFixed(2) || 'N/A'}%.`
      });
    }

    generateReport({
      patient: {
        patientId: displayPatientId,
        firstName: patientData?.firstName || 'Unknown',
        lastName: patientData?.lastName || 'Patient',
        age: patientData?.age || 0,
        gender: patientData?.gender || 'Unknown',
        contactNumber: patientData?.contactNumber || 'Unknown',
        email: patientData?.email,
        address: patientData?.address,
      },
      doctor: doctorData,
      scanDate: scanDateFormatted,
      purpose: 'MRI brain scan for tumor / lesion analysis.',
      findings: findings,
      impression: impression,
      recommendation: recommendation
    });
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExportPDF}
          className="shadow-md"
        >
          <FileText className="w-4 h-4 mr-2" /> Export Clinical PDF
        </Button>
      </div>

      <Card title="Clinical Volumetric Analysis Report">
        <div className="space-y-8">
          
          {/* Analysis Metadata */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-mri-blue" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Patient ID</p>
                <p className="font-semibold text-gray-900">{displayPatientId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-mri-blue" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Scan Date</p>
                <p className="font-semibold text-gray-900">{new Date(latestAnalysis.visitDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-mri-blue" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{latestAnalysis.status}</p>
              </div>
            </div>
          </div>

          {/* Volumetric Data */}
          {latestAnalysis.gm_percent && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Whole-Brain Soft Tissue Volumetric Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">Gray Matter (GM)</p>
                  <p className="text-2xl font-bold text-gray-900">{latestAnalysis.gm_percent.toFixed(2)}%</p>
                </div>
                <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-teal-600 mb-1 uppercase tracking-wider">White Matter (WM)</p>
                  <p className="text-2xl font-bold text-gray-900">{latestAnalysis.wm_percent?.toFixed(2)}%</p>
                </div>
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-cyan-600 mb-1 uppercase tracking-wider">CSF</p>
                  <p className="text-2xl font-bold text-gray-900">{latestAnalysis.csf_percent?.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Imaging Data (Entries) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Imaging Scans & ROI Detection</h3>
            
            {latestAnalysis.entries.map((entry, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4">{entry.originalFilename}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Side by Side Comparison */}
                  {entry.original_image_base64 && entry.final_overlay_base64 && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Original MRI Scan</p>
                        <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center border border-gray-200" style={{height: '350px'}}>
                          <img src={entry.original_image_base64} alt="Original MRI" className="object-contain max-w-full max-h-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-700">Final ROI Detection</p>
                        <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center border border-blue-200" style={{height: '350px'}}>
                          <img src={entry.final_overlay_base64} alt="Detected ROI" className="object-contain max-w-full max-h-full" />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Missing image data fallback */}
                  {(!entry.original_image_base64 || !entry.final_overlay_base64) && (
                    <div className="col-span-1 md:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-500">Image data is stored externally and cannot be rendered directly in this view.</p>
                      <p className="text-xs text-gray-400 mt-1">Processed Path: {entry.processedPath}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </Card>
      
      {/* Editable Report Section */}
      <Card title="Doctor's Report Customization">
        <div className="space-y-6">
          <p className="text-sm text-gray-500 mb-4">You can edit the final report details below before exporting the PDF.</p>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Impression</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800"
              rows={4}
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter clinical impression..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendation</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800"
              rows={4}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Enter recommendations..."
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
