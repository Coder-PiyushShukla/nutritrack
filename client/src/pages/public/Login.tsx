import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, AlertCircle, Loader2, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [email, setEmail] = useState('aarav.mehta@studio.com');
  const [password, setPassword] = useState('NutriTrack@2026');
  const [selectedRole, setSelectedRole] = useState<UserRole>('dieter');

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('dieter');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);

    if (role === 'dieter') {
      setEmail('aarav.mehta@studio.com');
      setPassword('NutriTrack@2026');
    } else if (role === 'nutritionist') {
      setEmail('maya.lin@clinical.org');
      setPassword('NutriTrack@2026');
    } else if (role === 'admin') {
      setEmail('sophia.aris@lead.net');
      setPassword('NutriTrack@2026');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.role === 'nutritionist') {
          navigate('/nutritionist');
        } else if (res.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await signup(signupName, signupEmail, signupPassword, signupRole);
      if (res.success) {
        setSuccessMessage('Account created successfully! Preparing your personalized sanctuary...');
        setTimeout(() => {
          if (res.role === 'dieter') {
            navigate('/onboarding');
          } else {
            navigate('/nutritionist');
          }
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check the fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest text-ivory flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden paper-grain-dark selection:bg-lime selection:text-forest">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-forest-light/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Link */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime text-forest flex items-center justify-center shadow-subtle">
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-current">
              <circle cx="50" cy="50" r="44" fill="#174A3A" />
              <path d="M35 65 C35 45, 65 55, 65 35 C65 55, 35 45, 35 65 Z" fill="#C6E86B" />
              <circle cx="50" cy="50" r="10" fill="#F6F4EA" />
            </svg>
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-ivory">
            NutriTrack
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold uppercase tracking-wider text-ivory/70 hover:text-ivory transition-colors"
        >
          ← Return to Editorial
        </Link>
      </div>

      {/* Centered Ivory Card on Forest Background */}
      <div className="w-full max-w-md mx-auto my-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-ivory text-forest rounded-3xl p-8 sm:p-10 shadow-lift border border-ivory/20 space-y-6"
        >
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 text-[11px] font-mono uppercase tracking-widest text-forest">
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span>Role-Based Authentication</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest tracking-tight">
              {mode === 'signin' ? 'Sign In to Your Sanctuary' : 'Join NutriTrack'}
            </h2>
            <p className="text-forest/70 text-xs sm:text-sm">
              {mode === 'signin'
                ? 'Sign in to access your customized role-specific workspace.'
                : 'Create your account, select your role, and configure your diet.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-forest/10 text-xs font-bold font-sans">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin' ? 'bg-forest text-ivory shadow-subtle' : 'text-forest/70 hover:text-forest'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup' ? 'bg-forest text-ivory shadow-subtle' : 'text-forest/70 hover:text-forest'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Validation Alert Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Authentication Notice</span>
                  <span>{errorMessage}</span>
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Success</span>
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODE 1: SIGN IN FORM */}
          {mode === 'signin' ? (
            <div className="space-y-5">
              {/* Demo Role Picker Pills */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                  Quick Demo Persona
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickRoleSelect('dieter')}
                    className={`py-2 px-1 text-xs font-bold rounded-full transition-all flex flex-col items-center gap-1 ${
                      selectedRole === 'dieter'
                        ? 'bg-lime text-forest shadow-subtle'
                        : 'bg-ivory-light border border-forest/10 text-forest/70 hover:border-forest/30'
                    }`}
                  >
                    <span>Dieter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRoleSelect('nutritionist')}
                    className={`py-2 px-1 text-xs font-bold rounded-full transition-all flex flex-col items-center gap-1 ${
                      selectedRole === 'nutritionist'
                        ? 'bg-forest text-ivory shadow-subtle'
                        : 'bg-ivory-light border border-forest/10 text-forest/70 hover:border-forest/30'
                    }`}
                  >
                    <span>Nutritionist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRoleSelect('admin')}
                    className={`py-2 px-1 text-xs font-bold rounded-full transition-all flex flex-col items-center gap-1 ${
                      selectedRole === 'admin'
                        ? 'border-2 border-forest text-forest bg-forest/10 font-bold'
                        : 'bg-ivory-light border border-forest/10 text-forest/70 hover:border-forest/30'
                    }`}
                  >
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1.5 block">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                      Password
                    </label>
                    <span className="text-[10px] text-forest/40 font-mono">
                      Demo: NutriTrack@2026
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-lime text-forest font-semibold py-3.5 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-6 text-sm disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-forest" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter As {selectedRole.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4 text-forest" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* MODE 2: SIGN UP / REGISTRATION FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Role Selection for New User */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('dieter')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupRole === 'dieter'
                        ? 'bg-forest text-ivory border-forest shadow-sm'
                        : 'bg-ivory-light text-forest border-forest/10 hover:border-forest/30'
                    }`}
                  >
                    <span className="font-serif font-bold text-sm block">Dieter</span>
                    <span className={`text-[11px] block ${signupRole === 'dieter' ? 'text-lime' : 'text-forest/60'}`}>
                      Personal Nourishment & Diary
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('nutritionist')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signupRole === 'nutritionist'
                        ? 'bg-forest text-ivory border-forest shadow-sm'
                        : 'bg-ivory-light text-forest border-forest/10 hover:border-forest/30'
                    }`}
                  >
                    <span className="font-serif font-bold text-sm block">Nutritionist</span>
                    <span className={`text-[11px] block ${signupRole === 'nutritionist' ? 'text-lime' : 'text-forest/60'}`}>
                      Clinical Practice & Clients
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyanshu Sharma"
                  value={signupName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupName(e.target.value)}
                  className="w-full px-4 py-3 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@sanctuary.com"
                  value={signupEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1.5 block">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={signupPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-lime text-forest font-semibold py-3.5 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-6 text-sm disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-forest" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {signupRole === 'dieter'
                        ? 'Sign Up & Begin Onboarding'
                        : 'Register Clinical Practice'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-forest" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Bottom minimalist credits */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-ivory/50 relative z-10">
        Kinfolk Editorial Design System • NutriTrack Role-Protected Architecture
      </div>
    </div>
  );
};

export default Login;
