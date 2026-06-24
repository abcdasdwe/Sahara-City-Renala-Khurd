import { useState } from 'react';
import { Sun, Moon, Menu, X, Building2, Calculator, Settings, Scale, MessageSquare, BookOpen, Heart, FileText } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  wishlistCount: number;
}

export default function Navbar({ currentTab, setCurrentTab, darkMode, setDarkMode, wishlistCount }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'properties', label: 'Properties' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'compare', label: 'Compare' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'blog', label: 'Blog' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQs' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 bg-[#090E16]/90 backdrop-blur-md border-b border-[#C5A880]/15 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22">
          
          {/* Logo Brand Panel */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="p-1 rounded-full bg-gradient-to-br from-[#0F1A2C] to-[#C5A880]/20 border border-[#C5A880]/40 shadow-lg overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Sahara Developers Logo" className="h-8 w-8 object-contain rounded-full" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="block font-serif text-xl font-bold uppercase tracking-widest text-[#F4F6F9]">
                Sahara <span className="text-[#C5A880] italic font-medium">City</span>
              </span>
              <span className="block font-sans text-[9px] uppercase tracking-[0.25em] text-[#C5A880]/80 -mt-0.5 font-medium">
                Renala Khurd
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  currentTab === item.id
                    ? 'text-[#090E16] bg-[#C5A880] shadow-md shadow-[#C5A880]/20'
                    : 'text-gray-300 hover:text-[#C5A880] hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Action Icons Panel */}
          <div className="hidden lg:flex items-center gap-3.5">
            {/* Wishlist Indicators */}
            <button
              onClick={() => handleNavClick('properties')}
              className="relative p-2 rounded-lg border border-[#C5A880]/20 text-[#C5A880] bg-white/5 hover:border-[#C5A880]/60 transition-colors cursor-pointer"
              title="My Saved Wishlist"
            >
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#090E16]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Theme Toggle - Visual Only standard dark preset */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/5 border border-[#C5A880]/20 hover:bg-white/10 text-[#C5A880] hover:text-[#C5A880] transition-all duration-300 cursor-pointer"
              aria-label="Toggle Theme"
              id="theme-toggle-btn"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle Actions */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Wishlist Indicator Micro */}
            <button
              onClick={() => handleNavClick('properties')}
              className="relative p-2 text-gray-300"
            >
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-amber-500"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:bg-white/5 rounded-lg"
              id="mobile-drawer-btn"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden block border-t border-[#C5A880]/15 bg-[#090E16] animate-fade-in py-4 px-4 shadow-xl">
          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-colors ${
                  currentTab === item.id
                    ? 'text-[#090E16] bg-[#C5A880]'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
