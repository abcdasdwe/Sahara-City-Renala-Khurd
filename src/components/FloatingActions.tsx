import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, ArrowUp, Send, CheckCircle, X, HelpCircle } from 'lucide-react';
import { dbPut } from '../lib/db';
import { Lead } from '../types';

interface FloatingActionsProps {
  whatsappNumber: string;
  contactPhone: string;
  onLeadSubmitted?: () => void;
}

export default function FloatingActions({ whatsappNumber, contactPhone, onLeadSubmitted }: FloatingActionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('I am interested in Sahara City Renala Khurd. Please provide detail catalogs.');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      message,
      status: 'New',
      createdDate: new Date().toISOString().split('T')[0]
    };

    try {
      await dbPut('leads', newLead);
      setSubmitted(true);
      if (onLeadSubmitted) onLeadSubmitted();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        // Reset
        setName('');
        setEmail('');
        setPhone('');
        setMessage('I am interested in Sahara City Renala Khurd. Please provide detail catalogs.');
      }, 2500);
    } catch (err) {
      console.error('Error saving lead:', err);
    }
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum,%20I%20am%20interested%20in%20Sahara%20City%20Renala%20Khurd%20Properties.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer group"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="h-5 w-5 fill-white" />
          <span className="absolute right-14 bg-emerald-500 text-white font-sans text-xs font-semibold px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            WhatsApp Active
          </span>
        </a>

        {/* Call Representative */}
        <a
          href={`tel:${contactPhone}`}
          className="flex items-center justify-center h-12 w-12 rounded-full bg-[#0F1A2C] hover:bg-[#162740] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-[#C5A880] dark:text-[#090E16] shadow-lg shadow-black/20 transition-all hover:scale-105 cursor-pointer group"
          title="Call Now"
        >
          <Phone className="h-5 w-5 fill-current" />
          <span className="absolute right-14 bg-[#0F1A2C] text-[#C5A880] font-sans text-xs font-semibold px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Call Representative
          </span>
        </a>

        {/* Quick Inquiry Pop-Up Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center h-12 w-12 rounded-full bg-[#C5A880] hover:bg-[#b8976d] text-[#0F1A2C] shadow-lg shadow-[#C5A880]/20 transition-all hover:scale-105 cursor-pointer group"
          title="Quick Property Inquiry"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="absolute right-14 bg-[#C5A880] text-[#0F1A2C] font-sans text-xs font-semibold px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Quick Inquiry
          </span>
        </button>

        {/* Back To Top Scroll */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center h-11 w-11 rounded-full bg-white dark:bg-[#000000] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-md transition-all hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            title="Scroll To Top"
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Quick Inquiry Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0F1A2C] border border-[#C5A880]/30 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {!submitted ? (
              <form onSubmit={handleInquirySubmit} className="space-y-4 font-sans text-left">
                <div className="text-center pb-2">
                  <div className="h-12 w-12 bg-[#C5A880]/15 text-[#C5A880] rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Quick Inquiry Form
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submit your query. Our agent will respond shortly.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0321-2099125"
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F1A2C] hover:bg-[#15253f] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-semibold text-sm transition-all py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Submit Inquiry
                </button>
              </form>
            ) : (
              <div className="text-center font-sans py-8 space-y-3">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Inquiry Dispatched!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Your details have been successfully saved into our IndexedDB repository. The Sahara City Sales Admin will view it shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
