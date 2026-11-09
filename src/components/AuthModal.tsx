import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  X,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { User as UserType } from '../types/drive';

export type AuthTab = 'google' | 'signin' | 'admin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType, token: string) => void;
  initialTab?: AuthTab;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'google',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('fgfftgtiujk@gmail.com');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'admin') {
      setUsername('Eyad.Eliwa');
      setPassword('Y@sser3767');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleGoogleSignIn = async (customEmail?: string) => {
    const targetEmail = customEmail || googleEmail;
    if (!targetEmail.trim()) {
      setError('Please provide a Google email address');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          name: targetEmail.split('@')[0],
          googleId: `gid_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google sign-in failed');
      }
      onSuccess(data.user, data.token);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        // Dedicated admin login with Username and Password
        const res = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid administrator credentials');
        }
        onSuccess(data.user, data.token);
        onClose();
      } else if (activeTab === 'signup') {
        // Create user account with Email
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: fullName.trim() || email.split('@')[0],
            planId: 'free',
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create account');
        }
        onSuccess(data.user, data.token);
        onClose();
      } else {
        // Sign in with Email and Password
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: email.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid email or password');
        }
        onSuccess(data.user, data.token);
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900 transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto mb-3 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
            {activeTab === 'admin' ? (
              <ShieldCheck className="w-7 h-7 text-yellow-300" />
            ) : activeTab === 'google' ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#ffffff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#ffffff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#ffffff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ) : (
              <Sparkles className="w-7 h-7 text-white" />
            )}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {activeTab === 'google'
              ? 'Sign in with Google'
              : activeTab === 'admin'
              ? 'Administrator Portal'
              : activeTab === 'signup'
              ? 'Create Eyad Drive Account'
              : 'Sign in to Eyad Drive'}
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            {activeTab === 'admin'
              ? 'Admin Eyad.Eliwa with unlimited cloud storage'
              : activeTab === 'google'
              ? 'One-click authenticated access linked to Google'
              : 'People create account with email; admin signs in with username & password'}
          </p>
        </div>

        {/* 4 Tabs: Google, Email Sign-In, Admin Tab, Create Account */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('google')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'google'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Email Login
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-gray-500 hover:text-amber-700'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-amber-500" />
            Admin Tab
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Sign in with Google */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
                <p className="text-xs text-gray-600">
                  Sign in immediately using your Google account to access your cross-device drive.
                </p>

                {/* Primary Google Auth Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleGoogleSignIn(googleEmail)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition cursor-pointer group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.5 1.9 7.2l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.9c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4L1.9 7.2C.7 9.6 0 12.2 0 15s.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Continue with Google ({googleEmail})</span>
                </button>
              </div>

              {/* Or enter another Google Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Or use another Google Email</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleGoogleSignIn()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2, 3, 4: Forms */}
          {activeTab !== 'google' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {activeTab === 'admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-950 text-xs rounded-xl flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Administrator Sign-In</p>
                    <p className="text-amber-800 mt-0.5 text-[11px]">
                      Username: <span className="font-mono font-bold">Eyad.Eliwa</span> • Password:{' '}
                      <span className="font-mono font-bold">Y@sser3767</span>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Email field for regular sign-in and signup */}
              {activeTab !== 'admin' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Username field for Admin */}
              {activeTab === 'admin' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Eyad.Eliwa"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {activeTab === 'admin'
                        ? 'Sign In as Admin (Eyad.Eliwa)'
                        : activeTab === 'signup'
                        ? 'Create Free 15GB Account with Email'
                        : 'Sign In with Email'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Click Fill Shortcuts */}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 text-center font-semibold uppercase tracking-wider">
              1-Click Demo Fill
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setUsername('Eyad.Eliwa');
                  setPassword('Y@sser3767');
                }}
                className="px-2.5 py-1.5 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin (Eyad.Eliwa)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn('alex.morgan@gmail.com')}
                className="px-2.5 py-1.5 text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Google (Alex Morgan)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
