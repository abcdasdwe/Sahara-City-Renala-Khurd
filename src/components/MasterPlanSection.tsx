import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Maximize2, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Building, 
  TreePine, 
  Map as MapIcon,
  Navigation,
  Sparkles,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { AppSettings } from '../types';
import defaultMasterPlanImg from '../assets/images/sahara_society_master_plan_new_1784626943086.jpg';

interface MasterPlanSectionProps {
  settings?: AppSettings;
}

export default function MasterPlanSection({ settings }: MasterPlanSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'blueprint' | 'interactive'>('blueprint');

  // Lightbox Modal states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const masterPlanImg = settings?.masterPlanImage || defaultMasterPlanImg;

  const handleOpenPDF = () => {
    if (settings?.masterPlanPdf) {
      // If a custom PDF was uploaded by the admin, open or download it directly!
      const link = document.createElement('a');
      link.href = settings.masterPlanPdf;
      link.download = settings.masterPlanPdfName || 'Sahara_Model_City_Master_Plan.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setGenerating(true);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Branding colors
    const primaryColor = { r: 9, g: 14, b: 22 };      // #090E16 (Dark Navy)
    const accentColor = { r: 197, g: 168, b: 128 };    // #C5A880 (Corporate Gold)

    // Header Background
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, 210, 38, 'F');
    
    // Accent line
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.rect(0, 38, 210, 1.5, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('OFFICIAL SOCIETY DOCUMENT • MASTER MAP', 15, 12);

    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('SAHARA CITY RENALA KHURD', 15, 22);

    doc.setTextColor(230, 230, 230);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('COMPREHENSIVE SOCIETY MASTER PLAN • RESIDENTIAL & COMMERCIAL BLOCK MATRIX', 15, 30);

    // Title / Intro section
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('COMPLETE SOCIETY BLUEPRINT', 15, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    
    const descLines = [
      'Official Master Plan layout of Sahara City Renala Khurd showing residential blocks, commercial zones,',
      'road networks, central parks, green belts, utility access, mosque, and executive villas. This map',
      'serves as the official spatial blueprint for Phase A & B allotments, ensuring planned development.'
    ];
    doc.text(descLines, 15, 53);

    // Load and add the high-quality image
    const img = new Image();
    img.src = masterPlanImg;
    img.onload = () => {
      // Scale proportionally to fit page (width = 145mm, height = 193.3mm)
      const imgWidth = 145;
      const imgHeight = 193.3;
      const imgX = (210 - imgWidth) / 2;
      const imgY = 66;

      const imgFormat = masterPlanImg.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      try {
        doc.addImage(img, imgFormat, imgX, imgY, imgWidth, imgHeight);
      } catch (e) {
        console.warn('doc.addImage failed:', e);
      }

      // Footer
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(0, 275, 210, 22, 'F');
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.rect(0, 275, 210, 1, 'F');

      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('SAHARA CITY LAND & DEVELOPMENT AUTHORITY', 15, 281);

      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Verify bookings & document transfers at Site HQ: House # 130, Sahara City, Renala Khurd, Okara, Punjab.', 15, 286);
      doc.text('Contact Helpline: 0306 2444 405 / 0342 2444 405 • Official Portal: www.saharacityrenala.com', 15, 290);

      // Save/Download the PDF File
      doc.save(settings?.masterPlanPdfName || 'Sahara_City_Master_Plan.pdf');
      setGenerating(false);
    };

    img.onerror = () => {
      // Fallback
      doc.save('Sahara_City_Master_Plan.pdf');
      setGenerating(false);
    };
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = masterPlanImg;
    link.download = 'Sahara_City_Master_Plan_Blueprint.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="society-master-plan" className="py-16 bg-gray-50 dark:bg-black/10 border-b border-[#C5A880]/10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Descriptive Content and SEO Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-widest block font-mono">
                Official Spatial Blueprint
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-950 dark:text-white font-sans">
                Complete Society Master Plan
              </h2>
              <div className="h-1 w-20 bg-[#C5A880] rounded-full mt-2" />
            </div>



            {/* Feature Bento-Like List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl mt-0.5 border border-emerald-500/20">
                  <TreePine className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-950 dark:text-white">Lush Thematic Parks</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">Dedicated recreational zones, jogging tracks, and child-safe play zones.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5 border border-blue-500/20">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-950 dark:text-white">100 Ft Main Boulevard</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">Wide carpeted main boulevards and 40 Ft connecting networks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                <div className="p-2 bg-[#C5A880]/15 text-[#C5A880] rounded-xl mt-0.5 border border-[#C5A880]/20">
                  <Building className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-950 dark:text-white">Commercial Hubs</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">Commercial plots designed for retail markets, cafes, and business hubs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl mt-0.5 border border-sky-500/20">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-950 dark:text-white">Secure Gated Limits</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">Fully protected perimeter boundary, monitoring checkpoints, and guards.</p>
                </div>
              </div>
            </div>

            {/* View Full Master Plan & Download Suite Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => {
                  setZoomScale(1);
                  setIsLightboxOpen(true);
                }}
                className="bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-mono group"
              >
                <Maximize2 className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                <span>View Full Blueprint</span>
              </button>

              <button
                onClick={handleOpenPDF}
                disabled={generating}
                className="bg-[#090E16] hover:bg-black dark:bg-white/10 dark:hover:bg-white/20 text-white dark:text-white border border-[#C5A880]/30 font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 font-mono"
              >
                <FileText className="h-4.5 w-4.5 text-red-400" />
                <span>{generating ? 'Compiling PDF...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-black/40 dark:hover:bg-black/60 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 font-mono"
                title="Download High Definition Map Image"
              >
                <Download className="h-4.5 w-4.5 text-[#C5A880]" />
                <span className="hidden sm:inline">Image</span>
              </button>
            </div>

            <div className="text-left pt-1">
              <span className="block text-[10px] text-gray-400 font-medium">
                {settings?.masterPlanPdf ? `Custom PDF Active (${settings.masterPlanPdfName || 'Official_Master_Plan.pdf'})` : 'Auto-generated PDF & High-Res Vector Map'}
              </span>
            </div>
          </div>

          {/* Right Column: Modern Preview Card with toggle controls */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md group bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 rounded-3xl p-3.5 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col">
              
              {/* Outer decorative card frame with coordinate aesthetics */}
              <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-[#C5A880]/60 uppercase select-none mb-1 px-1">
                <span>GRID: SM-01</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-[#C5A880] animate-pulse" />
                  SOCIETY PORTAL
                </span>
              </div>

              {/* Segmented Control Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-2xl mb-4 mt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('blueprint')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    viewMode === 'blueprint'
                      ? 'bg-white dark:bg-gray-900 text-[#C5A880] shadow-sm font-extrabold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('interactive')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    viewMode === 'interactive'
                      ? 'bg-white dark:bg-gray-900 text-[#C5A880] shadow-sm font-extrabold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  Live Map
                </button>
              </div>

              {/* Map Preview container holding either static preview or Google Maps iframe */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-gray-150 dark:border-gray-800 flex items-center justify-center">
                
                {viewMode === 'blueprint' ? (
                  // Blueprint view
                  <div 
                    onClick={() => {
                      setZoomScale(1);
                      setIsLightboxOpen(true);
                    }}
                    className="relative w-full h-full cursor-pointer group/blueprint"
                  >
                    <img
                      src={masterPlanImg}
                      alt="Official Sahara City Renala Khurd Master Plan"
                      className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover/blueprint:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Ambient dark vignette gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover/blueprint:opacity-40 transition-opacity duration-500" />

                    {(settings?.masterPlanImage || settings?.masterPlanPdf) && (
                      <div className="absolute top-3 left-3 bg-[#090E16]/90 text-[#C5A880] backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider flex items-center gap-1.5 border border-[#C5A880]/30 shadow-md">
                        <Sparkles className="h-3 w-3 text-[#C5A880] animate-pulse" />
                        <span>OFFICIAL PUBLISHED PLAN</span>
                      </div>
                    )}

                    {/* Animated interactive zoom overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 opacity-0 group-hover/blueprint:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                      <div className="p-3 bg-[#C5A880] text-[#090E16] rounded-full shadow-lg scale-75 group-hover/blueprint:scale-100 transition-transform duration-500">
                        <Maximize2 className="h-6 w-6" />
                      </div>
                      <span className="text-white font-mono text-[10px] font-bold uppercase tracking-widest mt-3.5">
                        Expand Fullscreen
                      </span>
                      <span className="text-gray-300 text-[9px] px-6 text-center mt-1 font-light leading-relaxed">
                        Interactive zoom & high-res blueprint viewer
                      </span>
                    </div>
                  </div>
                ) : (
                  // Google Maps Iframe view
                  <div className="w-full h-full relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13689.601053158485!2d73.59124434999999!3d30.88126865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392297eb098939c3%3A0xe10ad019ca0ba7e1!2sSahara%20Model%20City!5e0!3m2!1sen!2s!4v1716254400000!5m2!1sen!2s"
                      className="w-full h-full border-0 rounded-2xl"
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Sahara Model City Renala Khurd Live Location Map"
                    />
                    
                    {/* Floating hint on live map */}
                    <div className="absolute bottom-3 left-3 bg-[#090E16]/85 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider flex items-center gap-1.5 border border-[#C5A880]/20 pointer-events-none shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>LIVE LOCATION MAP</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Footer Details depending on view mode */}
              {viewMode === 'blueprint' ? (
                /* Card Footer detail with Map Legend items */
                <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="space-y-0.5">
                    <span className="block text-gray-400 uppercase">Phase A & B</span>
                    <span className="block font-bold text-gray-900 dark:text-white">Allocations</span>
                  </div>
                  <div className="space-y-0.5 border-l border-r border-gray-100 dark:border-gray-800">
                    <span className="block text-gray-400 uppercase">N5 GT Highway</span>
                    <span className="block font-bold text-emerald-500">Access</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-gray-400 uppercase">Document Ref</span>
                    <span className="block font-bold text-[#C5A880]">SC-MP2026</span>
                  </div>
                </div>
              ) : (
                /* Interactive Landmarks List showing proximity to Renala Khurd landmarks */
                <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800 space-y-2.5 text-left">
                  <span className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                    Proximity to Key Landmarks:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100/50 dark:border-gray-800">
                      <div className="p-1 bg-[#C5A880]/10 text-[#C5A880] rounded-lg shrink-0">
                        <Navigation className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">GT Road Bypass</span>
                        <span className="block text-[9px] font-mono text-gray-400">~0.5 km (1 min)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100/50 dark:border-gray-800">
                      <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                        <Building className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">Mitchell's Farms</span>
                        <span className="block text-[9px] font-mono text-gray-400">~1.5 km (3 min)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100/50 dark:border-gray-800">
                      <div className="p-1 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                        <Compass className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">Railway Station</span>
                        <span className="block text-[9px] font-mono text-gray-400">~3.0 km (5 min)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100/50 dark:border-gray-800">
                      <div className="p-1 bg-[#C5A880]/10 text-[#C5A880] rounded-lg shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">Ganga Power House</span>
                        <span className="block text-[9px] font-mono text-gray-400">~4.5 km (8 min)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* FULLSCREEN BLUEPRINT LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6 animate-fade-in font-sans">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C5A880] text-black rounded-xl">
                <MapIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider">
                  Sahara City Renala Khurd — Master Plan Blueprint
                </h3>
                <span className="text-[10px] text-[#C5A880] font-mono uppercase tracking-widest block">
                  Interactive Resolution Mode • Zoom ({Math.round(zoomScale * 100)}%)
                </span>
              </div>
            </div>

            {/* Action controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))}
                className="p-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl border border-gray-800 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4.5 w-4.5 text-[#C5A880]" />
              </button>
              <button
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl border border-gray-800 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4.5 w-4.5 text-[#C5A880]" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="p-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl border border-gray-800 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="h-4.5 w-4.5 text-gray-400" />
              </button>

              <div className="h-6 w-px bg-gray-800 mx-1" />

              <button
                onClick={handleDownloadImage}
                className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-xl border border-gray-800 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-4 w-4 text-[#C5A880]" />
                <span className="hidden sm:inline">Image</span>
              </button>

              <button
                onClick={handleOpenPDF}
                disabled={generating}
                className="bg-[#C5A880] hover:bg-[#b8976d] text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <FileText className="h-4 w-4" />
                <span>{generating ? 'PDF...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-colors cursor-pointer ml-2"
                title="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 my-2 select-none">
            <div 
              className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={masterPlanImg}
                alt="Master Plan Fullscreen High-Res Blueprint"
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-gray-800"
              />
            </div>
          </div>

          {/* Lightbox Footer Bar */}
          <div className="border-t border-gray-800 pt-3 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 font-mono gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Official Master Plan Document • Verification Code: SC-MP2026</span>
            </div>
            <span>Use Zoom Controls or Click Download to save offline layout files.</span>
          </div>
        </div>
      )}
    </section>
  );
}
