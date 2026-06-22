import { useState } from 'react';
import { Scale, Trash2, LayoutGrid, Tag, Maximize2, Bed, Bath, Activity, Compass, Map, Check } from 'lucide-react';
import { Property } from '../types';

interface PropertyCompareProps {
  properties: Property[];
  setCurrentTab: (tab: string) => void;
  setSelectedPropertyId: (id: string) => void;
}

export default function PropertyCompare({ properties, setCurrentTab, setSelectedPropertyId }: PropertyCompareProps) {
  const [slot1, setSlot1] = useState<string>('SC-P01'); // default selection
  const [slot2, setSlot2] = useState<string>('SC-V02');
  const [slot3, setSlot3] = useState<string>('');

  const p1 = properties.find(p => p.id === slot1) || null;
  const p2 = properties.find(p => p.id === slot2) || null;
  const p3 = properties.find(p => p.id === slot3) || null;

  const navigateToDetails = (id: string) => {
    setSelectedPropertyId(id);
    setCurrentTab('property-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#090E16] text-[#F4F6F9]">
      
      {/* Header */}
      <div className="border-b border-[#C5A880]/15 pb-6 mb-10 text-left">
        <span className="text-[#C5A880] text-xs font-bold uppercase tracking-widest bg-[#C5A880]/10 py-1 px-3.5 border border-[#C5A880]/35 rounded-full inline-block font-mono">UTILITY TOOL</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white flex items-center gap-3 mt-3">
          <Scale className="h-8 w-8 text-[#C5A880]" />
          Sahara <span className="text-[#C5A880] italic font-medium">Comparison Engine</span>
        </h1>
        <p className="text-gray-450 mt-2 max-w-2xl text-xs sm:text-sm">
          Select up to 3 properties to compare pricing, development areas, bedroom counts, purposes, and installment criteria side by side.
        </p>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
        
        {/* Slot 1 Selector */}
        <div className="bg-[#0F1A2C] border border-[#C5A880]/10 p-5 rounded-2xl shadow-xl">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-[#C5A880]">
            <span className="flex h-5 w-5 rounded-full bg-[#C5A880]/15 text-[#C5A880] items-center justify-center font-mono font-bold text-[10px]">1</span>
            Compare Property A
          </label>
          <select
            value={slot1}
            onChange={(e) => setSlot1(e.target.value)}
            className="w-full bg-[#090E16] border border-[#C5A880]/15 rounded-xl py-2.5 px-3 text-xs text-white font-semibold focus:outline-none focus:border-[#C5A880]"
          >
            <option value="" className="bg-[#090E16]">-- Choose None --</option>
            {properties.map(p => (
              <option key={p.id} value={p.id} className="bg-[#090E16] text-white">[{p.id}] {p.title}</option>
            ))}
          </select>
        </div>

        {/* Slot 2 Selector */}
        <div className="bg-[#0F1A2C] border border-[#C5A880]/10 p-5 rounded-2xl shadow-xl">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-sky-400">
            <span className="flex h-5 w-5 rounded-full bg-sky-500/10 text-sky-400 items-center justify-center font-mono font-bold text-[10px]">2</span>
            Compare Property B
          </label>
          <select
            value={slot2}
            onChange={(e) => setSlot2(e.target.value)}
            className="w-full bg-[#090E16] border border-[#C5A880]/15 rounded-xl py-2.5 px-3 text-xs text-white font-semibold focus:outline-none focus:border-[#C5A880]"
          >
            <option value="" className="bg-[#090E16]">-- Choose None --</option>
            {properties.map(p => (
              <option key={p.id} value={p.id} className="bg-[#090E16] text-white">[{p.id}] {p.title}</option>
            ))}
          </select>
        </div>

        {/* Slot 3 Selector */}
        <div className="bg-[#0F1A2C] border border-[#C5A880]/10 p-5 rounded-2xl shadow-xl">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-indigo-400">
            <span className="flex h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-400 items-center justify-center font-mono font-bold text-[10px]">3</span>
            Compare Property C
          </label>
          <select
            value={slot3}
            onChange={(e) => setSlot3(e.target.value)}
            className="w-full bg-[#090E16] border border-[#C5A880]/15 rounded-xl py-2.5 px-3 text-xs text-white font-semibold focus:outline-none focus:border-[#C5A880]"
          >
            <option value="" className="bg-[#090E16]">-- Choose None --</option>
            {properties.map(p => (
              <option key={p.id} value={p.id} className="bg-[#090E16] text-white">[{p.id}] {p.title}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Comparison Matrix Grid Card */}
      {(!p1 && !p2 && !p3) ? (
        <div className="text-center py-20 bg-[#0F1A2C] border border-dashed border-[#C5A880]/15 rounded-3xl">
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Please pick at least one physical property inside the selectors above to initiate analytical comparisons.
          </p>
        </div>
      ) : (
        <div className="bg-[#0F1A2C] border border-[#C5A880]/10 rounded-2xl shadow-2xl overflow-hidden text-left">
          
          <div className="grid grid-cols-4 bg-[#090E16] text-[#C5A880] text-[10px] font-bold uppercase tracking-widest p-4 border-b border-[#C5A880]/15">
            <div>Comparison Metrics</div>
            <div className="text-[#C5A880]">Property A</div>
            <div className="text-sky-400">Property B</div>
            <div className="text-indigo-400">Property C</div>
          </div>

          <div className="divide-y divide-white/5 font-sans">
            
            {/* Aspect: Mini Card Header with Images */}
            <div className="grid grid-cols-4 p-4 items-start">
              <div style={{ color: '#e2e8ee' }} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center font-mono">Media Showcase</div>
              {/* Product A */}
              <div>
                {p1 ? (
                  <div className="space-y-2 pr-4">
                    <img src={p1.images[0]} alt={p1.title} referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-xl border border-white/5 shadow-sm" />
                    <h3 style={{ color: '#eee1e1' }} className="text-xs font-bold leading-tight line-clamp-2 text-white">{p1.title}</h3>
                    <span className="text-[9px] font-bold tracking-widest uppercase bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/15 px-2 py-0.5 rounded font-mono">{p1.id}</span>
                  </div>
                ) : <span className="text-gray-500 text-xs italic">Unselected</span>}
              </div>
              {/* Product B */}
              <div>
                {p2 ? (
                  <div className="space-y-2 pr-4">
                    <img src={p2.images[0]} alt={p2.title} referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-xl border border-white/5 shadow-sm" />
                    <h3 style={{ color: '#f8f0f0' }} className="text-xs font-bold leading-tight line-clamp-2 text-white">{p2.title}</h3>
                    <span className="text-[9px] font-bold tracking-widest uppercase bg-sky-500/10 text-sky-400 border border-sky-500/15 px-2 py-0.5 rounded font-mono">{p2.id}</span>
                  </div>
                ) : <span className="text-gray-500 text-xs italic">Unselected</span>}
              </div>
              {/* Product C */}
              <div>
                {p3 ? (
                  <div className="space-y-2 pr-4">
                    <img src={p3.images[0]} alt={p3.title} referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-xl border border-white/5 shadow-sm" />
                    <h3 className="text-xs font-bold leading-tight line-clamp-2 text-white">{p3.title}</h3>
                    <span className="text-[9px] font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded font-mono">{p3.id}</span>
                  </div>
                ) : <span style={{ color: '#d1d9e4' }} className="text-gray-500 text-xs italic">Unselected</span>}
              </div>
            </div>

            {/* Aspect: Price */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Tag className="h-4 w-4 text-[#C5A880]" /> Market Price</div>
              <div className="text-[#C5A880] font-black text-sm sm:text-base font-mono">{p1 ? `PKR ${p1.price.toLocaleString()}` : '-'}</div>
              <div className="text-sky-400 font-black text-sm sm:text-base font-mono">{p2 ? `PKR ${p2.price.toLocaleString()}` : '-'}</div>
              <div className="text-indigo-400 font-black text-sm sm:text-base font-mono">{p3 ? `PKR ${p3.price.toLocaleString()}` : '-'}</div>
            </div>

            {/* Aspect: Type */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><LayoutGrid className="h-4 w-4 text-[#C5A880]" /> Property Type</div>
              <div className="text-gray-200">{p1 ? p1.propertyType : '-'}</div>
              <div className="text-gray-200">{p2 ? p2.propertyType : '-'}</div>
              <div className="text-gray-200">{p3 ? p3.propertyType : '-'}</div>
            </div>

            {/* Aspect: Purpose */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Activity className="h-4 w-4 text-[#C5A880]" /> Sales Purpose</div>
              <div>
                {p1 ? (
                  <span style={{ backgroundColor: '#f4eee6', color: '#7a603c' }} className="inline-block px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full font-bold">{p1.purpose}</span>
                ) : '-'}
              </div>
              <div>
                {p2 ? (
                  <span style={{ backgroundColor: '#cde0e8' }} className="inline-block px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full font-bold text-sky-450">{p2.purpose}</span>
                ) : '-'}
              </div>
              <div>
                {p3 ? (
                  <span className="inline-block px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full font-bold bg-indigo-500/15 text-indigo-400">{p3.purpose}</span>
                ) : '-'}
              </div>
            </div>

            {/* Aspect: Area */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Maximize2 className="h-4 w-4 text-[#C5A880]" /> Land Area</div>
              <div style={{ color: '#f1e3e3' }} className="font-bold font-mono">{p1 ? p1.area : '-'}</div>
              <div style={{ color: '#e1d1d1' }} className="font-bold font-mono">{p2 ? p2.area : '-'}</div>
              <div className="text-white font-bold font-mono">{p3 ? p3.area : '-'}</div>
            </div>

            {/* Aspect: Bedrooms */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Bed className="h-4 w-4 text-[#C5A880]" /> Bedrooms</div>
              <div className="text-gray-300">{p1 ? (p1.bedrooms > 0 ? `${p1.bedrooms} Beds` : 'Plot Matrix') : '-'}</div>
              <div className="text-gray-300">{p2 ? (p2.bedrooms > 0 ? `${p2.bedrooms} Beds` : 'Plot Matrix') : '-'}</div>
              <div className="text-gray-300">{p3 ? (p3.bedrooms > 0 ? `${p3.bedrooms} Beds` : 'Plot Matrix') : '-'}</div>
            </div>

            {/* Aspect: Bathrooms */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Bath className="h-4 w-4 text-[#C5A880]" /> Bathrooms</div>
              <div className="text-gray-300">{p1 ? (p1.bathrooms > 0 ? `${p1.bathrooms} Baths` : 'Plot Matrix') : '-'}</div>
              <div className="text-gray-300">{p2 ? (p2.bathrooms > 0 ? `${p2.bathrooms} Baths` : 'Plot Matrix') : '-'}</div>
              <div className="text-gray-300">{p3 ? (p3.bathrooms > 0 ? `${p3.bathrooms} Baths` : 'Plot Matrix') : '-'}</div>
            </div>

            {/* Role: Status */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Activity className="h-4 w-4 text-[#C5A880]" /> Status</div>
              <div>{p1 ? <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">{p1.status}</span> : '-'}</div>
              <div>{p2 ? <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{p2.status}</span> : '-'}</div>
              <div>{p3 ? <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{p3.status}</span> : '-'}</div>
            </div>

            {/* Aspect: Installments availability */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono"><Compass className="h-4 w-4 text-[#C5A880]" /> Installments?</div>
              <div>
                {p1 ? (
                  p1.installmentDetails ? (
                    <div className="text-xs space-y-0.5 text-emerald-400">
                      <p className="font-bold">Yes (Plan Available)</p>
                      <p className="text-[10px] font-mono text-gray-400">DP: {p1.installmentDetails.downPayment.toLocaleString()}</p>
                    </div>
                  ) : <span className="text-xs text-gray-500">Cash-only purchase</span>
                ) : '-'}
              </div>
              <div>
                {p2 ? (
                  p2.installmentDetails ? (
                    <div className="text-xs space-y-0.5 text-emerald-400">
                      <p className="font-bold">Yes (Plan Available)</p>
                      <p className="text-[10px] font-mono text-gray-400">DP: {p2.installmentDetails.downPayment.toLocaleString()}</p>
                    </div>
                  ) : <span className="text-xs text-gray-500">Cash-only purchase</span>
                ) : '-'}
              </div>
              <div>
                {p3 ? (
                  p3.installmentDetails ? (
                    <div className="text-xs space-y-0.5 text-emerald-400">
                      <p className="font-bold">Yes (Plan Available)</p>
                      <p className="text-[10px] font-mono text-gray-400">DP: {p3.installmentDetails.downPayment.toLocaleString()}</p>
                    </div>
                  ) : <span className="text-xs text-gray-500">Cash-only purchase</span>
                ) : '-'}
              </div>
            </div>

            {/* Aspect: Action redirects */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold items-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Client Actions</div>
              <div>
                {p1 ? (
                  <button
                    onClick={() => navigateToDetails(p1.id)}
                    className="py-1.5 px-3 bg-[#090E16] hover:bg-[#C5A880] text-[#C5A880] hover:text-[#090E16] border border-[#C5A880]/35 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all max-w-full cursor-pointer truncate"
                  >
                    View Details A
                  </button>
                ) : '-'}
              </div>
              <div>
                {p2 ? (
                  <button
                    onClick={() => navigateToDetails(p2.id)}
                    className="py-1.5 px-3 bg-[#090E16] hover:bg-sky-500 text-sky-400 hover:text-[#090E16] border border-sky-500/35 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all max-w-full cursor-pointer truncate"
                  >
                    View Details B
                  </button>
                ) : '-'}
              </div>
              <div>
                {p3 ? (
                  <button
                    onClick={() => navigateToDetails(p3.id)}
                    className="py-1.5 px-3 bg-[#090E16] hover:bg-indigo-500 text-indigo-400 hover:text-[#090E16] border border-indigo-500/35 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all max-w-full cursor-pointer truncate"
                  >
                    View Details C
                  </button>
                ) : '-'}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
