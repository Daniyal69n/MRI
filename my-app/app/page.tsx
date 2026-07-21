import Link from 'next/link';
import { Brain, ScanLine, BarChart3, Cpu, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden relative text-slate-100">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-mri-blue/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-mri-teal/10 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28 z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-24 animate-fade-in-up">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-mri-cyan/20 blur-2xl rounded-full animate-pulse-glow" />
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md relative z-10 shadow-2xl">
                <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-mri-cyan drop-shadow-[0_0_8px_rgba(2,195,154,0.8)]" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 px-2">
            Brain Soft Tissue <br className="hidden sm:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mri-cyan via-blue-400 to-indigo-400">
              Volumetric Analysis
            </span>
          </h1>
          <p className="text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto font-light px-4 leading-relaxed">
            Advanced, automated quantification of brain tissue constituents powered by precise medical imaging analysis.
          </p>
        </div>

        {/* Action Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-20 sm:mb-28">
          <div className="glass-panel-dark rounded-2xl p-8 sm:p-10 hover-lift relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-mri-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                For Researchers
                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent ml-4" />
              </h2>
              <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
                Access your personalized dashboard with advanced volumetric tools, detailed segmentation, and complete historical reports.
              </p>
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full text-lg h-14 bg-mri-blue hover:bg-blue-800 shadow-[0_0_20px_rgba(0,43,91,0.5)] border-0">
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass-panel-dark rounded-2xl p-8 sm:p-10 hover-lift relative group overflow-hidden border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-mri-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                New User?
                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent ml-4" />
              </h2>
              <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
                Register to start securely analyzing brain MRI datasets and generating standardized volumetric clinical reports.
              </p>
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full text-lg h-14 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Capabilities */}
        <div className="max-w-6xl mx-auto glass-panel-dark rounded-3xl overflow-hidden relative border border-slate-700/60 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mri-blue via-mri-cyan to-indigo-500" />
          
          <div className="px-8 sm:px-12 py-10 sm:py-12 text-center border-b border-slate-800/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Platform Capabilities
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
              End-to-end workflow designed for precise soft tissue volumetric extraction
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
            <div className="flex flex-col p-8 sm:p-10 hover:bg-slate-800/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-mri-blue/20 border border-mri-blue/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,43,91,0.3)]">
                <ScanLine className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Image Preprocessing</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Standardized pipeline integrating advanced noise reduction, intensity normalization, and robust skull stripping for optimal input quality.
              </p>
            </div>
            
            <div className="flex flex-col p-8 sm:p-10 hover:bg-slate-800/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-mri-cyan/20 border border-mri-cyan/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(2,195,154,0.3)]">
                <BarChart3 className="w-7 h-7 text-mri-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Quantitative Volumetrics</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                High-precision quantification of gray matter, white matter, and CSF absolute volumes, presented in structured, report-ready formats.
              </p>
            </div>
            
            <div className="flex flex-col p-8 sm:p-10 hover:bg-slate-800/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Cpu className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tissue Classification</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                State-of-the-art decision tree and CNN-based models deployed for automated, reliable tissue segmentation and categorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
