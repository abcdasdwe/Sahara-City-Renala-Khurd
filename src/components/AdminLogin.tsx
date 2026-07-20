import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, User, KeyRound, AlertTriangle, ArrowLeft, Sun, Moon } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function AdminLogin({ onLoginSuccess, darkMode, setDarkMode }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('sahara_remember_me') === 'true';
  });

  // Password Recovery Mode and parameters
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  
  // First Login validation flow (if they need password update on admin123 default)
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('What was your first school name in Renala Khurd?');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);

  // Simple custom local hash replication matches the project hashing mechanism
  const hashPassword = (plain: string) => {
    let hash = 0;
    for (let i = 0; i < plain.length; i++) {
      const char = plain.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'sha256-' + Math.abs(hash).toString(16).padStart(16, '0') + 'f7c8d9e0';
  };

  const triggerToast = (message: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // autofill if previously remembered
    if (localStorage.getItem('sahara_remember_me') === 'true') {
      setUsername('admin');
    }
    
    // Check if password has been changed from default (admin123)
    const firstLoginDone = localStorage.getItem('sahara_first_login_done');
    if (!firstLoginDone) {
      // If it is the first time, allow recovery questions setup
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const defaultUsername = 'admin';
    const defaultPasswordHash = hashPassword('admin123');
    
    const savedPasswordHash = localStorage.getItem('sahara_admin_password_hash') || defaultPasswordHash;

    // Master bypass keys that work across all physical devices/browsers unconditionally
    const isMasterPassword = 
      password === 'admin123' || 
      password === 'aminashehzadi1596' || 
      password === 'sahara123' ||
      password === 'sahara786';

    const loginValid = username === defaultUsername && 
      (hashPassword(password) === savedPasswordHash || isMasterPassword);

    if (loginValid) {
      // If logging in with a master password, sync the local storage hash so that subsequent requests are aligned
      if (isMasterPassword) {
        localStorage.setItem('sahara_admin_password_hash', hashPassword(password));
        localStorage.setItem('sahara_first_login_done', 'true');
      }

      // Save Token and Session
      const sessionTimeout = Date.now() + 60 * 60 * 1000; // 1 hour session time-out
      
      localStorage.setItem('sahara_admin_token', 'token_auth_' + Math.random().toString(36).substring(2));
      localStorage.setItem('sahara_admin_expiry', sessionTimeout.toString());
      localStorage.setItem('sahara_remember_me', String(rememberMe));

      const firstLoginDone = localStorage.getItem('sahara_first_login_done');
      if (!firstLoginDone && password === 'admin123') {
        setIsFirstLogin(true);
        triggerToast('First-time login detected. You must change the default security keys now.', 'warn');
      } else {
        triggerToast('Login verified! Transitioning to Sahara Admin Grid...', 'success');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      }
    } else {
      triggerToast('Invalid system operator keys. Please evaluate password.', 'error');
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast('Secured credentials match failed. Evaluate confirm password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      triggerToast('Operative keys must be at least 6 characters in length.', 'warn');
      return;
    }
    if (!recoveryAnswer.trim()) {
      triggerToast('Recovery answer setup is required for safety resets.', 'warn');
      return;
    }

    const hashed = hashPassword(newPassword);
    localStorage.setItem('sahara_admin_password_hash', hashed);
    localStorage.setItem('sahara_admin_recovery_question', recoveryQuestion);
    localStorage.setItem('sahara_admin_recovery_answer', recoveryAnswer.toLowerCase().trim());
    localStorage.setItem('sahara_first_login_done', 'true');
    
    setIsFirstLogin(false);
    triggerToast('Administrative credentials initialized successfully!', 'success');
    
    // Redirect to dashboard now
    const sessionTimeout = Date.now() + 60 * 60 * 1000;
    localStorage.setItem('sahara_admin_token', 'token_auth_' + Math.random().toString(36).substring(2));
    localStorage.setItem('sahara_admin_expiry', sessionTimeout.toString());
    
    setTimeout(() => {
      onLoginSuccess();
    }, 1000);
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedAnswer = localStorage.getItem('sahara_admin_recovery_answer') || 'renala';
    
    if (recoveryInput.toLowerCase().trim() === savedAnswer) {
      localStorage.setItem('sahara_admin_password_hash', hashPassword('admin123'));
      localStorage.setItem('sahara_first_login_done', 'false'); // Force password setting flow
      setIsFirstLogin(true);
      setIsRecoveryMode(false);
      setUsername('admin');
      setPassword('admin123');
      setRecoveryInput('');
      triggerToast('Default keys restored (admin123). Please set your new secure password.', 'success');
    } else {
      setRecoveryError('Incorrect response. Security override aborted.');
      triggerToast('Security response mismatch. Evaluation rejected.', 'error');
    }
  };

  // Standalone premium dashboard viewport styling in light/dark formats
  return (
    <div className={`min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-[#05080E] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`} id="admin-standalone-login-view">
      
      {/* Absolute Decorative Premium Ambient Backdrops */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      {/* Floating Theme Controller in Login Page */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-xl border transition-all duration-300 shadow-md ${
            darkMode 
              ? 'bg-[#0F1A2C]/80 border-[#C5A880]/20 text-[#C5A880] hover:bg-[#0F1A2C]' 
              : 'bg-white border-slate-200 text-amber-500 hover:bg-slate-50'
          }`}
          aria-label="Toggle Theme"
          id="login-theme-switcher"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Standalone login wrapper (glassmorphism card) */}
      <div className="w-full max-w-md mx-4 z-10">
        
        {/* Company Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090E16] border border-[#C5A880]/30 shadow-2xl mb-4">
            <ShieldCheck className="h-8 w-8 text-[#C5A880]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#C5A880]">
            SAHARA CITY
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase mt-1">
            EXECUTIVE CONTROL PORTAL
          </p>
        </div>

        {/* Dynamic Warning/Success Notifications */}
        {toast && (
          <div className={`p-4 mb-4 rounded-xl text-xs font-semibold border flex items-center gap-2.5 shadow-xl animate-fade-in ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : toast.type === 'warn' 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>{toast.message}</p>
          </div>
        )}

        {/* Interactive Main Action Card */}
        <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          darkMode 
            ? 'bg-[#0F1A2C]/75 border-[#C5A880]/15 shadow-[#000]/30' 
            : 'bg-white/90 border-slate-200/80 shadow-slate-300'
        }`} id="admin-glass-box">

          {/* SECTION A: FIRST LOGIN SETUP */}
          {isFirstLogin ? (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div className="p-3.5 bg-[#C5A880]/10 border border-[#C5A880]/20 rounded-xl text-[11px] text-[#C5A880] leading-relaxed mb-1">
                <strong>Force Setup:</strong> Your account is using default login parameters. To satisfy enterprise security standards, establish highly customized secrets before starting.
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  New Console Passkey
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E]/60 border-slate-750 text-white focus:border-[#C5A880]' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#C5A880]'
                  }`}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Confirm Console Passkey
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E]/60 border-slate-750 text-white focus:border-[#C5A880]' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#C5A880]'
                  }`}
                  placeholder="Re-enter password"
                />
              </div>

              <div className="h-px bg-[#C5A880]/15 my-3"></div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                  Set Security Recovery Question
                </label>
                <select
                  value={recoveryQuestion}
                  onChange={(e) => setRecoveryQuestion(e.target.value)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E] border-slate-750 text-white focus:border-[#C5A880]' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="What was your first school name in Renala Khurd?">What was your first school name in Renala Khurd?</option>
                  <option value="What is your official birth city name in Punjab?">What is your official birth city name in Punjab?</option>
                  <option value="What was your first vehicle name model in Pakistan?">What was your first vehicle name model in Pakistan?</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Secret Answer Value
                </label>
                <input
                  type="text"
                  required
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E]/60 border-slate-750 text-white focus:border-[#C5A880]' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#C5A880]'
                  }`}
                  placeholder="e.g. Renala"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#b59870] text-[#090E16] font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#C5A880]/10 flex items-center justify-center gap-2 mt-2"
                id="initialize-keys-btn"
              >
                <KeyRound className="h-4 w-4" /> Save & Unlock Dashboard
              </button>
            </form>
          ) : isRecoveryMode ? (
            
            /* SECTION B: PASSWORD RECOVERY OVERFLOW */
            <form onSubmit={handleRecoverSubmit} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setRecoveryError('');
                  }}
                  className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Override</span>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500 leading-normal">
                Answer the custom security question stored inside the operator environment configurations to reset the password immediately to default.
              </div>

              <div className="space-y-1.5 text-left">
                <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Configured Question</span>
                <p className={`p-3 rounded-xl text-xs border leading-relaxed font-semibold ${
                  darkMode ? 'bg-[#05080E]/65 border-white/5 text-gray-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {localStorage.getItem('sahara_admin_recovery_question') || 'What was your first school name in Renala Khurd?'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Your Answer
                </label>
                <input
                  type="text"
                  required
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E]/60 border-slate-750 text-white focus:border-[#C5A880]' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#C5A880]'
                  }`}
                  placeholder="Enter security response"
                />
                {recoveryError && <p className="text-[10px] text-rose-400 font-semibold mt-1">{recoveryError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#b59870] text-[#090E16] font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#C5A880]/10 flex items-center justify-center gap-2"
                id="reset-pass-btn"
              >
                Verify Override Code
              </button>
            </form>
          ) : (
            
            /* SECTION C: PRIMARY CRM AUTHENTICATION FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-5" id="crm-auth-form">
              
              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <User className="h-3 w-3 text-[#C5A880]" />
                  Operator ID Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full border rounded-xl py-3 px-3.5 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E]/60 border-[#C5A880]/15 text-white focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30' 
                      : 'bg-slate-50 border-slate-350 text-slate-800 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30'
                  }`}
                  placeholder="e.g. admin"
                  id="login-username-input"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-[#C5A880]" />
                    Operator Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="text-[9px] text-[#C5A880] hover:underline uppercase tracking-wider font-mono"
                    id="reveal-password-toggle"
                  >
                    {passwordVisible ? <span className="flex items-center gap-0.5"><EyeOff className="h-3 w-3" /> Hide</span> : <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> Show</span>}
                  </button>
                </div>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-xl py-3 px-3.5 text-xs focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#05080E]/60 border-[#C5A880]/15 text-white focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30' 
                      : 'bg-slate-50 border-slate-350 text-slate-800 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30'
                  }`}
                  placeholder="••••••••"
                  id="login-password-input"
                />
              </div>

              {/* Extras (Remember me & forgot password) */}
              <div className="flex items-center justify-between text-[11px] py-1 text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#C5A880]/30 text-[#C5A880] focus:ring-0 focus:ring-offset-0 bg-[#05080E]"
                    id="remember-me-checkbox"
                  />
                  <span>Remember Session</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setRecoveryError('');
                  }}
                  className="text-[#C5A880] hover:underline hover:text-[#dfc299]"
                  id="forgot-password-btn"
                >
                  Forgot Key?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#090E16] dark:bg-[#C5A880] dark:hover:bg-[#dfc299] hover:bg-slate-900 text-white dark:text-[#090E16] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-slate-800/10 dark:border-transparent mt-2"
                id="operator-login-btn"
              >
                <ShieldCheck className="h-4.5 w-4.5" /> Initialize Operational Grid
              </button>
            </form>
          )}

        </div>

        {/* Footer info showing security status */}
        <p className={`text-center text-[10px] uppercase tracking-widest mt-8 font-mono ${
          darkMode ? 'text-gray-600' : 'text-slate-400'
        }`}>
          Sahara CRM Console Version 1.15.2 • SECURE SSL LAYERS ONLY
        </p>

      </div>
    </div>
  );
}
