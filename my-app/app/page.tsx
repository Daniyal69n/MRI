import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-1">
            Brain Soft Tissue Volumetric Analysis
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-1">
            Investigating Volumetric Analysis of Constituents Of Brain Soft Tissue
          </p>
          <p className="text-sm sm:text-lg text-gray-500 mt-2 px-1">
            Automated MRI analysis using machine learning and deep learning
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-16">
          <div className="bg-white rounded-xl sm:rounded-lg shadow-lg p-5 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">For Researchers</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Access advanced volumetric analysis tools for brain tissue segmentation and quantification.
            </p>
            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                Access Dashboard
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl sm:rounded-lg shadow-lg p-5 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">New User?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Register as a researcher to start analyzing brain MRI images and generating volumetric reports.
            </p>
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-lg shadow-lg p-5 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">MRI Processing</h3>
              <p className="text-sm text-gray-600">
                Automated preprocessing, denoising, and skull stripping
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Volumetric Analysis</h3>
              <p className="text-sm text-gray-600">
                Accurate measurement of gray matter, white matter, and CSF volumes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">ML Models</h3>
              <p className="text-sm text-gray-600">
                Decision Tree and CNN models for accurate tissue classification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
