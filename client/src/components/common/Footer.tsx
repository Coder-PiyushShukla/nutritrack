import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest text-ivory pt-20 pb-12 border-t border-forest-light/40 relative overflow-hidden">
      {/* Decorative subtle ambient lime glow in footer corner */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-ivory/10">
          {/* Column 1: Brand & Ethos */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-lime flex items-center justify-center text-forest">
                <svg viewBox="0 0 100 100" className="w-5 h-5 fill-current">
                  <circle cx="50" cy="50" r="44" fill="#174A3A" />
                  <path d="M35 65 C35 45, 65 55, 65 35 C65 55, 35 45, 35 65 Z" fill="#C6E86B" />
                  <circle cx="50" cy="50" r="10" fill="#F6F4EA" />
                </svg>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-ivory">
                NutriTrack
              </span>
            </div>
            <p className="text-ivory/70 text-sm max-w-md leading-relaxed">
              An editorial, Kinfolk-inspired nutrition studio for mindful living. 
              Bridging the gap between scientific dietary adherence and the calm 
              rhythms of daily nourishment.
            </p>
            <div className="flex items-center gap-2 text-xs text-lime font-mono">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>Three-Color Editorial Design System • Kinfolk Edition</span>
            </div>
          </div>

          {/* Column 2: Portals */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-ivory tracking-wide">Workspaces</h4>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li>
                <Link to="/dashboard" className="hover:text-lime transition-colors">
                  Dieter Dashboard
                </Link>
              </li>
              <li>
                <Link to="/nutritionist" className="hover:text-lime transition-colors">
                  Nutritionist Suite
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-lime transition-colors">
                  Admin Platform
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-lime transition-colors">
                  Role Selector Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Philosophy */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-ivory tracking-wide">Philosophy</h4>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li className="hover:text-ivory transition-colors cursor-pointer">Mindful Nourishment</li>
              <li className="hover:text-ivory transition-colors cursor-pointer">Whole Food Tracking</li>
              <li className="hover:text-ivory transition-colors cursor-pointer">Adherence Science</li>
              <li className="hover:text-ivory transition-colors cursor-pointer">Editorial Journal</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/50 gap-4">
          <p>© {new Date().getFullYear()} NutriTrack Wellness Technologies. Built for holistic health.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-ivory transition-colors cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-ivory transition-colors cursor-pointer">Nutritional Disclaimer</span>
            <span className="hover:text-ivory transition-colors cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
