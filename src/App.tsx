import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, MapPin, Bed, Bath, Heart, Scale, Info, ArrowRight, 
  Phone, Mail, Check, Star, HelpCircle, FileText, Send, Calendar, ChevronRight,
  ShieldCheck, Share2, Compass, Award, ExternalLink, SlidersHorizontal, Image as ImageIcon,
  LogOut, Sun, Moon
} from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import InstallmentCalc from './components/InstallmentCalc';
import PropertyCompare from './components/PropertyCompare';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import SEOHead from './components/SEOHead';
import { faqList } from './faqData';
import { Property, Lead, Review, Blog, MediaItem, AppSettings } from './types';
import { dbGetAll, dbPut, getSettings, seedDatabaseIfEmpty } from './lib/db';
import { generatePropertyPDF } from './lib/pdfGenerator';

export default function App() {
  // Navigation states
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    const hash = window.location.hash;

    const isLoginPath = path === '/login' || 
                        path === '/login.html' || 
                        path.endsWith('login.html') || 
                        pageParam === 'login' || 
                        hash === '#/login' || 
                        hash === '#/login.html';

    if (isLoginPath) return 'login';

    const isAdminPath = path.startsWith('/admin') || 
                        pageParam === 'admin' || 
                        hash.startsWith('#/admin');

    if (isAdminPath) {
      const token = localStorage.getItem('sahara_admin_token');
      const expiry = localStorage.getItem('sahara_admin_expiry');
      const isAuth = !!(token && expiry && Date.now() < Number(expiry));
      if (!isAuth) {
        window.location.replace('/login.html');
        return 'login';
      }
      return 'admin';
    }
    return 'home';
  });

  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'dashboard' | 'properties' | 'leads' | 'reviews' | 'blogs' | 'media' | 'settings' | 'utility' | 'seo'>(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    const tabParam = searchParams.get('tab');
    const hash = window.location.hash;

    if (tabParam && ['dashboard', 'properties', 'leads', 'reviews', 'blogs', 'media', 'settings', 'utility', 'seo'].includes(tabParam)) {
      return tabParam as any;
    }

    if (hash.startsWith('#/admin/')) {
      const sub = hash.replace('#/admin/', '').trim();
      if (['dashboard', 'properties', 'leads', 'reviews', 'blogs', 'media', 'settings', 'utility', 'seo'].includes(sub)) {
        return sub as any;
      }
    }

    if (path.startsWith('/admin/')) {
      const sub = path.replace('/admin/', '').trim();
      if (['dashboard', 'properties', 'leads', 'reviews', 'blogs', 'media', 'settings', 'utility', 'seo'].includes(sub)) {
        return sub as any;
      }
    }
    return 'dashboard';
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('SC-P01');
  const [selectedBlogId, setSelectedBlogId] = useState<string>('blog-01');

  // Intercept paths and enforce auth guards on change or popstate
  useEffect(() => {
    const checkRouteAndGuard = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      const tabParam = searchParams.get('tab');
      const hash = window.location.hash;

      const token = localStorage.getItem('sahara_admin_token');
      const expiry = localStorage.getItem('sahara_admin_expiry');
      const isAuth = !!(token && expiry && Date.now() < Number(expiry));

      const isLoginPath = path === '/login' || 
                          path === '/login.html' || 
                          path.endsWith('login.html') || 
                          pageParam === 'login' || 
                          hash === '#/login' || 
                          hash === '#/login.html';

      const isAdminPath = path.startsWith('/admin') || 
                          pageParam === 'admin' || 
                          hash.startsWith('#/admin');

      if (isLoginPath) {
        if (isAuth) {
          window.history.replaceState(null, '', '/?page=admin&tab=dashboard');
          setCurrentTab('admin');
          setAdminActiveSubTab('dashboard');
        } else {
          setCurrentTab('login');
        }
      } else if (isAdminPath) {
        if (!isAuth) {
          window.location.replace('/login.html');
        } else {
          setCurrentTab('admin');
          // Parse subtab
          let sub: string | null = tabParam;
          if (!sub && hash.startsWith('#/admin/')) {
            sub = hash.replace('#/admin/', '').trim();
          }
          if (!sub && path.startsWith('/admin/')) {
            sub = path.replace('/admin/', '').trim();
          }

          if (sub && ['dashboard', 'properties', 'leads', 'reviews', 'blogs', 'media', 'settings', 'utility', 'seo'].includes(sub)) {
            setAdminActiveSubTab(sub as any);
          } else {
            setAdminActiveSubTab('dashboard');
          }
        }
      } else {
        // It's a public path
        if (path === '/') {
          if (pageParam === 'login' && !isAuth) {
            setCurrentTab('login');
          }
        }
      }
    };

    checkRouteAndGuard();
    window.addEventListener('popstate', checkRouteAndGuard);

    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      checkRouteAndGuard();
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      checkRouteAndGuard();
    };

    return () => {
      window.removeEventListener('popstate', checkRouteAndGuard);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Session Expiration Heartbeat
  useEffect(() => {
    const checkSessionExpiry = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      
      const isAdminPath = path.startsWith('/admin') || 
                          pageParam === 'admin' || 
                          window.location.hash.startsWith('#/admin');

      if (isAdminPath) {
        const expiry = localStorage.getItem('sahara_admin_expiry');
        if (expiry && Date.now() > Number(expiry)) {
          localStorage.removeItem('sahara_admin_token');
          localStorage.removeItem('sahara_admin_expiry');
          window.location.replace('/login.html?session=expired');
        }
      }
    };

    const interval = setInterval(checkSessionExpiry, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahara_dark_mode');
    return saved ? saved === 'true' : true; // Default to eye-care dark theme
  });

  // DB States
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Search Widgets states on Home/Properties list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterPurpose, setFilterPurpose] = useState('All');
  const [filterBedrooms, setFilterBedrooms] = useState('All');
  const [filterMaxPrice, setFilterMaxPrice] = useState<number>(10000000);

  // Gallery categories filters
  const [galleryCategory, setGalleryCategory] = useState('All');

  // FAQs active questions search
  const [faqSearch, setFaqSearch] = useState('');

  // Wishlist and comparisons arrays stored persistently
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sahara_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Lightbox view state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Contact quick inquiry states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(false);

  // Init & Sync Data from browser IndexedDB
  const refreshDatabaseData = async () => {
    try {
      await seedDatabaseIfEmpty();
      
      const p = await dbGetAll<Property>('properties');
      const l = await dbGetAll<Lead>('leads');
      const r = await dbGetAll<Review>('reviews');
      const b = await dbGetAll<Blog>('blogs');
      const m = await dbGetAll<MediaItem>('media');
      const s = await getSettings();

      setProperties(p.sort((a,b) => b.createdDate.localeCompare(a.createdDate)));
      setLeads(l.sort((a,b) => b.createdDate.localeCompare(a.createdDate)));
      setReviews(r.sort((a,b) => b.createdDate.localeCompare(a.createdDate)));
      setBlogs(b.sort((a,b) => b.createdDate.localeCompare(a.createdDate)));
      setMedia(m);
      setSettings(s);
    } catch (err) {
      console.error('Error fetching data from IndexedDB database stores:', err);
    }
  };

  useEffect(() => {
    refreshDatabaseData();
  }, []);

  // Update theme tag on document element for tailwind v4 class integration
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('sahara_dark_mode', String(darkMode));
  }, [darkMode]);

  // Wishlist handler
  const handleToggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    localStorage.setItem('sahara_wishlist', JSON.stringify(updated));
  };

  // Inquiry Submission Handler on Property Details View and Contact View
  const handleInquirySubmit = async (e: React.FormEvent, propertyId?: string, propertyName?: string) => {
    e.preventDefault();
    const name = propertyId ? contactName : contactName || 'General Contact Customer';
    const email = contactEmail;
    const phone = contactPhone;
    const msg = contactMessage || `Inquiry for ${propertyName || 'Sahara City Renala Khurd Properties'}`;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      propertyId,
      propertyName,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      message: msg,
      status: 'New',
      createdDate: new Date().toISOString().split('T')[0]
    };

    try {
      await dbPut('leads', newLead);
      setContactStatus(true);
      refreshDatabaseData();
      setTimeout(() => {
        setContactStatus(false);
        // Clear
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving lead inquiry:', err);
    }
  };

  // Review submissions pipeline
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      customerName: reviewName,
      email: reviewEmail,
      rating: reviewRating,
      comment: reviewComment,
      isApproved: false, // Must remain pending until approved by admin
      createdDate: new Date().toISOString().split('T')[0]
    };

    try {
      await dbPut('reviews', newRev);
      setReviewSubmitted(true);
      refreshDatabaseData();
      setTimeout(() => {
        setReviewSubmitted(false);
        setReviewName('');
        setReviewEmail('');
        setReviewComment('');
      }, 4000);
    } catch (err) {
      console.error('Error saving review testimonial:', err);
    }
  };

  // Property Detail selectors helper
  const handleViewPropertyDetails = (id: string) => {
    setSelectedPropertyId(id);
    setCurrentTab('property-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Record listing view trigger
    const targetProp = properties.find(p => p.id === id);
    if (targetProp) {
      dbPut('properties', { ...targetProp, views: (targetProp.views || 0) + 1 });
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans bg-[#090E16] text-[#C5A880]">
        <div className="text-center space-y-3">
          <Building2 className="h-12 w-12 mx-auto animate-bounce" />
          <p className="text-sm font-bold uppercase tracking-widest">Sahara City Relational Grid Loading...</p>
        </div>
      </div>
    );
  }

  // Active object references
  const currentProperty = properties.find(p => p.id === selectedPropertyId) || properties[0] || null;
  const currentBlog = blogs.find(b => b.id === selectedBlogId) || blogs[0] || null;

  if (currentTab === 'login') {
    return (
      <div className={darkMode ? 'dark bg-[#090E16] min-h-screen' : 'bg-[#F4F6F9] min-h-screen'}>
        <SEOHead view="login" />
        <AdminLogin 
          onLoginSuccess={() => {
            window.history.pushState(null, '', '/?page=admin&tab=dashboard');
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>
    );
  }

  if (currentTab === 'admin') {
    return (
      <div className={`transition-all duration-300 min-h-screen ${darkMode ? 'bg-[#090E16] text-slate-100' : 'bg-[#F4F6F9] text-gray-800'}`}>
        <div className={darkMode ? 'dark' : ''}>
          <SEOHead view="admin" />
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#C5A880]/15 border border-[#C5A880]/40 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-[#C5A880]" />
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-bold font-serif uppercase tracking-wider text-slate-900 dark:text-white">SAHARA CITY</h1>
                  <p className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">Admin CRM Console Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Theme switcher */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem('sahara_admin_token');
                    localStorage.removeItem('sahara_admin_expiry');
                    window.location.replace('/login.html');
                  }}
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>

            <AdminPanel 
              properties={properties} 
              leads={leads} 
              reviews={reviews} 
              blogs={blogs} 
              media={media} 
              settings={settings}
              onRefreshData={refreshDatabaseData}
              activeSubTab={adminActiveSubTab}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${darkMode ? 'bg-[#090E16] text-slate-100' : 'bg-[#F4F6F9] text-gray-800'}`}>
      
      {/* Dynamic SEO Header Injections */}
      <SEOHead view={currentTab} property={currentProperty} blog={currentBlog} />

      {/* Sticky header Navigation */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        wishlistCount={wishlist.length}
      />

      {/* Primary content area routing based on custom Tab states */}
      <main className="min-h-screen">
        
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="animate-fade-in font-sans">
            
            {/* Visual Header Grid Showcase */}
            <div 
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(9,14,22,0.85), rgba(9,14,22,0.9)), url(${settings.heroBackground})` }}
              className="bg-cover bg-center py-24 sm:py-32 px-4 text-center text-white border-b border-[#C5A880]/10 flex flex-col items-center justify-center"
            >
              <div className="max-w-4xl space-y-4">
                <span className="inline-block border border-[#C5A880] text-[#C5A880] text-[10px] sm:text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                  PREMIER LUXURY HOUSING SOCIETY
                </span>
                <h1 id="hero-main-title" className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-tight text-[#e5f1e3]">
                  Sahara Business City
                </h1>
                <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base font-light">
                  {settings.heroSubtitle}
                </p>
              </div>

              {/* Quick Search Widget */}
              <div className="mt-12 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 w-full max-w-5xl shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 text-white text-xs font-bold p-3 rounded-xl focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Residential Plot">Residential Plots</option>
                      <option value="Commercial Plot">Commercial Plots</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterPurpose}
                      onChange={(e) => setFilterPurpose(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 text-white text-xs font-bold p-3 rounded-xl focus:outline-none"
                    >
                      <option value="All">All Offerings</option>
                      <option value="For Sale">For Sale (Cash)</option>
                      <option value="Installment">Easy Installments</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="e.g. 5 Marla Corner..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 text-white text-xs p-3 pl-9 rounded-xl focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTab('properties');
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="w-full bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer p-3 transition-colors flex items-center justify-center gap-1"
                  >
                    <Search className="h-4 w-4" /> Search Slots
                  </button>
                </div>
              </div>

            </div>

            {/* Featured Properties grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10 border-b border-[#C5A880]/10 pb-4">
                <div>
                  <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider block">PREMIUM LISTINGS</span>
                  <h2 className="text-3xl font-bold font-sans tracking-tight text-gray-950 dark:text-white mt-1">Featured Real Estate Options</h2>
                </div>
                <button
                  onClick={() => setCurrentTab('properties')}
                  className="text-xs font-bold text-[#C5A880] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Retrieve All Plots <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {properties.slice(0, 3).map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => handleViewPropertyDetails(p.id)}
                    className="group bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-200">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-4 left-4 bg-[#0F1A2C] text-[#C5A880] border border-[#C5A880]/30 text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-md">
                        {p.purpose === 'Installment' ? 'On Installment' : p.purpose}
                      </span>
                      <button
                        onClick={(e) => handleToggleWishlist(p.id, e)}
                        className="absolute top-4 right-4 h-9 w-9 bg-black/40 backdrop-blur-xs text-white rounded-full flex items-center justify-center hover:bg-[#0F1A2C] transition-colors"
                        title="Save to Favorite"
                      >
                        <Heart className={`h-4.5 w-4.5 ${wishlist.includes(p.id) ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-white'}`} />
                      </button>
                    </div>

                    <div className="p-6 space-y-3">
                      <span className="text-[10px] font-bold bg-[#C5A880]/15 text-[#C5A880] px-2.5 py-0.5 rounded uppercase font-mono">{p.id}</span>
                      <h3 className="font-sans font-bold text-lg text-gray-950 dark:text-white leading-snug line-clamp-1">{p.title}</h3>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.area} Plot</span>
                        {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.bedrooms} Bed</span>}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Property Price</span>
                          <span className="text-[#C5A880] font-sans font-bold text-lg">PKR {p.price.toLocaleString()}</span>
                        </div>
                        <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider group-hover:underline flex items-center gap-1">
                          View details <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Choose Gated Society section */}
            <section className="bg-[#0F1A2C] text-white py-16 border-t border-b border-[#C5A880]/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
                  <span className="text-[#C5A880] font-bold text-xs uppercase tracking-widest">SOCIETY HIGHLIGHTS</span>
                  <h2 className="text-3xl font-bold uppercase tracking-tight">Sahara City Prime Conveniences</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">We provide standard housing configurations designed to accommodate modern upscale lifestyles beautifully.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                  {[
                    { title: "24/7 Security Gates", desc: "Equipped with professional guards at both terminals with continuous electronic camera checks.", icon: ShieldCheck },
                    { title: "Grand Jamia Mosque", desc: "A majestic centenarian design ready and fully operational for daily regular prayers.", icon: Award },
                    { title: "Main Boulevard Access", desc: "Paved double avenues near N5 highway ensures smooth navigation to nearby towns Okara and Sahiwal.", icon: Compass },
                    { title: "Themed Family Parks", desc: "Extensively landscaped playgrounds, decorative fountain lawns matching Anwar Shaheed Colony sports gardens.", icon: ImageIcon }
                  ].map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-2xl text-center space-y-3 hover:translate-y-[-2px] transition-transform">
                        <div className="h-12 w-12 bg-[#C5A880]/15 text-[#C5A880] rounded-xl flex items-center justify-center mx-auto border border-[#C5A880]/20">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-[#C5A880]">{service.title}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">{service.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Interactive Stats Counters */}
            <section className="max-w-7xl mx-auto px-4 py-12">
              <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 p-8 rounded-3xl shadow-sm text-center">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-4xl font-extrabold text-[#C5A880]">4.2 ★</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Google Stars rating</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-extrabold text-sky-500">222+</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Verified customer reviews</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-extrabold text-[#C5A880]">{properties.length}+</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">VIP Property Plots</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-extrabold text-indigo-500">100%</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Approved Document transfer</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Google Reviews Testimonials Summary on home */}
            <section className="bg-gray-100 dark:bg-black/10 py-16 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10 border-b border-gray-200 dark:border-gray-800 pb-4">
                  <div>
                    <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">RESIDENT EXPERIENCES</span>
                    <h2 className="text-3xl font-bold font-sans tracking-tight text-gray-950 dark:text-white mt-1">Google Maps Reviews</h2>
                  </div>
                  <button
                    onClick={() => setCurrentTab('reviews')}
                    className="text-xs font-bold text-[#C5A880] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View 222 Customer Testimonials <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {reviews.slice(0, 2).map((rev, index) => (
                    <div key={index} className="bg-white dark:bg-[#0F1A2C] border border-gray-105 dark:border-gray-805 p-6 rounded-3xl shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-[#C5A880]/15 text-[#C5A880] rounded-full flex items-center justify-center font-bold text-sm uppercase">
                            {rev.customerName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rev.customerName}</h4>
                            <span className="text-[10px] text-gray-400">Verified Sahara Resident</span>
                          </div>
                        </div>
                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Campaign Call To Action CTA */}
            <section className="bg-gradient-to-r from-[#0F1A2C] to-[#12243d] py-16 text-center text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <Building2 className="h-96 w-96 text-white" />
              </div>

              <div className="max-w-4xl mx-auto px-4 space-y-5 relative z-10">
                <h3 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight">
                  Discover Premium Plots on Easy Monthly Installments
                </h3>
                <p className="text-gray-300 max-w-xl mx-auto text-xs sm:text-sm font-light">
                  Use our interactive calculator online to find the required down payments, monthly splits. No bank verification needed. Direct transfers.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      setCurrentTab('calculator');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  >
                    Open Payment Calculator
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('contact');
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="bg-transparent border border-white hover:bg-white hover:text-[#090E16] text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl cursor-pointer transition-all"
                  >
                    Discuss on Phone
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: ABOUT PAGE */}
        {currentTabsView(currentTab === 'about', (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">WHO WE ARE</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1">About Sahara City Renala Khurd</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {settings.companyAboutText}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white dark:bg-[#0F1A2C] border dark:border-gray-800 rounded-xl">
                    <span className="block text-xl font-bold text-[#C5A880]">House # 130</span>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Physical Site HQ</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-[#0F1A2C] border dark:border-gray-800 rounded-xl">
                    <span className="block text-xl font-bold text-sky-500">222+ reviews</span>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Client Endorsement</span>
                  </div>
                </div>
              </div>

              <div>
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800" 
                  alt="Sahara City Infrastructure development" 
                  className="rounded-3xl border border-[#C5A880]/20 shadow-xl w-full object-cover h-80" 
                />
              </div>
            </div>

            {/* Development timeline markers */}
            <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C5A880]">Society Project Timeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed">
                <div className="space-y-1">
                  <span className="font-bold text-[#C5A880]">A: Phase Launch</span>
                  <p className="text-gray-500">Initial land leveling, perimeter boundary fencing alongside the prime N5 GT Road gateway, grand mosque foundation layout completed.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sky-400">B: Roads & Utilities</span>
                  <p className="text-gray-500">Complete paving of 100ft boulevards and 40ft internal streets. Setup of deep water pipelines, active filtration plant, concrete yellow-black curbstones.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-indigo-400">C: Possession & Blocks</span>
                  <p className="text-gray-400">Handing over on-the-spot physical allocations for Phase A & B corner plots. Initiation of executive double story model villas bookings.</p>
                </div>
              </div>
            </div>

          </div>
        ))}

        {/* VIEW 3: PROPERTIES LISTINGS */}
        {currentTab === 'properties' && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
            
            {/* Header banner */}
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">VIP CATEGORIES</span>
              <h1 className="text-3xl font-extrabold text-[#0F1A2C] dark:text-white uppercase tracking-widest mt-1">Available Lands & Models</h1>
            </div>

            {/* Filter controls panel */}
            <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center gap-2 pb-2 text-xs font-bold text-[#C5A880] uppercase tracking-wider">
                <SlidersHorizontal className="h-4 w-4" /> Filter Listings Dashboard
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Property Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 p-2.5 rounded-xl text-gray-800 dark:text-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Commercial Plot">Commercial Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Offer Mechanism</label>
                  <select
                    value={filterPurpose}
                    onChange={(e) => setFilterPurpose(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 p-2.5 rounded-xl text-gray-800 dark:text-white"
                  >
                    <option value="All">All Mechanisms</option>
                    <option value="For Sale">For Sale (Cash)</option>
                    <option value="Installment">Installments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Search text</label>
                  <input
                    type="text"
                    placeholder="Search by keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-805 p-2.5 rounded-xl text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-gray-500 uppercase tracking-widest font-semibold mb-1.5">
                    <span>Max Budget</span>
                    <span className="font-bold text-[#C5A880]">PKR {filterMaxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="15000000"
                    step="50000"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
                  />
                </div>
              </div>
            </div>

            {/* List items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {properties
                .filter(p => {
                  const matchType = filterType === 'All' ? true : p.propertyType === filterType;
                  const matchPurpose = filterPurpose === 'All' ? true : p.purpose === filterPurpose;
                  const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.id.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchPrice = p.price <= filterMaxPrice;
                  return matchType && matchPurpose && matchSearch && matchPrice;
                })
                .map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handleViewPropertyDetails(p.id)}
                    className="group bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer text-left relative"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                      <span className="absolute top-3 left-3 bg-[#0F1A2C] text-[#C5A880] border border-[#C5A880]/30 text-[9px] font-bold uppercase tracking-widest py-1 px-2.5 rounded-full shadow-md">
                        {p.purpose === 'Installment' ? 'Easy installment' : p.purpose}
                      </span>
                      <button
                        onClick={(e) => handleToggleWishlist(p.id, e)}
                        className="absolute top-3 right-3 h-8 w-8 bg-black/40 backdrop-blur-xs text-white rounded-full flex items-center justify-center hover:bg-[#0F1A2C] transition-colors"
                      >
                        <Heart className={`h-4.5 w-4.5 ${wishlist.includes(p.id) ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-white'}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-[#C5A880]/15 text-[#C5A880] px-2 py-0.5 rounded uppercase font-mono">{p.id}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${
                          p.status === 'Available' ? 'text-emerald-500' :
                          p.status === 'Sold' ? 'text-rose-500' : 'text-amber-500'
                        }`}>{p.status}</span>
                      </div>
                      
                      <h3 className="font-bold text-gray-950 dark:text-white truncate text-base leading-tight">{p.title}</h3>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#C5A880]" /> {p.area}</span>
                        {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.bedrooms} Beds</span>}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase tracking-widest">Pricing</span>
                          <span className="text-[#C5A880] font-bold font-sans">PKR {p.price.toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400 hover:text-[#C5A880] uppercase tracking-wider flex items-center gap-1">
                          Specs <ChevronRight className="h-4.5 w-4.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* VIEW 4: PROPERTY DETAILS BY ID */}
        {currentTab === 'property-details' && currentProperty && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
            
            {/* Back to list Navigation link */}
            <button
              onClick={() => setCurrentTab('properties')}
              className="text-[#C5A880] hover:underline transition-colors uppercase tracking-widest font-bold text-xs flex items-center gap-1 pb-2 cursor-pointer"
            >
              ← Return to Lands list
            </button>

            {/* Split Title block */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#C5A880]/20 pb-4">
              <div>
                <span className="text-[#C5A880] text-xs font-extrabold uppercase tracking-widest bg-[#C5A880]/15 py-1 px-3.5 rounded-full inline-block font-mono">Slot {currentProperty.id}</span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F1A2C] dark:text-white uppercase tracking-wider mt-2 leading-snug">
                  {currentProperty.title}
                </h1>
                <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium select-all">
                  <MapPin className="h-4 w-4 text-[#C5A880]" />
                  {currentProperty.city}, Sahara City (Anwar Shaheed Colony area)
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl text-right min-w-xs border border-gray-100 dark:border-gray-800 shadow-md">
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest">Market Value</span>
                <span className="text-2xl font-black text-[#C5A880] block mt-0.5">PKR {currentProperty.price.toLocaleString()}</span>
                {currentProperty.installmentDetails && (
                  <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full mt-1.5">
                    Monthly Installments starting: {currentProperty.installmentDetails.monthlyInstallment.toLocaleString()} PKR
                  </span>
                )}
              </div>
            </div>

            {/* Media Showcases with Lightbox compatibility */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 bg-gray-200 rounded-3xl overflow-hidden h-96 group relative">
                <img src={currentProperty.images[0]} alt={currentProperty.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setLightboxImage(currentProperty.images[0])}
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-[#0F1A2C] border border-white/10 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Gallery Lightbox View
                </button>
              </div>
              <div className="grid grid-rows-2 gap-4">
                <div className="bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden h-44 cursor-pointer" onClick={() => setLightboxImage(currentProperty.images[1] || currentProperty.images[0])}>
                  <img src={currentProperty.images[1] || currentProperty.images[0]} alt="Side-view A" className="w-full h-full object-cover rounded-2xl hover:opacity-90 transition-opacity" />
                </div>
                <div className="bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden h-44 cursor-pointer" onClick={() => setLightboxImage(currentProperty.images[2] || currentProperty.images[0])}>
                  <img src={currentProperty.images[2] || currentProperty.images[0]} alt="Side-view B" className="w-full h-full object-cover rounded-2xl hover:opacity-90 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Content matrix split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: specifications */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Description details */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm text-xs leading-relaxed space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#C5A880]">Property Bio Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {currentProperty.description}
                  </p>
                </div>

                {/* specifications table parameters */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 text-xs font-sans">
                  <h3 className="font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">Technical Details Log</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-black/10 rounded-xl">
                      <span className="block text-gray-400 text-[10px] uppercase">Unique ID</span>
                      <span className="font-bold text-gray-900 dark:text-white">{currentProperty.id}</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-black/10 rounded-xl">
                      <span className="block text-gray-400 text-[10px] uppercase">Land Area</span>
                      <span className="font-bold text-[#C5A880]">{currentProperty.area}</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-black/10 rounded-xl">
                      <span className="block text-gray-400 text-[10px] uppercase">Property Type</span>
                      <span className="font-bold text-gray-900 dark:text-white">{currentProperty.propertyType}</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-black/10 rounded-xl">
                      <span className="block text-gray-400 text-[10px] uppercase">Active Status</span>
                      <span className="font-bold text-gray-905 dark:text-gray-300">{currentProperty.status}</span>
                    </div>
                  </div>
                </div>

                {/* Installment breakdown card if applicable */}
                {currentProperty.installmentDetails && (
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-md space-y-4 text-xs font-sans">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500">Suggested Installment Calendar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">Down Payment</span>
                        <span className="font-bold text-emerald-500">PKR {currentProperty.installmentDetails.downPayment.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">Monthly Schedule</span>
                        <span className="font-bold text-gray-850 dark:text-white">PKR {currentProperty.installmentDetails.monthlyInstallment.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">Quarterly (3 Months)</span>
                        <span className="font-bold text-gray-850 dark:text-white">PKR {currentProperty.installmentDetails.quarterlyInstallment.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">Tenure Length</span>
                        <span className="font-bold text-slate-800 dark:text-slate-300">{currentProperty.installmentDetails.totalInstallments} Months</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('calculator');
                        // Optional preset scrolling
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] hover:underline font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer text-left"
                    >
                      <Compass className="h-4 w-4" /> Load inside interactive fine calculator →
                    </button>
                  </div>
                )}

                {/* Map integration */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#C5A880]">Google Maps Location (Anwar Shaheed Colony area)</h3>
                  <div className="h-64 rounded-2xl overflow-hidden border dark:border-gray-800">
                    <iframe
                      src={currentProperty.mapLocation}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${currentProperty.title}`}
                    ></iframe>
                  </div>
                </div>

              </div>

              {/* Right Column: Inquiry forms, QR and brochure downloads */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Inquiry card Form */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300 mb-2">
                    Request Booking Call
                  </h3>

                  {!contactStatus ? (
                    <form onSubmit={(e) => handleInquirySubmit(e, currentProperty.id, currentProperty.title)} className="space-y-4 text-xs font-sans text-left">
                      <div>
                        <label className="block text-gray-400 uppercase tracking-wider mb-1">Your CNIC Name</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 uppercase tracking-wider mb-1">Active Contact phone</label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 uppercase tracking-wider mb-1">Secure Email</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#0F1A2C] hover:bg-[#162740] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] py-3 rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Send className="h-4 w-4" /> Book Schedule Slot
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6 text-emerald-500 space-y-2">
                      <p className="font-bold text-sm uppercase">Dispatch Done!</p>
                      <p className="text-xs text-gray-500">Your plot query is saved under leads database store. Admin has been notified.</p>
                    </div>
                  )}
                </div>

                {/* QR code and brochure download panel */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-md text-center space-y-4 text-xs">
                  <h4 className="font-bold uppercase tracking-widest text-gray-500">Share & Download</h4>
                  
                  {/* Share QR */}
                  <div className="p-4 bg-slate-100 dark:bg-black/35 rounded-2xl max-w-fit mx-auto border dark:border-gray-850">
                    {/* Beautiful local styled vector QR mockup */}
                    <div className="h-28 w-28 bg-[#0F1A2C] border-2 border-[#C5A880]/20 rounded-xl p-1.5 flex flex-col items-center justify-between mx-auto">
                      <div className="grid grid-cols-3 gap-2 w-full p-1 opacity-80">
                        <span className="h-4 w-4 bg-[#C5A880] rounded-sm"></span>
                        <span className="h-4 w-4 bg-transparent"></span>
                        <span className="h-4 w-4 bg-[#C5A880] rounded-sm"></span>
                        <span className="h-4 w-4 bg-transparent"></span>
                        <span className="h-4 w-4 bg-[#C5A880] rounded-sm"></span>
                        <span className="h-4 w-4 bg-transparent"></span>
                        <span className="h-4 w-4 bg-[#C5A880] rounded-sm"></span>
                        <span className="h-4 w-4 bg-transparent"></span>
                        <span className="h-4 w-5 bg-[#C5A880] rounded-sm"></span>
                      </div>
                      <span className="block font-mono text-[8px] tracking-wider text-[#C5A880] uppercase font-bold">{currentProperty.id}</span>
                    </div>
                    <span className="block text-[9px] text-gray-400 uppercase tracking-widest mt-2 font-bold select-none">Scan to share specs page</span>
                  </div>

                  {/* Brochure */}
                  <button
                    onClick={() => {
                      if (currentProperty) {
                        generatePropertyPDF(currentProperty);
                      }
                    }}
                    className="w-full border border-gray-200 dark:border-gray-800 hover:border-[#C5A880] py-2 px-3 rounded-xl font-bold uppercase tracking-wider text-[10px] text-gray-500 hover:text-[#C5A880] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    Download Premium Brochure
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW 5: SERVICES */}
        {currentTab === 'services' && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">OUR PORTFOLIO</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1">Enterprise Agency Services</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { title: "Plot Vetting & Verification", text: "Physical site validation, Registry/Intiqal file verification checks physically overseen at our House # 130 administrative facility." },
                { title: "Affordable installment advisory", desc: "No interest plans matching household budgets. Find standard 36-60 month quarterly schedules." },
                { title: "Custom Resident Construction", desc: "Access high caliber masonry engineering, Spanish layout architects for executive 5 Marla and 1 Kanal villas." }
              ].map((serv, ind) => (
                <div key={ind} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm text-xs space-y-2.5">
                  <span className="font-mono text-xs font-bold text-[#C5A880]">0{ind + 1} /</span>
                  <h3 className="font-bold text-[#0F1A2C] dark:text-white uppercase tracking-wider text-sm">{serv.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{serv.text || serv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: GALLERY */}
        {currentTab === 'gallery' && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">VISUAL SHOWCASE</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1 font-sans">Sahara City Media Gallery</h1>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 text-xs font-sans">
              {['All', 'Residential', 'Commercial', 'Parks', 'Mosque', 'Development', 'General'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`py-2 px-4 rounded-xl font-bold uppercase tracking-wider border cursor-pointer ${
                    galleryCategory === cat
                      ? 'bg-[#C5A880] border-[#C5A880] text-[#090E16] shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Gallery Image display connected to Media store in IndexedDB! */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {media
                .filter(item => galleryCategory === 'All' ? true : item.category === galleryCategory)
                .map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setLightboxImage(item.url)}
                  >
                    <div className="h-56 bg-gray-100 dark:bg-black/10 overflow-hidden">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover hover:scale-102 transition-transform duration-300" />
                    </div>
                    <div className="p-4 text-xs">
                      <span className="inline-block text-[10px] bg-[#C5A880]/15 text-[#C5A880] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2">{item.category}</span>
                      <h4 className="font-bold text-gray-950 dark:text-white">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Uploaded: {item.uploadedDate}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 7: REVIEWS */}
        {currentTab === 'reviews' && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
            
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">RESIDENT VOICES</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1">Real Google Review metrics</h1>
            </div>

            {/* Ratings Card mimicking user screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white dark:bg-[#0F1A2C] rounded-3xl p-6 border dark:border-gray-805">
              
              {/* Giant rating */}
              <div className="text-center space-y-1.5 border-r border-gray-100 dark:border-gray-800 pr-4">
                <h2 className="text-5xl font-black text-gray-9ab dark:text-white">4.2</h2>
                <div className="flex justify-center text-amber-500 text-sm">
                  {Array.from({ length: 4 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                  <Star className="h-5 w-5 text-gray-300" /> {/* partial */}
                </div>
                <span className="block text-xs text-gray-400 uppercase font-black tracking-widest">(222 Reviews)</span>
              </div>

              {/* Star breakdown bar mimicking Google widget perfectly */}
              <div className="md:col-span-2 space-y-2 text-xs">
                {[
                  { star: 5, width: 'w-11/12' },
                  { star: 4, width: 'w-4/12' },
                  { star: 3, width: 'w-2/12' },
                  { star: 2, width: 'w-1/12' },
                  { star: 1, width: 'w-1/12' }
                ].map(r => (
                  <div key={r.star} className="flex items-center gap-3">
                    <span className="w-3 font-semibold text-[#C5A880]">{r.star}</span>
                    <div className="h-2 w-full bg-slate-100 dark:bg-black/30 rounded-full overflow-hidden">
                      <div className={`h-full bg-amber-400 rounded-full ${r.width}`}></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Approved reviews array list */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Testimonials Log</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {reviews
                  .filter(r => r.isApproved) // Approvals only
                  .map(rev => (
                    <div key={rev.id} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm text-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[#0F1A2C] dark:text-[#C5A880]">{rev.customerName}</span>
                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-300 italic">
                        "{rev.comment}"
                      </p>
                      <span className="block text-[10px] text-gray-400 font-mono">Date: {rev.createdDate}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Review Testimonial submit form */}
            <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl max-w-xl mx-auto text-xs">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C5A880] text-center pb-3 border-b mb-4">
                Leave a Google Resident Review
              </h3>

              {!reviewSubmitted ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-left">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Secure Email address</label>
                    <input
                      type="email"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Assign Stars</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-gray-50 dark:bg-black/30 border border-gray-200 p-2.5 rounded-xl text-gray-800 dark:text-white"
                    >
                      <option value={5}>5 Stars ★★★★★</option>
                      <option value={4}>4 Stars ★★★★☆</option>
                      <option value={3}>3 Stars ★★★☆☆</option>
                      <option value={2}>2 Stars ★★☆☆☆</option>
                      <option value={1}>1 Star ★☆☆☆☆</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Feedback feedback</label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl p-3"
                      placeholder="Comment on roads development, water accessibility..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0F1A2C] hover:bg-[#162740] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold py-3 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Submit Testimonial
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 text-emerald-500 space-y-1">
                  <p className="font-bold text-sm uppercase">Review Sent!</p>
                  <p className="text-xs text-gray-400">Feedback submitted. Approvals requested. It will show up physically after admin validation.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 8: FAQs PAGE */}
        {currentTab === 'faq' && (
          <div className="font-sans text-left max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
            
            <div className="border-b border-[#C5A880]/20 pb-4 text-center">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">QUESTIONS ARCHIVE</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1">Frequently Asked Questions</h1>
            </div>

            {/* Quick search bar over 20 FAQs */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4.5 w-4.5" />
              <input
                type="text"
                placeholder="Search FAQs by keywords (e.g. registry, down payment)..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#0F1A2C] border border-gray-200 dark:border-gray-800 text-xs py-3.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Expandable list accordions */}
            <div className="space-y-3.5 font-sans">
              {faqList
                .filter(item => {
                  return item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                         item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
                         item.category.toLowerCase().includes(faqSearch.toLowerCase());
                })
                .map((item, index) => (
                  <div key={index} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm text-xs space-y-2">
                    <span className="inline-block text-[9px] bg-[#C5A880]/15 text-[#C5A880] px-2 py-0.5 rounded font-bold uppercase tracking-widest">{item.category}</span>
                    <h3 className="font-bold text-sm text-gray-950 dark:text-white">{item.question}</h3>
                    <p className="text-gray-500 dark:text-gray-300 leading-relaxed font-light">{item.answer}</p>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* VIEW 9: CONTACT PAGE */}
        {currentTab === 'contact' && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">CONNECT WITH REPRESENTATIVE</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1">Contact Secretariat</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Coordinates */}
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-sm space-y-4 text-xs font-sans">
                  <h3 className="font-bold uppercase text-[#C5A880] tracking-widest">Physical Head Office Block</h3>
                  <div className="space-y-3">
                    <p className="flex items-start gap-2.5">
                      <MapPin className="h-5 w-5 text-[#C5A880] shrink-0" />
                      <span>{settings.contactAddress}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-[#C5A880]" />
                      <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone} (Representative Desk)</a>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-[#C5A880]" />
                      <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                    </p>
                  </div>
                </div>

                {/* Map */}
                <div className="h-72 rounded-3xl overflow-hidden border dark:border-gray-800">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Sahara City map"
                  ></iframe>
                </div>

              </div>

              {/* Inquiry form on contact page */}
              <div className="bg-white dark:bg-[#0F1A2C] border border-gray-101 dark:border-gray-850 p-6 rounded-3xl shadow-xl text-xs space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-[#C5A880]">Send message dispatch</h3>
                <p className="text-gray-400">Our real estate officers will contact you shortly regarding booking files.</p>
                
                {!contactStatus ? (
                  <form onSubmit={(e) => handleInquirySubmit(e)} className="space-y-4 font-sans text-left">
                    <div>
                      <label className="block text-gray-500 mb-1">Your CNIC Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Email address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Question parameters</label>
                      <textarea
                        rows={4}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl p-3"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0F1A2C] hover:bg-slate-900 dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold py-3 rounded-xl uppercase tracking-wider cursor-pointer"
                    >
                      Dispatch Message
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 text-emerald-500">
                    <p className="font-bold">Dispatch success!</p>
                    <p className="text-xs text-gray-400">Message added to IndexedDB database log.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW 10: COMPARE PROPERTIES */}
        {currentTab === 'compare' && (
          <PropertyCompare 
            properties={properties} 
            setCurrentTab={setCurrentTab} 
            setSelectedPropertyId={setSelectedPropertyId} 
          />
        )}

        {/* VIEW 11: INSTALLMENT CALCULATOR */}
        {currentTab === 'calculator' && (
          <InstallmentCalc 
            properties={properties} 
            presetProperty={properties.find(p => p.id === selectedPropertyId) || null} 
          />
        )}

        {/* VIEW 12: BLOG LIST */}
        {currentTab === 'blog' && (
          <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
            <div className="border-b border-[#C5A880]/20 pb-4">
              <span className="text-[#C5A880] font-bold text-xs uppercase tracking-wider">INVESTEMENT INSIGHTS</span>
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0F1A2C] dark:text-white mt-1">Real Estate Campaign Blogs</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {blogs.map(blog => (
                <div 
                  key={blog.id}
                  onClick={() => {
                    setSelectedBlogId(blog.id);
                    setCurrentTab('blog-details');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer text-left"
                >
                  <img src={blog.image} alt={blog.title} className="w-full h-44 object-cover" />
                  <div className="p-5 space-y-3 text-xs">
                    <span className="inline-block text-[9px] bg-sky-500/10 text-sky-500 font-bold px-2 py-0.5 rounded uppercase tracking-widest">{blog.category}</span>
                    <h3 className="font-bold text-sm tracking-tight text-gray-950 dark:text-white line-clamp-2">{blog.title}</h3>
                    <p className="text-gray-500 leading-relaxed line-clamp-3 font-light">{blog.summary}</p>
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono font-bold pt-2 border-t dark:border-gray-800">
                      <span>By {blog.author}</span>
                      <span>{blog.createdDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 13: BLOG DETAILS */}
        {currentTab === 'blog-details' && currentBlog && (
          <div className="font-sans text-left max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
            <button
              onClick={() => setCurrentTab('blog')}
              className="text-[#C5A880] hover:underline uppercase tracking-widest font-bold text-[10px]"
            >
              ← Back to articles list
            </button>

            <div className="space-y-2 text-left">
              <span className="text-[10px] bg-[#C5A880]/15 text-[#C5A880] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{currentBlog.category}</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F1A2C] dark:text-white leading-tight uppercase tracking-wider">{currentBlog.title}</h1>
              <div className="flex text-xs text-gray-400 gap-4 font-mono font-semibold">
                <span>By {currentBlog.author}</span>
                <span>•</span>
                <span>Published: {currentBlog.createdDate}</span>
              </div>
            </div>

            <img src={currentBlog.image} alt={currentBlog.title} className="w-full h-64 object-cover rounded-3xl border dark:border-gray-850 shadow-md" />

            {/* Content body supporting raw lines */}
            <div className="prose dark:prose-invert text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light text-left space-y-4">
              {currentBlog.content.split('\n\n').map((para, idx) => {
                if (para.startsWith('###')) {
                  return <h3 key={idx} className="text-base font-bold text-gray-900 dark:text-[#C5A880] uppercase tracking-wide pt-2">{para.replace('###', '')}</h3>;
                }
                if (para.startsWith('-')) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-1 pl-4">
                      {para.split('\n').map((li, lidx) => (
                        <li key={lidx}>{li.replace('-', '').trim()}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{para}</p>;
              })}
            </div>

          </div>
        )}

        {/* VIEW 14: PRIVACY POLICY */}
        {currentTab === 'privacy' && (
          <div className="font-sans text-left max-w-3xl mx-auto px-4 py-16 animate-fade-in space-y-6 text-xs sm:text-sm leading-relaxed">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#C5A880]">Privacy Policy Parameters</h1>
            <p className="text-gray-500">
              Welcome to Sahara City Renala Khurd Website. We prioritize safeguarding your privacy under standard data protection laws (including local SECP electronic transaction ordinances).
            </p>
            <h3 className="font-bold text-sm text-[#0F1A2C] dark:text-white uppercase tracking-wider">1. Data Storage Consent</h3>
            <p className="text-gray-500">
              Personal credentials (names, telephones, emails) submitted inside booking or quick inquiry modals are stored strictly inside your browser's offline database (IndexedDB client cache). No external remote tracking is deployed without prior permission.
            </p>
            <h3 className="font-bold text-sm text-[#0F1A2C] dark:text-white uppercase tracking-wider">2. System Operations and Backups</h3>
            <p className="text-gray-500">
              Data portability backups and backup recoveries are executed locally. General telemetry data is not dispatched to secondary cloud directories.
            </p>
          </div>
        )}

        {/* VIEW 15: TERMS & CONDITIONS */}
        {currentTab === 'terms' && (
          <div className="font-sans text-left max-w-3xl mx-auto px-4 py-16 animate-fade-in space-y-6 text-xs sm:text-sm leading-relaxed">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#C5A880]">Terms & Conditions of Booking</h1>
            <p className="text-gray-500">
              By initiating plot bookings, CNIC registrations, or payment logs at Sahara City Renala Khurd, you explicitly agree to the following board-approved covenants:
            </p>
            <h3 className="font-bold text-sm text-[#0F1A2C] dark:text-white uppercase tracking-wider">1. Schedule Compliance</h3>
            <p className="text-gray-500">
              Installment schedules (both monthly and quarterly) must be paid before the 10th of respective due cycles physically at House # 130 Sahara City Renala Khurd physical office or authorized state bank lines.
            </p>
            <h3 className="font-bold text-sm text-[#0F1A2C] dark:text-white uppercase tracking-wider">2. Allotments & Cancellations</h3>
            <p className="text-gray-500">
              Plot allocation parameters (corner premium surcharge rates, development layouts) are dictated strictly by the centralized authorities. Cancellation policies comply with municipal laws.
            </p>
          </div>
        )}

      </main>

      {/* Floating Action elements panel */}
      <FloatingActions 
        whatsappNumber={settings.whatsappNumber} 
        contactPhone={settings.contactPhone} 
        onLeadSubmitted={refreshDatabaseData}
      />

      {/* Corporate bottom elements */}
      <Footer 
        setCurrentTab={setCurrentTab} 
        contactAddress={settings.contactAddress} 
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        footerCopyrightText={settings.footerCopyrightText}
      />

      {/* Image Lightbox View Panel */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-55 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm uppercase cursor-pointer"
            >
              [Close X]
            </button>
            <img src={lightboxImage} alt="Enlarged Visual asset" className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-[#C5A880]/30 shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}

// Inline tab visualizer wrapper
function currentTabsView(condition: boolean, component: React.ReactNode) {
  return condition ? component : null;
}
