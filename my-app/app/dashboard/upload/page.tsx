'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, FileImage, X, CheckCircle, User, ChevronRight, ChevronLeft, Download, Eye } from 'lucide-react';
import { addNotification } from '@/lib/notifications';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/dashboard/PageHeader';

type Step = 'patient-details' | 'upload-images';

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingPatientId = searchParams.get('patientId');
  const [currentStep, setCurrentStep] = useState<Step>('patient-details');
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    medicalHistory: '',
    notes: '',
  });
  const [patientErrors, setPatientErrors] = useState<{
    firstName?: string;
    lastName?: string;
    age?: string;
    gender?: string;
    contactNumber?: string;
    email?: string;
    general?: string;
  }>({});
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [patientId, setPatientId] = useState<string>('');
  const [createdPatientId, setCreatedPatientId] = useState<string>('');

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [existingPatient, setExistingPatient] = useState<any>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [preprocessingResults, setPreprocessingResults] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number; currentFile: string }>({
    current: 0,
    total: 0,
    currentFile: ''
  });
  const [visitDate, setVisitDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [visitNotes, setVisitNotes] = useState<string>('');

  useEffect(() => {
    // If patientId is in URL, load patient data and skip to upload step
    if (existingPatientId) {
      loadExistingPatient(existingPatientId);
    }
  }, [existingPatientId]);

  const loadExistingPatient = async (patientId: string) => {
    setIsLoadingPatient(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      const data = await response.json();

      if (response.ok && data.patient) {
        setExistingPatient(data.patient);
        setPatientId(data.patient._id);
        setCreatedPatientId(data.patient.patientId);
        setCurrentStep('upload-images');
      }
      setIsLoadingPatient(false);
    } catch (error) {
      console.error('Error loading patient:', error);
      setIsLoadingPatient(false);
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
    setPatientErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientErrors({});

    // Validation
    const newErrors: typeof patientErrors = {};
    if (!patientData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!patientData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!patientData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(patientData.age)) || Number(patientData.age) < 0) {
      newErrors.age = 'Age must be a valid number';
    }
    if (!patientData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!patientData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setPatientErrors(newErrors);
      return;
    }

    setIsCreatingPatient(true);

    try {
      // Get current user
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch('/api/patients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...patientData,
          age: Number(patientData.age),
          uploadedBy: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPatientErrors({ general: data.error || 'Failed to register patient' });
        setIsCreatingPatient(false);
        return;
      }

      // Success - store patient ID and move to upload step
      setPatientId(data.patient.id);
      setCreatedPatientId(data.patient.patientId);
      setIsCreatingPatient(false);
      setCurrentStep('upload-images');
    } catch (error) {
      console.error('Patient creation error:', error);
      setPatientErrors({ general: 'Something went wrong. Please try again.' });
      setIsCreatingPatient(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') || 
      file.name.endsWith('.dcm') || 
      file.name.endsWith('.nii') ||
      file.name.endsWith('.nii.gz')
    );
    
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !patientId) return;
    
    setUploading(true);
    setUploadError('');
    setPreprocessingResults([]);
    
    try {
      const results = [];
      const totalFiles = files.length;
      
      // Set initial progress
      setProcessingProgress({
        current: 0,
        total: totalFiles,
        currentFile: ''
      });
      
      // Process each file through the preprocessing pipeline
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress - current file being processed
        setProcessingProgress({
          current: i + 1,
          total: totalFiles,
          currentFile: file.name
        });
        
        // Create form data for this file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('denoise_method', 'gaussian'); // Can be made configurable
        
        // Call preprocessing API
        const response = await fetch('/api/preprocess', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to process ${file.name}`);
        }
        
        const result = await response.json();
        results.push({
          filename: file.name,
          ...result,
        });
        
        // Update results in real-time as each file completes
        setPreprocessingResults([...results]);
      }
      
      setPreprocessingResults(results);
      setUploading(false);
      setUploaded(true);

      // Save patient history (visit date, upload metadata, preprocessing results)
      const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userJson ? JSON.parse(userJson) : null;
      if (user?.id && patientId) {
        const entries = results.map((r: { filename: string; processed_image_path?: string; processing_steps?: string[]; original_shape?: number[]; processed_shape?: number[] }) => ({
          originalFilename: r.filename,
          processedPath: r.processed_image_path ?? '',
          processingSteps: Array.isArray(r.processing_steps) ? r.processing_steps : [],
          originalShape: Array.isArray(r.original_shape) ? r.original_shape : [],
          processedShape: Array.isArray(r.processed_shape) ? r.processed_shape : [],
          denoiseMethod: 'gaussian',
        }));
        try {
          const histRes = await fetch(`/api/patients/${patientId}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadedBy: user.id,
              visitDate: visitDate || new Date().toISOString().slice(0, 10),
              imageCount: results.length,
              status: 'completed',
              entries,
              notes: visitNotes.trim() || undefined,
            }),
          });
          if (!histRes.ok) {
            const err = await histRes.json().catch(() => ({}));
            console.error('Patient history save failed:', err);
            addNotification({ type: 'warning', title: 'History not saved', message: 'Visit was recorded but history could not be saved. You can still view preprocessing results.' });
          }
        } catch (e) {
          console.error('Patient history save error:', e);
          addNotification({ type: 'warning', title: 'History not saved', message: 'Visit was recorded but history could not be saved. You can still view preprocessing results.' });
        }
      }

      // Create notification for each processed image
      results.forEach((result: { filename: string }) => {
        const patientName = existingPatient
          ? `${existingPatient.firstName} ${existingPatient.lastName}`
          : createdPatientId
            ? `Patient ${createdPatientId}`
            : 'Patient';

        addNotification({
          type: 'success',
          title: 'Preprocessing Completed',
          message: `MRI image "${result.filename}" has been successfully preprocessed through all 6 steps.`,
          patientName,
          patientId,
        });
      });

      // Keep results visible - no automatic redirect
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload and process images');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Upload MRI Images"
        description="Register a new patient and upload their MRI images for analysis"
      />

      {/* Step Indicator */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className={`flex items-center gap-2 ${currentStep === 'patient-details' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
            currentStep === 'patient-details' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <span className="font-medium text-sm sm:text-base">Patient Details</span>
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
        <div className={`flex items-center gap-2 ${currentStep === 'upload-images' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
            currentStep === 'upload-images' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className="font-medium text-sm sm:text-base">Upload Images</span>
        </div>
      </div>

      {currentStep === 'patient-details' && (
        <Card title="Patient Information">
          <form onSubmit={handlePatientSubmit} className="space-y-4">
            {patientErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {patientErrors.general}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label="First Name"
                placeholder="Enter patient's first name"
                value={patientData.firstName}
                onChange={handlePatientChange}
                error={patientErrors.firstName}
                required
              />
              <Input
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Enter patient's last name"
                value={patientData.lastName}
                onChange={handlePatientChange}
                error={patientErrors.lastName}
                required
              />
              <Input
                type="number"
                name="age"
                label="Age"
                placeholder="Enter patient's age"
                value={patientData.age}
                onChange={handlePatientChange}
                error={patientErrors.age}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={patientData.gender}
                  onChange={handlePatientChange}
                  className={`w-full px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    patientErrors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {patientErrors.gender && (
                  <p className="mt-1 text-sm text-red-600">{patientErrors.gender}</p>
                )}
              </div>
              <Input
                type="tel"
                name="contactNumber"
                label="Contact Number"
                placeholder="Enter contact number"
                value={patientData.contactNumber}
                onChange={handlePatientChange}
                error={patientErrors.contactNumber}
                required
              />
              <Input
                type="email"
                name="email"
                label="Email Address (Optional)"
                placeholder="Enter email address"
                value={patientData.email}
                onChange={handlePatientChange}
                error={patientErrors.email}
              />
            </div>

            <Input
              type="text"
              name="address"
              label="Address (Optional)"
              placeholder="Enter patient's address"
              value={patientData.address}
              onChange={handlePatientChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical History (Optional)
              </label>
              <textarea
                name="medicalHistory"
                value={patientData.medicalHistory}
                onChange={handlePatientChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter relevant medical history"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={patientData.notes}
                onChange={handlePatientChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isCreatingPatient}>
                {isCreatingPatient ? (
                  'Creating Patient...'
                ) : (
                  <>
                    Next: Upload Images
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {currentStep === 'upload-images' && (
        <>
          {isLoadingPatient ? (
            <Card>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading patient information...</p>
              </div>
            </Card>
          ) : (
            <>
              {createdPatientId && (
                <Card className="bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        {existingPatient 
                          ? `Uploading images for: ${existingPatient.firstName} ${existingPatient.lastName}`
                          : 'Patient Registered Successfully'}
                      </p>
                      <p className="text-sm text-blue-700">Patient ID: {createdPatientId}</p>
                      {existingPatient && (
                        <p className="text-xs text-blue-600 mt-1">
                          Age: {existingPatient.age} | Gender: {existingPatient.gender}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          <Card>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload MRI Images</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Upload images for Patient ID: {createdPatientId}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep('patient-details')}
                  className="self-start sm:self-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Visit / check-up date"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes for this visit (optional)
                  </label>
                  <textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="e.g. follow-up, symptoms, referral..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-10 lg:p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Drag and drop files here
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  or click to browse files
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-2">
                  Supported formats: DICOM (.dcm), NIfTI (.nii, .nii.gz), PNG, JPEG
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".dcm,.nii,.nii.gz,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    Select Files
                  </span>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileImage className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {files.length > 0 && !uploaded && (
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setFiles([])}
                    disabled={uploading}
                    className="w-full sm:w-auto"
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full sm:w-auto"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Action Buttons After Upload */}
              {uploaded && preprocessingResults.length > 0 && (
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setFiles([]);
                      setPreprocessingResults([]);
                      setUploaded(false);
                      setUploadError('');
                      setProcessingProgress({ current: 0, total: 0, currentFile: '' });
                    }}
                  >
                    Process More Images
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setFiles([]);
                      setPreprocessingResults([]);
                      setUploaded(false);
                      setUploadError('');
                      setProcessingProgress({ current: 0, total: 0, currentFile: '' });
                      setVisitDate(new Date().toISOString().slice(0, 10));
                      setVisitNotes('');
                      setExistingPatient(null);
                      setCurrentStep('patient-details');
                      setPatientData({
                        firstName: '',
                        lastName: '',
                        age: '',
                        gender: '',
                        contactNumber: '',
                        email: '',
                        address: '',
                        medicalHistory: '',
                        notes: '',
                      });
                      setPatientId('');
                      setCreatedPatientId('');
                    }}
                  >
                    Start New Patient
                  </Button>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4">
                  <strong>Error:</strong> {uploadError}
                </div>
              )}

              {/* Processing Progress */}
              {uploading && (
                <div className="mt-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900">Processing Images...</h3>
                          <p className="text-sm text-blue-700">
                            {processingProgress.currentFile && (
                              <>Processing: <strong>{processingProgress.currentFile}</strong></>
                            )}
                            {!processingProgress.currentFile && (
                              <>Preparing to process your MRI images...</>
                            )}
                          </p>
                        </div>
                      </div>
                      {processingProgress.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-blue-700">
                            <span>
                              File {processingProgress.current} of {processingProgress.total}
                            </span>
                            <span>
                              {Math.round((processingProgress.current / processingProgress.total) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Preprocessing Results */}
              {preprocessingResults.length > 0 && (
                <div className="space-y-4 mt-4 sm:mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Preprocessing Results ({preprocessingResults.length} {preprocessingResults.length === 1 ? 'image' : 'images'})
                    </h3>
                    {uploaded && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm sm:text-base font-medium">All images processed successfully!</span>
                      </div>
                    )}
                  </div>
                  {preprocessingResults.map((result, index) => (
                    <Card key={index} className="bg-green-50 border-green-200">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <h4 className="font-semibold text-green-900 truncate">
                              {result.filename}
                            </h4>
                          </div>
                          <span className="text-xs text-gray-500">
                            {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div className="bg-white rounded-lg p-3">
                            <span className="text-gray-600 block mb-1">Original Size:</span>
                            <span className="font-semibold text-gray-900">
                              {result.original_shape?.join(' × ')} pixels
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <span className="text-gray-600 block mb-1">Processed Size:</span>
                            <span className="font-semibold text-gray-900">
                              {result.processed_shape?.join(' × ')} pixels
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3">
                          <span className="text-gray-600 text-sm font-medium block mb-2">Processing Steps Completed:</span>
                          <ul className="space-y-1.5">
                            {result.processing_steps?.map((step: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {result.processed_image_path && (
                          <div className="bg-white rounded-lg p-3">
                            <span className="text-gray-600 text-xs block mb-1">Processed Image Location:</span>
                            <span className="text-xs text-gray-800 font-mono break-all">
                              {result.processed_image_path}
                            </span>
                          </div>
                        )}

                        {/* Processed Image Display */}
                        {result.processed_image_base64 && (
                          <div className="bg-white rounded-lg p-4 space-y-3 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-600" />
                                Processed Image (256×256)
                              </h5>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Download the processed image
                                  const link = document.createElement('a');
                                  link.href = result.processed_image_base64;
                                  link.download = `${result.filename.replace(/\.[^/.]+$/, '')}_processed_256x256.png`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Image
                              </Button>
                            </div>
                            <div className="flex justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <img
                                src={result.processed_image_base64}
                                alt={`Processed ${result.filename}`}
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                style={{ maxHeight: '400px', border: '2px solid #e5e7eb' }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                              Preprocessed MRI image after all 6 processing steps (Resize, Grayscale, Denoising, Skull Stripping, Histogram Equalization, Normalization)
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Instructions */}
      <Card title="Upload Instructions">
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Step 1: Enter patient details including name, age, gender, and contact information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Step 2: Upload MRI images in DICOM, NIfTI, PNG, or JPEG format</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Multiple files can be uploaded at once</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Files will be automatically validated and preprocessed</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <PageHeader 
          title="Upload MRI Images" 
          description="Upload and process brain MRI images for volumetric analysis"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
