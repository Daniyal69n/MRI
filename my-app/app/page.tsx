import Link from 'next/link';
import { Brain, ScanLine, BarChart3, Cpu } from 'lucide-react';
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

        <div className="max-w-4xl mx-auto border border-gray-200/80 bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-5 sm:px-6 py-4 sm:py-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center tracking-tight">
              Platform Capabilities
            </h2>
            <p className="text-sm text-gray-500 text-center mt-1 max-w-xl mx-auto">
              End-to-end workflow for brain soft tissue volumetric analysis
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-5 sm:p-6">
            <div className="flex flex-col items-center text-center py-6 sm:py-4 sm:px-4 first:pt-6 last:pb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 flex-shrink-0">
                <ScanLine className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Image Preprocessing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Standardized pipeline: noise reduction, intensity normalization, and skull stripping for consistent input quality.
              </p>
            </div>
            <div className="flex flex-col items-center text-center py-6 sm:py-4 sm:px-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quantitative Volumetrics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Quantification of gray matter, white matter, and CSF volumes with structured, report-ready outputs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center py-6 sm:py-4 sm:px-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4 flex-shrink-0">
                <Cpu className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tissue Classification</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Decision tree and CNN-based models for automated tissue segmentation and classification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
