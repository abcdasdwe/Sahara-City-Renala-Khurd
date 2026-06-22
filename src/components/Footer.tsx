import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  footerCopyrightText: string;
}

export default function Footer({ setCurrentTab, contactAddress, contactPhone, contactEmail, footerCopyrightText }: FooterProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleLinkClick = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
    }, 4000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <footer className="bg-[#090E16] text-gray-400 font-sans border-t border-[#C5A880]/15 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-left">
          
          {/* Column 1: Brand details & brief intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleLinkClick('home')}>
              <div className="p-2 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/50 inline-block">
                <Building2 className="h-5 w-5 text-[#C5A880]" />
              </div>
              <span className="font-serif text-lg font-bold uppercase tracking-widest text-[#F4F6F9]">
                Sahara <span className="text-[#C5A880] italic font-medium">City</span>
              </span>
            </div>
            
            <p className="text-xs leading-relaxed text-gray-450">
              The premier gated society of Renala Khurd (Sahiwal Div.), supplying ultimate living standards, high-security facilities, spacious parks, outstanding schools, mosques, and flexible installment plots.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#C5A880] hover:text-[#090E16] transition-all rounded-lg text-gray-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#C5A880] hover:text-[#090E16] transition-all rounded-lg text-gray-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#C5A880] hover:text-[#090E16] transition-all rounded-lg text-gray-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#C5A880] hover:text-[#090E16] transition-all rounded-lg text-gray-300">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-[#C5A880] text-xs font-bold uppercase tracking-widest border-l-2 border-[#C5A880] pl-2.5">
              Useful Directory
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'properties', label: 'VIP Plots & Villas' },
                { id: 'calculator', label: 'Payment Calculator' },
                { id: 'compare', label: 'Property Comparison' },
                { id: 'gallery', label: 'Society Media' },
                { id: 'blog', label: 'Investment Blog' },
                { id: 'about', label: 'Who We Are' },
                { id: 'reviews', label: 'Customer Reviews' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="hover:text-[#C5A880] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowRight className="h-3 w-3 text-[#C5A880]" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact coordinates */}
          <div className="space-y-4">
            <h3 className="text-[#C5A880] text-xs font-bold uppercase tracking-widest border-l-2 border-[#C5A880] pl-2.5">
              Contact Sahara City
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-[#C5A880] shrink-0" />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-[#C5A880] shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter formulation */}
          <div className="space-y-4">
            <h3 className="text-[#C5A880] text-xs font-bold uppercase tracking-widest border-l-2 border-[#C5A880] pl-2.5">
              Newsletter Sign Up
            </h3>
            <p className="text-[11px] text-gray-400">
              Get weekly updates on plot launching events, price reviews, and development notifications.
            </p>
            {isSubscribed ? (
              <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-xl text-[11px] text-[#C5A880] tracking-wide animate-fade-in font-medium">
                ✓ Successfully subscribed! Check your inbox for society updates soon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none focus:border-[#C5A880] text-white placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] px-2.5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Divider and copyright details */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-gray-500">
            {footerCopyrightText}
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => handleLinkClick('privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <span className="text-gray-700">|</span>
            <button onClick={() => handleLinkClick('terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

