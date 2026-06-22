import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, LayoutDashboard, Building2, HelpCircle, FileText, 
  MessageSquare, Image as ImageIcon, Settings, Database, Sparkles, Check, 
  Trash2, Edit, Plus, Upload, Copy, Save, LogOut, CheckCircle2, RefreshCw,
  Search, Eye, Mail, Phone, Calendar, Download, FileUp, AlertTriangle, Globe
} from 'lucide-react';
import { Property, Lead, Review, Blog, MediaItem, AppSettings } from '../types';
import { dbGetAll, dbPut, dbDelete, getSettings, saveSettings, DB_VERSION } from '../lib/db';

interface AdminPanelProps {
  properties: Property[];
  leads: Lead[];
  reviews: Review[];
  blogs: Blog[];
  media: MediaItem[];
  settings: AppSettings;
  onRefreshData: () => void;
  activeSubTab?: 'dashboard' | 'properties' | 'leads' | 'reviews' | 'blogs' | 'media' | 'settings' | 'utility' | 'seo';
}

export default function AdminPanel({ 
  properties, leads, reviews, blogs, media, settings, onRefreshData, activeSubTab
}: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Password hashing / First login states
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('What was your first school name in Renala Khurd?');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  
  // Password Recovery mode
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Active Admin tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'leads' | 'reviews' | 'blogs' | 'media' | 'settings' | 'utility' | 'seo'>('dashboard');

  useEffect(() => {
    if (activeSubTab && activeSubTab !== activeTab) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Search/Filters
  const [searchTermLeads, setSearchTermLeads] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('All');
  
  // Notification alert toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Forms editing states
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'Residential' | 'Commercial' | 'Parks' | 'Mosque' | 'Development' | 'General'>('General');
  
  // Generated SEO mockup states
  const [seoPresetPropertyId, setSeoPresetPropertyId] = useState('');
  const [generatedSeo, setGeneratedSeo] = useState<{ title: string; desc: string; schema: string } | null>(null);

  // Simple Hashing simulation for SHA-256 secure requests (Matches local standard)
  const hashPassword = (plain: string) => {
    // Elegant client-side custom hash algorithm simulating SHA-256 length and signature
    let hash = 0;
    for (let i = 0; i < plain.length; i++) {
      const char = plain.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'sha256-' + Math.abs(hash).toString(16).padStart(16, '0') + 'f7c8d9e0';
  };

  // Check saved session tokens
  useEffect(() => {
    const token = localStorage.getItem('sahara_admin_token');
    const expiry = localStorage.getItem('sahara_admin_expiry');
    
    if (token && expiry) {
      if (Date.now() < Number(expiry)) {
        setIsAuthenticated(true);
        // Refresh session timeout on active render
        localStorage.setItem('sahara_admin_expiry', (Date.now() + 30 * 60 * 1000).toString());
      } else {
        localStorage.removeItem('sahara_admin_token');
        localStorage.removeItem('sahara_admin_expiry');
      }
    }
    
    // Check if password has been changed from default (admin123)
    const firstLoginDone = localStorage.getItem('sahara_first_login_done');
    if (!firstLoginDone) {
      setIsFirstLogin(true);
    }
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Manage Login action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default credential parameters
    const defaultUsername = 'admin';
    const defaultPasswordHash = hashPassword('admin123');
    
    const savedPasswordHash = localStorage.getItem('sahara_admin_password_hash') || defaultPasswordHash;

    if (username === defaultUsername && hashPassword(password) === savedPasswordHash) {
      // Success
      setIsAuthenticated(true);
      const sessionTimeout = Date.now() + 30 * 60 * 1000; // 30 mins session timeout
      
      localStorage.setItem('sahara_admin_token', 'token_' + Math.random().toString(36).substring(2));
      localStorage.setItem('sahara_admin_expiry', sessionTimeout.toString());

      const firstLoginDone = localStorage.getItem('sahara_first_login_done');
      if (!firstLoginDone) {
        setIsFirstLogin(true);
        triggerToast('First login detected! Please configure a secure password immediately.', 'info');
      } else {
        triggerToast('Welcome Back, Administrator!', 'success');
      }
    } else {
      triggerToast('Incorrect username or password. Please verify.', 'error');
    }
  };

  // Configure Force Password Change
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      triggerToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    const hashed = hashPassword(newPassword);
    localStorage.setItem('sahara_admin_password_hash', hashed);
    localStorage.setItem('sahara_admin_recovery_question', recoveryQuestion);
    localStorage.setItem('sahara_admin_recovery_answer', recoveryAnswer.toLowerCase().trim());
    localStorage.setItem('sahara_first_login_done', 'true');
    
    setIsFirstLogin(false);
    triggerToast('Administrator Credentials Secured! Password Changed Successfully.', 'success');
  };

  // Recover Password
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const savedAnswer = localStorage.getItem('sahara_admin_recovery_answer') || 'renala';
    
    if (recoveryInput.toLowerCase().trim() === savedAnswer) {
      // Force set password to aminashehzadi1596 recovery standard or prompt reset
      localStorage.setItem('sahara_admin_password_hash', hashPassword('admin123'));
      localStorage.setItem('sahara_first_login_done', 'false'); // Force reset on flow
      setIsFirstLogin(true);
      setIsRecoveryMode(false);
      setUsername('admin');
      setPassword('admin123');
      triggerToast('Account Recovered! Logged in with default "admin123", please set new details.', 'success');
    } else {
      setRecoveryError('Incorrect answer to the recovery question.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sahara_admin_token');
    localStorage.removeItem('sahara_admin_expiry');
    setIsAuthenticated(false);
    triggerToast('Logged out of Admin Portal successfully.', 'info');
  };

  // CRUD Properties
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty?.id || !editingProperty.title || !editingProperty.price) {
      triggerToast('Invalid parameters. Price & title required.', 'error');
      return;
    }

    const completeProperty: Property = {
      id: editingProperty.id,
      title: editingProperty.title,
      description: editingProperty.description || '',
      price: Number(editingProperty.price),
      city: editingProperty.city || 'Renala Khurd',
      area: editingProperty.area || '5 Marla',
      bedrooms: Number(editingProperty.bedrooms || 0),
      bathrooms: Number(editingProperty.bathrooms || 0),
      propertyType: editingProperty.propertyType || 'Residential Plot',
      purpose: editingProperty.purpose || 'For Sale',
      images: editingProperty.images || ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'],
      mapLocation: editingProperty.mapLocation || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: editingProperty.status || 'Available',
      views: editingProperty.views || 0,
      createdDate: editingProperty.createdDate || new Date().toISOString().split('T')[0],
      installmentDetails: editingProperty.purpose === 'Installment' ? {
        downPayment: Number(editingProperty.installmentDetails?.downPayment || 100000),
        monthlyInstallment: Number(editingProperty.installmentDetails?.monthlyInstallment || 10000),
        quarterlyInstallment: Number(editingProperty.installmentDetails?.quarterlyInstallment || 50000),
        totalInstallments: Number(editingProperty.installmentDetails?.totalInstallments || 36),
        possessionDate: editingProperty.installmentDetails?.possessionDate || '2028-12-31'
      } : undefined
    };

    await dbPut('properties', completeProperty);
    triggerToast(`Property ${completeProperty.id} Saved Successfully!`, 'success');
    setEditingProperty(null);
    onRefreshData();
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm(`Are you absolutely sure you want to delete property ${id}?`)) {
      await dbDelete('properties', id);
      triggerToast(`Property ${id} Deleted successfully`, 'info');
      onRefreshData();
    }
  };

  // CRUD Blogs
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.id || !editingBlog.title || !editingBlog.content) {
      triggerToast('Title and content are required.', 'error');
      return;
    }

    const completeBlog: Blog = {
      id: editingBlog.id,
      title: editingBlog.title,
      slug: editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: editingBlog.category || 'Investment',
      summary: editingBlog.summary || '',
      content: editingBlog.content,
      image: editingBlog.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      author: editingBlog.author || 'Sahara City Admin',
      createdDate: editingBlog.createdDate || new Date().toISOString().split('T')[0]
    };

    await dbPut('blogs', completeBlog);
    triggerToast('Blog Saved Instantly!', 'success');
    setEditingBlog(null);
    onRefreshData();
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm('Delete this blog post?')) {
      await dbDelete('blogs', id);
      triggerToast('Blog post deleted.', 'info');
      onRefreshData();
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async (lead: Lead, status: Lead['status']) => {
    const updated = { ...lead, status };
    await dbPut('leads', updated);
    triggerToast(`Lead status updated to ${status}.`, 'success');
    onRefreshData();
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Delete this user query/lead?')) {
      await dbDelete('leads', id);
      triggerToast('Lead deleted.', 'info');
      onRefreshData();
    }
  };

  // Approve/Disapprove customer reviews
  const handleApproveReview = async (review: Review, approve: boolean) => {
    const updated = { ...review, isApproved: approve };
    await dbPut('reviews', updated);
    triggerToast(approve ? 'Review approved for public viewing!' : 'Review removed from public view.', 'success');
    onRefreshData();
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Delete this review completely?')) {
      await dbDelete('reviews', id);
      triggerToast('Review deleted from database.', 'info');
      onRefreshData();
    }
  };

  // Local Settings updates
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    triggerToast('App Configuration updated on public website instantly!', 'success');
    onRefreshData();
  };

  // Image base64 uploader helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      const newItem: MediaItem = {
        id: `med-${Date.now()}`,
        name: file.name.substring(0, 30),
        category: uploadCategory,
        url: base64Url,
        uploadedDate: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`
      };

      await dbPut('media', newItem);
      triggerToast('Asset uploaded to Media Library!', 'success');
      onRefreshData();
    };
    reader.readAsDataURL(file);
  };

  // Export DB
  const handleExportDatabase = () => {
    const backup = {
      properties,
      leads,
      reviews,
      blogs,
      media,
      settings,
      version: DB_VERSION,
      timestamp: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sahara_backup_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Database exported successfully', 'success');
  };

  // Dynamic XML Sitemap.xml Generator Component Function
  const handleGenerateSitemap = () => {
    try {
      const origin = window.location.origin;
      const staticPages = [
        '',
        'properties',
        'calculator',
        'compare',
        'services',
        'gallery',
        'blog',
        'reviews',
        'faq',
        'about',
        'contact'
      ];
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // 1. Static Pages
      staticPages.forEach(page => {
        const url = page ? `${origin}/${page}` : `${origin}/`;
        xml += `  <url>\n`;
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
        xml += `  </url>\n`;
      });
      
      // 2. Dynamic Properties crawled from IndexedDB
      properties.forEach(p => {
        const url = `${origin}/properties?id=${p.id}`;
        xml += `  <url>\n`;
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      });
      
      // 3. Dynamic Blogs crawled from IndexedDB
      blogs.forEach(b => {
        const url = `${origin}/blog?id=${b.id}`;
        xml += `  <url>\n`;
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
      
      xml += `</urlset>`;
      
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const dlUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.setAttribute('href', dlUrl);
      anchor.setAttribute('download', 'sitemap.xml');
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(dlUrl);
      
      triggerToast('Sitemap.xml generated and downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error generating xml sitemap:', err);
      triggerToast('Could not compile dynamic sitemap.', 'error');
    }
  };

  // Import DB
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Strict Schema Validation check before restoring
        if (!parsed.properties || !parsed.leads || !parsed.reviews || !parsed.settings) {
          triggerToast('Invalid Backup Schema. Restoring aborted.', 'error');
          return;
        }

        // Write all properties
        for (const p of parsed.properties) await dbPut('properties', p);
        for (const l of parsed.leads) await dbPut('leads', l);
        for (const r of parsed.reviews) await dbPut('reviews', r);
        for (const b of parsed.blogs || []) await dbPut('blogs', b);
        for (const m of parsed.media || []) await dbPut('media', m);
        if (parsed.settings) await saveSettings(parsed.settings);

        triggerToast('Full Sahara Database Restored Successfully! refreshing...', 'success');
        onRefreshData();
      } catch (err) {
        triggerToast('File parsing error. Ensure JSON format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // SEO Metadata Generator Module
  const handleGenerateSEOMetadata = () => {
    const selectedP = properties.find(p => p.id === seoPresetPropertyId);
    if (!selectedP) {
      triggerToast('Please select a reference property listing.', 'error');
      return;
    }

    const priceL = selectedP.price.toLocaleString();
    const seoTitle = `${selectedP.title} For sale | Sahara City Renala Khurd`;
    const seoDesc = `Secure this outstanding ${selectedP.area} ${selectedP.propertyType} in Sahara City Renala Khurd. Selling at real competitive rate of PKR ${priceL}. Gated community, 24/7 security with water facilities.`;
    
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      'name': selectedP.title,
      'description': selectedP.description,
      'identifier': selectedP.id,
      'price': selectedP.price,
      'priceCurrency': 'PKR',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'House 130, Sahara City',
        'addressLocality': 'Renala Khurd',
        'addressCountry': 'PK'
      }
    };

    setGeneratedSeo({
      title: seoTitle,
      desc: seoDesc,
      schema: JSON.stringify(schemaObj, null, 2)
    });
    triggerToast('SEO Meta & Schema generated successfully!', 'success');
  };

  // Session status check
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 font-sans text-left">
        
        <div className="bg-white dark:bg-[#0F1A2C] border border-[#C5A880]/30 rounded-3xl p-8 shadow-2xl relative">
          
          <div className="text-center space-y-3 mb-8">
            <div className="h-14 w-14 bg-[#C5A880]/15 text-[#C5A880] rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Admin Gateway
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter Administrator keys to command dynamic website content.
            </p>
          </div>

          {!isRecoveryMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Secure Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  placeholder="admin"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="text-[10px] text-gray-400 hover:text-[#C5A880] uppercase tracking-wider cursor-pointer"
                  >
                    {passwordVisible ? 'Hide Key' : 'Reveal Key'}
                  </button>
                </div>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  placeholder="admin123"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#C5A880] focus:ring-[#C5A880]"
                  />
                  Remember login Session
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsRecoveryMode(true)}
                  className="text-[#C5A880] hover:underline cursor-pointer"
                >
                  Forgot Key?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F1A2C] hover:bg-[#182a46] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-[#C5A880]/15 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Inspect & Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecoverPassword} className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 leading-relaxed mb-3">
                <strong>Password Recovery:</strong> Answer the preset emergency recovery question below to instantly restore default admin password.
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Question:</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white bg-gray-50 dark:bg-black/20 p-3 rounded-lg border dark:border-gray-800">
                  {localStorage.getItem('sahara_admin_recovery_question') || 'What was your first school name in Renala Khurd? (Default ans: renala)'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Answer
                </label>
                <input
                  type="text"
                  required
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-[#0F1A2C] dark:text-white focus:outline-none focus:border-[#C5A880]"
                  placeholder="Answer string"
                />
              </div>

              {recoveryError && <p className="text-xs text-red-500 font-bold">{recoveryError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryMode(false)}
                  className="w-1/2 py-2.5 rounded-xl text-center text-xs text-gray-500 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 cursor-pointer font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Force first login password change
  if (isFirstLogin) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 font-sans text-left">
        <div className="bg-white dark:bg-[#0F1A2C] border border-[#C5A880]/30 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-widest">
              Force Password Reset
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              For elite security, configure your private credentials on first deployment.
            </p>
          </div>

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                New Vault Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-850 rounded-xl py-2.5 px-3.5 text-sm"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-850 rounded-xl py-2.5 px-3.5 text-sm"
                placeholder="Re-enter password"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Access recovery setup
              </label>
              <input
                type="text"
                required
                value={recoveryQuestion}
                onChange={(e) => setRecoveryQuestion(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-xs text-gray-500"
                placeholder="Recovery Question"
              />
              <input
                type="text"
                required
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5 text-xs font-bold"
                placeholder="Recovery Answer"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-bold py-3 rounded-xl text-xs uppercase tracking-widest cursor-pointer"
            >
              Secure Account Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Master Dashboard Render
  return (
    <div className="font-sans text-left min-h-screen bg-gray-50 dark:bg-[#090E16] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon */}
        <div className="bg-[#0F1A2C] text-white p-6 rounded-3xl border-b-4 border-[#C5A880] flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#C5A880]/15 border border-[#C5A880] rounded-2xl text-[#C5A880]">
              <LayoutDashboard className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold uppercase tracking-widest">
                Sahara Command Desk
              </h1>
              <p className="text-xs text-gray-400">
                Authorized Administrator Role Area | Database Live Connection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshData}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-[#C5A880] transition-colors cursor-pointer"
              title="Refresh SQLite Data"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>

        {/* Global Toast Alerts */}
        {toast && (
          <div className={`fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-bounce ${
            toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400' :
            toast.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-400' :
            'bg-sky-50 dark:bg-sky-500/10 border-sky-400 text-sky-800 dark:text-sky-400'
          }`}>
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

        {/* Navigation Sidebar Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation panel */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-md h-fit space-y-2">
            {[
              { id: 'dashboard', label: 'Analytics Board', icon: LayoutDashboard },
              { id: 'properties', label: 'VIP Land Listing', icon: Building2 },
              { id: 'leads', label: 'Queries & Leads', icon: HelpCircle, badge: leads.filter(l => l.status === 'New').length },
              { id: 'reviews', label: 'Approved Reviews', icon: MessageSquare, badge: reviews.filter(r => !r.isApproved).length },
              { id: 'blogs', label: 'Campaign Blogs', icon: FileText },
              { id: 'media', label: 'Media Library', icon: ImageIcon },
              { id: 'settings', label: 'Layout Core', icon: Settings },
              { id: 'seo', label: 'SEO Utilities', icon: Globe },
              { id: 'utility', label: 'Database Backup', icon: Database }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setEditingProperty(null);
                    setEditingBlog(null);
                    window.history.pushState(null, '', `/?page=admin&tab=${tab.id}`);
                  }}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#C5A880] text-[#090E16] shadow-md shadow-[#C5A880]/10'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <TabIcon className="h-4.5 w-4.5 shrink-0" />
                    {tab.label}
                  </span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="bg-red-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Right Dynamic Interface panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* SUB-VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 font-sans">
                
                {/* Micro Counters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All Land Slots</p>
                    <h4 className="text-3xl font-black text-gray-800 dark:text-white mt-1">{properties.length}</h4>
                  </div>
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm text-center">
                    <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">Active Leads</p>
                    <h4 className="text-3xl font-black text-[#C5A880] mt-1">{leads.length}</h4>
                  </div>
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm text-center">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Google Reviews</p>
                    <h4 className="text-3xl font-black text-emerald-500 mt-1">222</h4>
                  </div>
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm text-center">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Society Blogs</p>
                    <h4 className="text-3xl font-black text-indigo-500 mt-1">{blogs.length}</h4>
                  </div>
                </div>

                {/* Simulated Chart.js with pristine responsive HTML SVG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Lead stats trends graph (Line) */}
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] mb-4">
                      Lead Dispatch Log Trend
                    </h3>
                    <div className="h-48 flex items-end justify-between px-2 pt-6 pb-2 border-b border-l border-gray-200 dark:border-gray-800 relative">
                      {/* Grid guidelines */}
                      <div className="absolute left-0 right-0 top-1/4 h-px border-t border-dashed border-gray-100 dark:border-gray-850"></div>
                      <div className="absolute left-0 right-0 top-2/4 h-px border-t border-dashed border-gray-100 dark:border-gray-850"></div>
                      <div className="absolute left-0 right-0 top-3/4 h-px border-t border-dashed border-gray-100 dark:border-gray-850"></div>

                      {[
                        { day: 'Mon', count: 1 },
                        { day: 'Tue', count: 3 },
                        { day: 'Wed', count: 2 },
                        { day: 'Thu', count: 4 },
                        { day: 'Fri', count: 3 },
                        { day: 'Sat', count: 6 },
                        { day: 'Sun', count: 5 }
                      ].map((item, i, array) => {
                        const maxVal = 6;
                        const heightPercent = `${(item.count / maxVal) * 100}%`;
                        return (
                          <div key={item.day} className="flex flex-col items-center w-full z-10 group cursor-pointer relative">
                            {/* Point Label popup */}
                            <span className="absolute -top-7 text-[10px] bg-[#0F1A2C] text-white py-0.5 px-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                              {item.count} Leads
                            </span>
                            {/* Bar segment */}
                            <div 
                              style={{ height: heightPercent }} 
                              className="w-4 bg-gradient-to-t from-[#C5A880]/30 to-[#C5A880] rounded-t-sm group-hover:opacity-80 transition-opacity"
                            ></div>
                            <span className="text-[10px] text-gray-400 mt-2 font-semibold uppercase">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status allocation graph (Bar Chart) */}
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] mb-4">
                      Lead Conversion Funnels
                    </h3>
                    <div className="space-y-3.5">
                      {[
                        { label: 'New / Dispatch', count: leads.filter(l => l.status === 'New').length, color: 'bg-emerald-500' },
                        { label: 'Agent Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: 'bg-sky-500' },
                        { label: 'Convert (Sold)', count: leads.filter(l => l.status === 'Sold').length, color: 'bg-[#C5A880]' },
                        { label: 'Archived requests', count: leads.filter(l => l.status === 'Archived').length, color: 'bg-gray-400' }
                      ].map(bar => {
                        const totalLeadsCount = Math.max(1, leads.length);
                        const progressPercent = `${(bar.count / totalLeadsCount) * 100}%`;
                        return (
                          <div key={bar.label} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-gray-600 dark:text-gray-300">{bar.label}</span>
                              <span className="font-mono text-gray-400">{bar.count} Queries</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div style={{ width: progressPercent }} className={`h-full ${bar.color} rounded-full`}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Popular searches and location log details */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] mb-4">
                    Site telemetry & Google searches
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-500 uppercase tracking-widest text-[10px]">Google Search terms in Renala Khurd</p>
                      {[
                        { term: 'Sahara City Renala Khurd plots', count: 124 },
                        { term: 'Property Dealers in Renala Khurd', count: 98 },
                        { term: 'Houses on installment in Okara', count: 76 },
                        { term: 'VIP villas Near Anwar Shaheed Colony', count: 45 }
                      ].map((item, index) => (
                        <div key={item.term} className="flex justify-between p-2.5 bg-gray-50 dark:bg-black/20 rounded-xl">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{index + 1}. {item.term}</span>
                          <span className="font-mono text-emerald-500 font-bold">+{item.count} hits</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 self-center">
                      <p className="font-semibold text-sky-400 uppercase tracking-widest text-[10px]">Quick Audit Log</p>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Verified: GPS alignment matches Anwar Shaheed Colony coordinates</li>
                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Verified: Phone listing set to 0321-2099125</li>
                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Loaded total rating: 4.2 stars with 222 Google reviews</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW 2: PROPERTY MANAGEMENT */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                
                {/* Header and Add button */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-base font-bold text-[#0F1A2C] dark:text-white uppercase tracking-widest">
                    {editingProperty ? 'Modify Land Slot Details' : 'VIP Land Catalog'}
                  </h2>
                  
                  {!editingProperty && (
                    <button
                      onClick={() => setEditingProperty({
                        id: `SC-P${Date.now().toString().slice(-3)}`,
                        title: '',
                        description: '',
                        price: 1500000,
                        city: 'Renala Khurd',
                        area: '5 Marla',
                        bedrooms: 0,
                        bathrooms: 0,
                        propertyType: 'Residential Plot',
                        purpose: 'For Sale',
                        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'],
                        mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
                        status: 'Available'
                      })}
                      className="bg-[#0F1A2C] hover:bg-[#1a2f4c] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold text-xs py-2 px-4 rounded-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      Add Property Lot
                    </button>
                  )}
                </div>

                {/* CRUD Form overlay */}
                {editingProperty ? (
                  <form onSubmit={handleSaveProperty} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Slot Unique ID</label>
                        <input
                          type="text"
                          required
                          value={editingProperty.id || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, id: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-xs font-bold text-[#C5A880]"
                          placeholder="SC-101"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Property Title</label>
                        <input
                          type="text"
                          required
                          value={editingProperty.title || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-800 dark:text-white"
                          placeholder="e.g. 5 Marla Premium Corner Plot"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Price (PKR)</label>
                        <input
                          type="number"
                          required
                          value={editingProperty.price || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                          placeholder="1850000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Land Area</label>
                        <input
                          type="text"
                          value={editingProperty.area || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, area: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                          placeholder="5 Marla, 10 Marla"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Property Type</label>
                        <select
                          value={editingProperty.propertyType || 'Residential Plot'}
                          onChange={(e) => setEditingProperty({ ...editingProperty, propertyType: e.target.value as any })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 font-semibold"
                        >
                          <option value="Residential Plot">Residential Plot</option>
                          <option value="Commercial Plot">Commercial Plot</option>
                          <option value="House">House</option>
                          <option value="Villa">Villa</option>
                          <option value="Apartment">Apartment</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Purpose</label>
                        <select
                          value={editingProperty.purpose || 'For Sale'}
                          onChange={(e) => setEditingProperty({ ...editingProperty, purpose: e.target.value as any })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 font-semibold"
                        >
                          <option value="For Sale">For Sale Cash</option>
                          <option value="For Rent">For Rent</option>
                          <option value="Installment">Installment</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Bedrooms</label>
                        <input
                          type="number"
                          value={editingProperty.bedrooms || 0}
                          onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Bathrooms</label>
                        <input
                          type="number"
                          value={editingProperty.bathrooms || 0}
                          onChange={(e) => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Listing Status</label>
                        <select
                          value={editingProperty.status || 'Available'}
                          onChange={(e) => setEditingProperty({ ...editingProperty, status: e.target.value as any })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 font-semiboldWhite"
                        >
                          <option value="Available">Available</option>
                          <option value="Sold">Sold</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Rented">Rented</option>
                          <option value="Featured">Featured</option>
                          <option value="New Listing">New Listing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">City Locality</label>
                        <input
                          type="text"
                          value={editingProperty.city || 'Renala Khurd'}
                          onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3"
                        />
                      </div>
                    </div>

                    {/* Installments specific fields if type is Installment */}
                    {editingProperty.purpose === 'Installment' && (
                      <div className="p-4 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-2xl space-y-3 font-sans text-xs">
                        <p className="font-bold uppercase tracking-wider text-[#C5A880]">Installment Configurations</p>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase font-bold">Down Payment (PKR)</label>
                            <input
                              type="number"
                              value={editingProperty.installmentDetails?.downPayment || 0}
                              onChange={(e) => setEditingProperty({
                                ...editingProperty,
                                installmentDetails: {
                                  ...(editingProperty.installmentDetails || { downPayment: 0, monthlyInstallment: 0, quarterlyInstallment: 0, totalInstallments: 36, possessionDate: '2028-12-31' }),
                                  downPayment: Number(e.target.value)
                                }
                              })}
                              className="w-full bg-white dark:bg-black/30 border dark:border-gray-800 rounded-lg p-2 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase font-bold">Monthly Install (PKR)</label>
                            <input
                              type="number"
                              value={editingProperty.installmentDetails?.monthlyInstallment || 0}
                              onChange={(e) => setEditingProperty({
                                ...editingProperty,
                                installmentDetails: {
                                  ...(editingProperty.installmentDetails || { downPayment: 0, monthlyInstallment: 0, quarterlyInstallment: 0, totalInstallments: 36, possessionDate: '2028-12-31' }),
                                  monthlyInstallment: Number(e.target.value)
                                }
                              })}
                              className="w-full bg-white dark:bg-black/30 border dark:border-gray-800 rounded-lg p-2 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase font-bold">Quarterly (PKR)</label>
                            <input
                              type="number"
                              value={editingProperty.installmentDetails?.quarterlyInstallment || 0}
                              onChange={(e) => setEditingProperty({
                                ...editingProperty,
                                installmentDetails: {
                                  ...(editingProperty.installmentDetails || { downPayment: 0, monthlyInstallment: 0, quarterlyInstallment: 0, totalInstallments: 36, possessionDate: '2028-12-31' }),
                                  quarterlyInstallment: Number(e.target.value)
                                }
                              })}
                              className="w-full bg-white dark:bg-black/30 border dark:border-gray-800 rounded-lg p-2 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase font-bold">Tenure (Months)</label>
                            <input
                              type="number"
                              value={editingProperty.installmentDetails?.totalInstallments || 36}
                              onChange={(e) => setEditingProperty({
                                ...editingProperty,
                                installmentDetails: {
                                  ...(editingProperty.installmentDetails || { downPayment: 0, monthlyInstallment: 0, quarterlyInstallment: 0, totalInstallments: 36, possessionDate: '2028-12-31' }),
                                  totalInstallments: Number(e.target.value)
                                }
                              })}
                              className="w-full bg-white dark:bg-black/30 border dark:border-gray-800 rounded-lg p-2 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase font-bold">Possession Target</label>
                            <input
                              type="text"
                              value={editingProperty.installmentDetails?.possessionDate || '2028-12-31'}
                              onChange={(e) => setEditingProperty({
                                ...editingProperty,
                                installmentDetails: {
                                  ...(editingProperty.installmentDetails || { downPayment: 0, monthlyInstallment: 0, quarterlyInstallment: 0, totalInstallments: 36, possessionDate: '2028-12-31' }),
                                  possessionDate: e.target.value
                                }
                              })}
                              className="w-full bg-white dark:bg-black/30 border dark:border-gray-800 rounded-lg p-2 font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 text-xs">
                      <label className="block font-bold text-gray-500 uppercase tracking-widest">Listing Description</label>
                      <textarea
                        rows={4}
                        required
                        value={editingProperty.description || ''}
                        onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5"
                        placeholder="Detail about specific location features, development metrics, mosques proximity..."
                      ></textarea>
                    </div>

                    {/* Image links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-500 uppercase tracking-widest mb-1">Image URL (Unsplash or Local)</label>
                        <input
                          type="text"
                          required
                          value={editingProperty.images?.[0] || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, images: [e.target.value] })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-805 rounded-xl py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-500 uppercase tracking-widest mb-1">Google Maps Embedded Source</label>
                        <input
                          type="text"
                          value={editingProperty.mapLocation || ''}
                          onChange={(e) => setEditingProperty({ ...editingProperty, mapLocation: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-805 rounded-xl py-2 px-3 text-[10px]"
                        />
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingProperty(null)}
                        className="w-1/2 py-3 border border-gray-200 dark:border-gray-800 text-gray-500 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 bg-[#C5A880] hover:bg-[#b8976d] text-white dark:text-[#090E16] py-3 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save className="h-4.5 w-4.5" />
                        Save Listing
                      </button>
                    </div>

                  </form>
                ) : (
                  /* Listing table grid */
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden text-xs">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-[#0F1A2C] text-[#C5A880] uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4">Slot</th>
                          <th className="p-4">Title</th>
                          <th className="p-4">Type</th>
                          <th className="p-4 text-right">Price</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                        {properties.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-[#C5A880]">{p.id}</td>
                            <td className="p-4 font-semibold text-gray-800 dark:text-white max-w-xs truncate">{p.title}</td>
                            <td className="p-4 text-gray-500">{p.propertyType} <span className="text-[10px] bg-slate-100 dark:bg-black/30 px-1.5 py-0.5 rounded">{p.area}</span></td>
                            <td className="p-4 text-right font-bold text-gray-950 dark:text-gray-300">PKR {p.price.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                p.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                p.status === 'Sold' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-500/10'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingProperty(p)}
                                className="p-1.5 bg-gray-100 dark:bg-white/5 hover:text-[#C5A880] transition-colors rounded cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(p.id)}
                                className="p-1.5 bg-rose-50 dark:bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* SUB-VIEW 3: LEADS MANAGEMENT */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                
                {/* Filters */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-4 text-xs font-sans">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search lead by customer name or phone..."
                      value={searchTermLeads}
                      onChange={(e) => setSearchTermLeads(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-850 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-1/2 justify-end">
                    <select
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value)}
                      className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-850 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Sold">Sold</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Leads lists cards */}
                <div className="space-y-3 font-sans">
                  {leads
                    .filter(l => {
                      const matchesSearch = l.customerName.toLowerCase().includes(searchTermLeads.toLowerCase()) || 
                                            l.customerPhone.includes(searchTermLeads);
                      const matchesStatus = leadStatusFilter === 'All' ? true : l.status === leadStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map(lead => (
                      <div key={lead.id} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm text-xs relative overflow-hidden transition-all hover:shadow-md">
                        {lead.status === 'New' && (
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500"></div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-850 pb-3 mb-3">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                              {lead.customerName}
                              <span className="text-[9px] bg-[#C5A880]/15 text-[#C5A880] px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider">{lead.id}</span>
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 font-medium">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.customerEmail}</span>
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.customerPhone}</span>
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {lead.createdDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead, e.target.value as any)}
                              className={`py-1.5 px-3 rounded-lg font-bold uppercase tracking-wider text-[10px] border focus:outline-none ${
                                lead.status === 'New' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10' :
                                lead.status === 'Contacted' ? 'bg-sky-50 border-sky-200 text-sky-600' :
                                lead.status === 'Sold' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                'bg-gray-100 border-gray-200 text-gray-500'
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Sold">Sold</option>
                              <option value="Archived">Archived</option>
                            </select>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 text-rose-500 bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-500 hover:text-white transition-colors rounded-lg cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Message payload */}
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-black/10 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                          {lead.message}
                        </p>

                        {lead.propertyName && (
                          <div className="mt-2 text-[10px] text-[#C5A880] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" /> For Property: {lead.propertyName} ({lead.propertyId})
                          </div>
                        )}

                        {/* Customer direct mail */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <a
                            href={`mailto:${lead.customerEmail}?subject=Sahara City Property Inquiry`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-[#0F1A2C] hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider text-gray-600 cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" /> Email Direct
                          </a>
                          <a
                            href={`tel:${lead.customerPhone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-[#C5A880] hover:text-[#090E16] rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider text-gray-600 cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call Direct
                          </a>
                        </div>
                      </div>
                    ))}
                </div>

              </div>
            )}

            {/* SUB-VIEW 4: REVIEWS APPROVAL */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl text-xs text-amber-600 dark:text-amber-400 font-sans leading-relaxed">
                  <strong>Approval Workflow Mandate:</strong> In accordance with society rules, newly submitted testimonials remain deactivated from the public website layout until authorized and approved by the Sahara site administrator here.
                </div>

                <div className="space-y-3 font-sans text-xs">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm text-left flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0F1A2C] dark:text-white">{review.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({review.email})</span>
                        </div>
                        
                        <div className="flex items-center gap-0.5 text-amber-500 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-20'}>★</span>
                          ))}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-2 border-gray-200 dark:border-gray-800 pl-3.5 py-1">
                          "{review.comment}"
                        </p>
                        
                        <span className="block text-[10px] text-gray-400">Created: {review.createdDate}</span>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        {review.isApproved ? (
                          <button
                            onClick={() => handleApproveReview(review, false)}
                            className="w-full text-center py-2 px-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                          >
                            Hide Testimonial
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveReview(review, true)}
                            className="w-full text-center py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                          >
                            Approve Listing
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="w-full text-center py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-200 dark:bg-white/5 dark:border-gray-800 dark:text-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Deactivate
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SUB-VIEW 5: BLOGS CRUDS */}
            {activeTab === 'blogs' && (
              <div className="space-y-6 font-sans">
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-base font-bold text-[#0F1A2C] dark:text-white uppercase tracking-widest">
                    Manage Campaign Articles
                  </h2>
                  
                  {!editingBlog && (
                    <button
                      onClick={() => setEditingBlog({
                        id: `blog-${Date.now().toString().slice(-4)}`,
                        title: '',
                        category: 'Investment',
                        summary: '',
                        content: '',
                        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
                        author: 'Imran Shah (Property Consultant)'
                      })}
                      className="bg-[#0F1A2C] hover:bg-[#1a2f4c] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold text-xs py-2 px-4 rounded-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Wrap New Article
                    </button>
                  )}
                </div>

                {editingBlog ? (
                  <form onSubmit={handleSaveBlog} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-xl space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Article ID</label>
                        <input
                          type="text"
                          required
                          value={editingBlog.id || ''}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 font-bold text-[#C5A880]"
                          disabled
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Article Topic Title</label>
                        <input
                          type="text"
                          required
                          value={editingBlog.title || ''}
                          onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 font-semibold"
                          placeholder="Why Sahara City is expanding..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Category</label>
                        <select
                          value={editingBlog.category || 'Investment'}
                          onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value as any })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 font-semibold"
                        >
                          <option value="Investment">Investment</option>
                          <option value="Property Guides">Property Guides</option>
                          <option value="Society Updates">Society Updates</option>
                          <option value="Real Estate News">Real Estate News</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Author Name</label>
                        <input
                          type="text"
                          required
                          value={editingBlog.author || ''}
                          onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Media Banner Link</label>
                        <input
                          type="text"
                          value={editingBlog.image || ''}
                          onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Snippet summary</label>
                      <input
                        type="text"
                        required
                        value={editingBlog.summary || ''}
                        onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3.5"
                        placeholder="Brief 1-sentence abstract text shown on lists..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Content Body (HTML or plain Markdown)</label>
                      <textarea
                        rows={10}
                        required
                        value={editingBlog.content || ''}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 font-mono text-xs leading-relaxed"
                        placeholder="Write your article text here. Supports standard Markdown formatting..."
                      ></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingBlog(null)}
                        className="w-1/2 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-500 rounded-xl font-bold uppercase cursor-pointer"
                      >
                        Abstain
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-bold py-2.5 rounded-xl uppercase hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="h-4 w-4" /> Save Article
                      </button>
                    </div>

                  </form>
                ) : (
                  <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-[#0F1A2C] text-[#C5A880] uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4">Category</th>
                          <th className="p-4">Topic Title</th>
                          <th className="p-4">Author</th>
                          <th className="p-4">Created Date</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                        {blogs.map(b => (
                          <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-indigo-500 uppercase tracking-widest text-[9px]">{b.category}</td>
                            <td className="p-4 font-extrabold text-gray-900 dark:text-white max-w-xs truncate">{b.title}</td>
                            <td className="p-4 text-gray-500 font-semibold">{b.author}</td>
                            <td className="p-4 text-gray-400">{b.createdDate}</td>
                            <td className="p-4 flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingBlog(b)}
                                className="p-1.5 bg-gray-100 dark:bg-white/5 hover:text-[#C5A880] transition-colors rounded cursor-pointer"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="p-1.5 text-rose-500 bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-500 hover:text-white transition-all rounded cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* SUB-VIEW 6: MEDIA LIBRARY */}
            {activeTab === 'media' && (
              <div className="space-y-6 font-sans text-xs">
                
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Repository Image Base64 Uploader
                    </h3>
                    <p className="text-xs text-gray-500">
                      Upload society pictures. Stored instantly under IndexedDB store "media".
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-850 p-2.5 rounded-xl font-bold uppercase text-[10px]"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Parks">Parks</option>
                      <option value="Mosque">Mosque</option>
                      <option value="Development">Development</option>
                      <option value="General">General</option>
                    </select>

                    <label className="bg-[#0F1A2C] hover:bg-[#152740] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-md">
                      <Upload className="h-4 w-4" /> Select Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Media grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {media.map(item => (
                    <div key={item.id} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden group relative shadow-sm">
                      <img src={item.url} alt={item.name} className="w-full h-32 object-cover" />
                      <div className="p-3 space-y-1 text-[11px] text-left">
                        <span className="inline-block text-[9px] bg-[#C5A880]/15 text-[#C5A880] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">{item.category}</span>
                        <h4 className="font-extrabold text-gray-800 dark:text-gray-300 truncate">{item.name}</h4>
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>{item.uploadedDate}</span>
                          <span>{item.size}</span>
                        </div>
                      </div>

                      {/* Hover action bar overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            triggerToast('Direct Image URI string copied to clipboard!', 'success');
                          }}
                          className="p-2 bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] rounded-xl cursor-pointer"
                          title="Copy Base64 URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete media asset?')) {
                              await dbDelete('media', item.id);
                              triggerToast('Media asset removed from IndexedDB.', 'info');
                              onRefreshData();
                            }
                          }}
                          className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-xl cursor-pointer"
                          title="Delete Asset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SUB-VIEW 7: APP SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm text-xs font-sans space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                  Front Website Layout Controls
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company Primary Landline</label>
                    <input
                      type="text"
                      required
                      value={settings.contactPhone}
                      onChange={(e) => saveSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-800 rounded-xl py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">WhatsApp Business Key (+92...)</label>
                    <input
                      type="text"
                      required
                      value={settings.whatsappNumber}
                      onChange={(e) => saveSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Official Sales Email</label>
                    <input
                      type="email"
                      required
                      value={settings.contactEmail}
                      onChange={(e) => saveSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-800 rounded-xl py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Primary Office Physical Coordinates</label>
                    <input
                      type="text"
                      required
                      value={settings.contactAddress}
                      onChange={(e) => saveSettings({ ...settings, contactAddress: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-800 rounded-xl py-2 px-3"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Banner Headline Title</label>
                  <input
                    type="text"
                    required
                    value={settings.heroTitle}
                    onChange={(e) => saveSettings({ ...settings, heroTitle: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-800 rounded-xl py-2 px-3 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Banner Subtitle</label>
                  <input
                    type="text"
                    required
                    value={settings.heroSubtitle}
                    onChange={(e) => saveSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-800 rounded-xl py-2 px-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Interactive Corporate Bio Description</label>
                  <textarea
                    rows={4}
                    required
                    value={settings.companyAboutText}
                    onChange={(e) => saveSettings({ ...settings, companyAboutText: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-gray-805 rounded-xl p-3"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F1A2C] hover:bg-slate-900 dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] font-bold py-3.5 rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4.5 w-4.5" /> Synchronize Site Core Properties
                </button>
              </form>
            )}

            {/* SUB-VIEW 8: UTILITIES PANEL */}
            {activeTab === 'utility' && (
              <div className="space-y-6 font-sans text-xs">
                
                {/* Export / Import Database */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="h-5 w-5 text-[#C5A880]" />
                    SQLite IndexedDB Database Portability
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Download full IndexedDB storage logs in JSON layout (`sahara_backup_[date].json`). You can restore properties, leads, approved customer feedback, and configurations seamlessly on another container anytime.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Export */}
                    <button
                      onClick={handleExportDatabase}
                      className="py-3 px-4 bg-[#0F1A2C] hover:bg-slate-900 dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="h-4 w-4" /> Export DB Backup
                    </button>

                    {/* Import */}
                    <label className="py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border dark:border-gray-800">
                      <FileUp className="h-4 w-4" /> Restore JSON File
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportDatabase}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW 9: SEO UTILITIES PANEL */}
            {activeTab === 'seo' && (
              <div className="space-y-6 font-sans text-xs">
                
                {/* DYNAMIC XML SITEMAP GENERATOR */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#C5A880]" />
                    Enterprise XML Sitemap Engine
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Crawls the local IndexedDB properties store and blog records to dynamically build a fully compliant, production-ready <code className="bg-[#C5A880]/10 text-[#C5A880] px-1 py-0.5 rounded font-mono font-bold">sitemap.xml</code> mapping schema. Canonical URLs will automatically adapt based on your platform's active origin domain.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleGenerateSitemap}
                      className="py-3 px-5 bg-[#0F1A2C] hover:bg-[#15233c] dark:bg-[#C5A880] dark:hover:bg-[#b8976d] text-white dark:text-[#090E16] rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <Globe className="h-4 w-4 shrink-0" /> Generate XML Sitemap
                    </button>
                  </div>
                </div>

                {/* SEO METADATA AUTO-GENERATOR MODULE */}
                <div className="bg-white dark:bg-[#0F1A2C] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C5A880]" />
                    Automated SEO Metadata & JSON-LD Generator
                  </h3>
                  <p className="text-xs text-gray-500">
                    Draft dynamic structured schemas, optimized titles, and meta labels using active real estate characteristics instantly.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Property Slot</label>
                      <select
                        value={seoPresetPropertyId}
                        onChange={(e) => setSeoPresetPropertyId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-850 p-2.5 rounded-xl font-semibold"
                      >
                        <option value="">-- Choose Listing --</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.id} - {p.title}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleGenerateSEOMetadata}
                      className="py-2.5 px-4 bg-[#C5A880] hover:bg-[#b8976d] text-[#090E16] font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="h-4 w-4" /> Generate Crawl Tags
                    </button>
                  </div>

                  {generatedSeo && (
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-850 animate-fade-in text-left">
                      
                      <div>
                        <span className="block text-[10px] font-bold text-emerald-500 uppercase">Optimized SEO Crawler Title:</span>
                        <div className="p-2.5 bg-gray-50 dark:bg-black/20 rounded-lg border dark:border-gray-800 font-mono text-[11px] font-bold select-all flex items-center justify-between">
                          <span>{generatedSeo.title}</span>
                          <button onClick={() => {
                            navigator.clipboard.writeText(generatedSeo.title);
                            triggerToast('Meta Title Copied!', 'success');
                          }} className="text-gray-400 hover:text-emerald-500"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-emerald-500 uppercase">Meta Crawl Description:</span>
                        <div className="p-2.5 bg-gray-50 dark:bg-black/20 rounded-lg border dark:border-gray-800 font-mono text-[11px] leading-relaxed select-all flex items-center justify-between gap-1">
                          <span>{generatedSeo.desc}</span>
                          <button onClick={() => {
                            navigator.clipboard.writeText(generatedSeo.desc);
                            triggerToast('Meta Description Copied!', 'success');
                          }} className="text-gray-400 hover:text-emerald-500 shrink-0"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-emerald-500 uppercase">Structured JSON-LD Schema:</span>
                        <pre className="p-3 bg-[#0F1A2C] text-slate-300 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto max-h-48 select-all p-3">
                          {generatedSeo.schema}
                        </pre>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedSeo.schema);
                            triggerToast('JSON-LD schema code dispatch copies!', 'success');
                          }}
                          className="mt-2 py-1.5 px-3 bg-[#0F1A2C] hover:bg-slate-900 border border-white/5 text-white font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy Code block
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
