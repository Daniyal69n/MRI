'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090c11] text-[#e7ebf1] font-sans overflow-x-hidden bg-hero-glow">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#090c11]/80 backdrop-blur-md border-b border-[#232b38]">
        <div className="max-w-[1180px] mx-auto px-8 flex items-center justify-between h-[68px]">
          <div className="flex items-center gap-2.5 font-bold text-[17px] tracking-wide">
            <span className="w-[26px] h-[26px] relative">
              <svg viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="11" stroke="#52e8d4" strokeWidth="1.2"/>
                <line x1="13" y1="1" x2="13" y2="6" stroke="#52e8d4" strokeWidth="1.2"/>
                <line x1="13" y1="20" x2="13" y2="25" stroke="#52e8d4" strokeWidth="1.2"/>
                <line x1="1" y1="13" x2="6" y2="13" stroke="#52e8d4" strokeWidth="1.2"/>
                <line x1="20" y1="13" x2="25" y2="13" stroke="#52e8d4" strokeWidth="1.2"/>
                <circle cx="13" cy="13" r="2.6" fill="#52e8d4"/>
              </svg>
            </span>
            <span>BRAINANALYSIS<span className="text-[#5b6576] font-normal">.ME</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[14px] text-[#8c96a8]">
            <Link href="#pipeline" className="hover:text-[#e7ebf1] transition-colors">Platform</Link>
            <Link href="#report" className="hover:text-[#e7ebf1] transition-colors">Sample Report</Link>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="font-mono text-[13px] px-4 py-2 rounded-[3px] border border-[#232b38] hover:border-tissue-csf hover:-translate-y-[1px] transition-all text-[#e7ebf1]">
              Log In
            </Link>
            <Link href="/register" className="font-mono text-[13px] px-4 py-2 rounded-[3px] border border-tissue-csf bg-tissue-csf text-[#04211d] font-medium hover:bg-[#6ef0de] hover:border-[#6ef0de] hover:-translate-y-[1px] transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="pt-[76px] pb-[40px] relative">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-tissue-csf flex items-center gap-2.5 mb-6 before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:bg-tissue-csf before:shadow-[0_0_0_3px_rgba(82,232,212,0.15)]">
              T1-WEIGHTED · AXIAL · 1MM ISOTROPIC
            </div>
            <h1 className="font-bold text-[clamp(34px,4.4vw,54px)] leading-[1.06] tracking-tight mb-6">
              Brain soft tissue,<br/>measured to the <span className="text-tissue-csf">voxel</span>.
            </h1>
            <p className="text-[17px] leading-[1.65] text-[#8c96a8] max-w-[46ch] mb-8">
              Automated segmentation and volumetric quantification of gray matter, white matter, and CSF — from raw MRI to a report-ready dataset, without manual tracing.
            </p>
            <div className="flex gap-3.5 flex-wrap mb-9">
              <Link href="/login" className="font-mono text-[13.5px] px-[22px] py-[13px] rounded-[3px] border border-tissue-csf bg-tissue-csf text-[#04211d] font-medium hover:bg-[#6ef0de] hover:border-[#6ef0de] hover:-translate-y-[1px] transition-all shadow-[0_0_15px_rgba(82,232,212,0.4)]">
                Access Dashboard →
              </Link>
              <Link href="/register" className="font-mono text-[13.5px] px-[22px] py-[13px] rounded-[3px] border border-[#232b38] hover:border-tissue-csf hover:-translate-y-[1px] transition-all text-[#e7ebf1]">
                Create Account
              </Link>
            </div>
            <div className="flex gap-[34px] flex-wrap font-mono">
              <div><span className="text-[20px] text-[#e7ebf1] block font-medium">3</span><span className="text-[11.5px] text-[#5b6576] tracking-wide uppercase">Tissue Classes</span></div>
              <div><span className="text-[20px] text-[#e7ebf1] block font-medium">&lt;90s</span><span className="text-[11.5px] text-[#5b6576] tracking-wide uppercase">Per Volume</span></div>
              <div><span className="text-[20px] text-[#e7ebf1] block font-medium">FCM</span><span className="text-[11.5px] text-[#5b6576] tracking-wide uppercase">Clustering</span></div>
            </div>
          </div>

          <div className="bg-[#10151d] border border-[#232b38] rounded-md p-4.5 relative shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] glow-border glass-panel-dark">
            <div className="flex justify-between items-center font-mono text-[10.5px] text-[#5b6576] tracking-wider mb-3.5 px-0.5">
              <span>CASE_00214 · SLICE 118/240</span>
              <span className="text-[#ff6b6b] flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#ff6b6b] before:animate-pulse-fast">
                SEGMENTING
              </span>
            </div>
            <div className="relative aspect-square bg-[radial-gradient(ellipse_at_center,#0d1117_0%,#05070a_78%)] rounded-sm overflow-hidden border border-[#1a2028]">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-tissue-csf/20"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-tissue-csf/20"></div>
              <div className="absolute left-0 right-0 h-[38%] bg-gradient-to-b from-transparent via-tissue-csf/10 to-transparent animate-sweep"></div>
              <svg viewBox="0 0 300 300" className="w-full h-full block relative z-10">
                {/* skull */}
                <ellipse cx="150" cy="150" rx="118" ry="112" fill="none" stroke="#2a323f" strokeWidth="2"/>
                {/* white matter mass */}
                <path d="M150 55 C 205 58, 240 95, 242 150 C 244 205, 205 242, 150 244 C 95 242, 56 205, 58 150 C 56 95, 95 58, 150 55 Z" fill="#f0d3a0" opacity="0.16" stroke="#f0d3a0" strokeWidth="1.4" strokeOpacity="0.55"/>
                {/* cortical ribbon (gray matter) */}
                <path d="M150 62 C 200 65, 233 98, 235 150 C 237 202, 200 235, 150 237 C 100 235, 63 202, 65 150 C 63 98, 100 65, 150 62 Z" fill="none" stroke="#b794f6" strokeWidth="5" strokeOpacity="0.8"/>
                {/* gyral texture lines */}
                <g stroke="#f0d3a0" strokeWidth="1" fill="none" opacity="0.35">
                  <path d="M100 90 Q 115 110 100 130"/>
                  <path d="M130 72 Q 145 95 128 118"/>
                  <path d="M175 76 Q 165 100 182 120"/>
                  <path d="M205 100 Q 190 120 208 140"/>
                  <path d="M95 175 Q 112 190 98 210"/>
                  <path d="M205 178 Q 190 195 206 212"/>
                  <path d="M130 222 Q 145 202 128 182"/>
                  <path d="M172 224 Q 162 202 180 184"/>
                </g>
                {/* ventricles / CSF */}
                <path d="M132 128 C 118 122, 108 132, 110 146 C 111 158, 124 164, 136 160 C 130 150, 130 138, 132 128 Z" fill="#52e8d4" opacity="0.85"/>
                <path d="M168 128 C 182 122, 192 132, 190 146 C 189 158, 176 164, 164 160 C 170 150, 170 138, 168 128 Z" fill="#52e8d4" opacity="0.85"/>
                <path d="M144 168 C 138 178, 140 190, 150 194 C 160 190, 162 178, 156 168 C 150 172, 148 172, 144 168 Z" fill="#52e8d4" opacity="0.6"/>
              </svg>
            </div>
            <div className="flex gap-[18px] mt-4 flex-wrap px-0.5 font-mono text-[11.5px] text-[#8c96a8]">
              <div className="flex items-center gap-2"><span className="w-[9px] h-[9px] rounded-sm bg-tissue-gm flex-none"></span>Gray Matter</div>
              <div className="flex items-center gap-2"><span className="w-[9px] h-[9px] rounded-sm bg-tissue-wm flex-none"></span>White Matter</div>
              <div className="flex items-center gap-2"><span className="w-[9px] h-[9px] rounded-sm bg-tissue-csf flex-none"></span>CSF</div>
            </div>
            <div className="mt-3.5 pt-3.5 border-t border-[#232b38] grid grid-cols-3 gap-2.5 font-mono">
              <div><div className="text-[15px] font-medium text-tissue-gm">612.4 cm³</div><div className="text-[10px] text-[#5b6576] uppercase tracking-wide mt-0.5">Gray Matter</div></div>
              <div><div className="text-[15px] font-medium text-tissue-wm">487.1 cm³</div><div className="text-[10px] text-[#5b6576] uppercase tracking-wide mt-0.5">White Matter</div></div>
              <div><div className="text-[15px] font-medium text-tissue-csf">142.8 cm³</div><div className="text-[10px] text-[#5b6576] uppercase tracking-wide mt-0.5">CSF</div></div>
            </div>
          </div>
        </div>
      </header>

      {/* PIPELINE */}
      <section id="pipeline" className="py-[88px] relative">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="max-w-[640px] mb-14">
            <div className="font-mono text-[12px] text-tissue-csf tracking-widest uppercase mb-3.5">Platform Capabilities</div>
            <h2 className="font-bold text-[clamp(26px,3vw,36px)] tracking-tight mb-3.5">One pipeline, from raw scan to structured volumes.</h2>
            <p className="text-[#8c96a8] text-[15.5px] leading-[1.6]">Each stage runs automatically in sequence — upload a study and the platform carries it through preprocessing, classification, and quantification.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-0 right-0 top-[38px] h-[1px] bg-[repeating-linear-gradient(90deg,#232b38_0_8px,transparent_8px_14px)] z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 relative z-10">
              <div className="bg-[#10151d] border border-[#232b38] rounded-md p-6 pt-[26px] hover:border-tissue-gm hover:-translate-y-1 transition-all duration-300 shadow-lg glow-border">
                <div className="font-mono text-[12px] text-[#090c11] bg-tissue-csf w-[28px] h-[28px] rounded-full flex items-center justify-center mb-5 font-medium">01</div>
                <h3 className="font-bold text-[18px] mb-2.5">Image Preprocessing</h3>
                <p className="text-[#8c96a8] text-[14px] leading-[1.6] mb-4">Noise reduction, intensity normalization, and skull stripping standardize every incoming scan before analysis begins.</p>
                <span className="inline-block font-mono text-[10.5px] text-[#5b6576] border border-[#232b38] rounded-full px-2.5 py-1">INPUT · DICOM / NIfTI</span>
              </div>
              <div className="bg-[#10151d] border border-[#232b38] rounded-md p-6 pt-[26px] hover:border-tissue-gm hover:-translate-y-1 transition-all duration-300 shadow-lg glow-border">
                <div className="font-mono text-[12px] text-[#090c11] bg-tissue-csf w-[28px] h-[28px] rounded-full flex items-center justify-center mb-5 font-medium">02</div>
                <h3 className="font-bold text-[18px] mb-2.5">Tissue Classification</h3>
                <p className="text-[#8c96a8] text-[14px] leading-[1.6] mb-4">Fuzzy C-Means clustering robustly labels each voxel as gray matter, white matter, or CSF with clinical-grade consistency.</p>
                <span className="inline-block font-mono text-[10.5px] text-[#5b6576] border border-[#232b38] rounded-full px-2.5 py-1">MODEL · FCM Clustering</span>
              </div>
              <div className="bg-[#10151d] border border-[#232b38] rounded-md p-6 pt-[26px] hover:border-tissue-gm hover:-translate-y-1 transition-all duration-300 shadow-lg glow-border">
                <div className="font-mono text-[12px] text-[#090c11] bg-tissue-csf w-[28px] h-[28px] rounded-full flex items-center justify-center mb-5 font-medium">03</div>
                <h3 className="font-bold text-[18px] mb-2.5">Quantitative Volumetrics</h3>
                <p className="text-[#8c96a8] text-[14px] leading-[1.6] mb-4">Classified tissue is converted into absolute volumes and assembled into a structured, report-ready output.</p>
                <span className="inline-block font-mono text-[10.5px] text-[#5b6576] border border-[#232b38] rounded-full px-2.5 py-1">OUTPUT · Structured Report</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REPORT */}
      <section id="report" className="py-[88px]">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="max-w-[640px] mb-14">
            <div className="font-mono text-[12px] text-tissue-csf tracking-widest uppercase mb-3.5">Sample Output</div>
            <h2 className="font-bold text-[clamp(26px,3vw,36px)] tracking-tight mb-3.5">What a completed report looks like.</h2>
            <p className="text-[#8c96a8] text-[15.5px] leading-[1.6]">Every study produces a structured breakdown of tissue volumes, ready to drop into a research record or clinical chart.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] bg-[#10151d] border border-[#232b38] rounded-md overflow-hidden shadow-2xl glass-panel-dark">
            <div className="p-10 border-b md:border-b-0 md:border-r border-[#232b38]">
              <h3 className="font-bold text-[22px] mb-3.5">Standardized, comparable, exportable.</h3>
              <p className="text-[#8c96a8] text-[14.5px] leading-[1.65] mb-6">Volumes are computed in absolute terms and normalized against reference ranges, so results stay comparable across scanners, sites, and follow-up visits.</p>
              <Link href="/login" className="font-mono text-[13px] px-[16px] py-[9px] rounded-[3px] border border-tissue-csf bg-tissue-csf text-[#04211d] font-medium hover:bg-[#6ef0de] hover:border-[#6ef0de] hover:-translate-y-[1px] transition-all inline-flex items-center gap-2">
                Access Dashboard →
              </Link>
            </div>
            <div className="p-8 sm:p-10 w-full">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_1fr] pb-3 border-b border-[#232b38] font-mono text-[10.5px] text-[#5b6576] uppercase tracking-wide items-center">
                <div>Structure</div><div>Volume</div><div>% ICV</div><div>Reference Range</div>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_1fr] py-3 border-b border-[#232b38] font-mono text-[12.5px] items-center group">
                <div className="flex items-center"><span className="w-2 h-2 rounded-[2px] bg-tissue-gm mr-2"></span>Gray Matter</div>
                <div>612.4 cm³</div><div>42.1%</div>
                <div className="h-[5px] rounded-[3px] bg-[#232b38] relative overflow-hidden"><i className="absolute left-0 top-0 bottom-0 rounded-[3px] bg-tissue-gm w-[64%] group-hover:bg-opacity-80 transition-all duration-300"></i></div>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_1fr] py-3 border-b border-[#232b38] font-mono text-[12.5px] items-center group">
                <div className="flex items-center"><span className="w-2 h-2 rounded-[2px] bg-tissue-wm mr-2"></span>White Matter</div>
                <div>487.1 cm³</div><div>33.5%</div>
                <div className="h-[5px] rounded-[3px] bg-[#232b38] relative overflow-hidden"><i className="absolute left-0 top-0 bottom-0 rounded-[3px] bg-tissue-wm w-[52%] group-hover:bg-opacity-80 transition-all duration-300"></i></div>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_1fr] py-3 border-b border-[#232b38] font-mono text-[12.5px] items-center group">
                <div className="flex items-center"><span className="w-2 h-2 rounded-[2px] bg-tissue-csf mr-2"></span>CSF</div>
                <div>142.8 cm³</div><div>9.8%</div>
                <div className="h-[5px] rounded-[3px] bg-[#232b38] relative overflow-hidden"><i className="absolute left-0 top-0 bottom-0 rounded-[3px] bg-tissue-csf w-[22%] group-hover:bg-opacity-80 transition-all duration-300"></i></div>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_1fr] py-3 font-mono text-[12.5px] items-center">
                <div className="flex items-center"><span className="w-2 h-2 rounded-[2px] bg-[#4a5468] mr-2"></span>Total ICV</div>
                <div>1454.7 cm³</div><div>100%</div>
                <div className="h-[5px] rounded-[3px] bg-[#232b38] relative overflow-hidden"><i className="absolute left-0 top-0 bottom-0 rounded-[3px] bg-[#4a5468] w-full"></i></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pt-0 pb-[60px]">
        <div className="max-w-[1180px] mx-auto px-8 text-center pt-[90px]">
          <h2 className="font-bold text-[clamp(26px,3.4vw,38px)] mb-4">Start analyzing your first dataset.</h2>
          <p className="text-[#8c96a8] text-[15.5px] mb-8">Register in minutes, upload a study, and receive a structured volumetric report.</p>
          <div className="flex justify-center gap-3.5 flex-wrap">
            <Link href="/register" className="font-mono text-[13px] px-[16px] py-[9px] rounded-[3px] border border-tissue-csf bg-tissue-csf text-[#04211d] font-medium hover:bg-[#6ef0de] hover:border-[#6ef0de] hover:-translate-y-[1px] transition-all">
              Create Account
            </Link>
            <Link href="/login" className="font-mono text-[13px] px-[16px] py-[9px] rounded-[3px] border border-[#232b38] hover:border-tissue-csf hover:-translate-y-[1px] transition-all text-[#e7ebf1]">
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#232b38] py-8 text-[12.5px] text-[#5b6576] font-mono">
        <div className="max-w-[1180px] mx-auto px-8 flex justify-between flex-wrap gap-3">
          <span>© 2026 BrainAnalysis.me</span>
          <span>Gray Matter · White Matter · CSF Quantification</span>
        </div>
      </footer>
    </div>
  );
}
