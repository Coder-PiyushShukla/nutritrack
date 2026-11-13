import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLanding = location.pathname === '/';

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ivory/85 backdrop-blur-md shadow-subtle py-3 border-b border-forest/10'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-lime shadow-subtle transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-current">
              <circle cx="50" cy="50" r="44" fill="#174A3A" />
              <path d="M35 65 C35 45, 65 55, 65 35 C65 55, 35 45, 35 65 Z" fill="#C6E86B" />
              <circle cx="50" cy="50" r="10" fill="#F6F4EA" />
            </svg>
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-forest">
            NutriTrack
          </span>
        </Link>

        {/* Desktop Navigation Links — STRICT ROLE ISOLATION */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-forest font-bold' : 'text-forest/70 hover:text-forest'
            }`}
          >
            Overview
          </Link>

          {/* Role-Specific Module Links */}
          {isAuthenticated && user ? (
            <>
              {user.role === 'dieter' && (
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' ? 'text-forest font-bold' : 'text-forest/70 hover:text-forest'
                  }`}
                >
                  My Nourishment Diary
                </Link>
              )}

              {user.role === 'nutritionist' && (
                <Link
                  to="/nutritionist"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/nutritionist' ? 'text-forest font-bold' : 'text-forest/70 hover:text-forest'
                  }`}
                >
                  Clinical Practice Suite
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/admin' ? 'text-forest font-bold' : 'text-forest/70 hover:text-forest'
                  }`}
                >
                  Platform Governance
                </Link>
              )}
            </>
          ) : (
            // Public Navigation Links for Guests
            <>
              <a href="#features" className="text-forest/80 hover:text-forest text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-forest/80 hover:text-forest text-sm font-medium transition-colors">
                How It Works
              </a>
              <a href="#roles" className="text-forest/80 hover:text-forest text-sm font-medium transition-colors">
                Role Portals
              </a>
            </>
          )}
        </nav>

        {/* Action CTAs & User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* User Persona Chip */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-forest/5 border border-forest/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left font-sans">
                  <span className="font-bold text-forest block leading-tight">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-forest/50 font-mono capitalize">{user.role}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-forest/60 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                title="Sign out of your sanctuary"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-medium text-forest hover:text-forest/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-lime text-forest font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              >
                <span>Join Sanctuary</span>
                <ArrowUpRight className="w-4 h-4 text-forest" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-forest rounded-full hover:bg-forest/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-ivory/95 backdrop-blur-lg border-b border-forest/10 px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-forest text-base font-medium py-1"
              >
                Overview
              </Link>

              {isAuthenticated && user ? (
                <>
                  {user.role === 'dieter' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-forest font-bold text-base py-1"
                    >
                      My Nourishment Diary
                    </Link>
                  )}
                  {user.role === 'nutritionist' && (
                    <Link
                      to="/nutritionist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-forest font-bold text-base py-1"
                    >
                      Clinical Practice Suite
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-forest font-bold text-base py-1"
                    >
                      Platform Governance
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-left text-red-600 font-semibold py-2 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out ({user.name})</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-forest text-base font-medium py-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-lime text-forest font-semibold text-center py-3 rounded-full mt-2"
                  >
                    Join Sanctuary
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
