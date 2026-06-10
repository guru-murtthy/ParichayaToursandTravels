import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { CONFIG } from '../config';

export default function TopBar() {
  return (
    <div className="bg-slate-900 text-white text-xs sm:text-sm py-2.5 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-2 md:mb-0">
        <a href={`tel:${CONFIG.phone}`} className="flex items-center text-slate-300 hover:text-accent font-medium transition duration-300">
          <Phone className="w-5 h-5 mr-2 text-accent" />
          <span>{CONFIG.phoneDisplay}</span>
        </a>
        <a href={`mailto:${CONFIG.email}`} className="flex items-center text-slate-300 hover:text-accent font-medium transition duration-300">
          <Mail className="w-5 h-5 mr-2 text-accent" />
          <span>{CONFIG.email}</span>
        </a>
      </div>
      <div className="flex items-center space-x-6">
        <span className="hidden md:inline font-bold text-accent tracking-wider uppercase text-xs">Reliable Travel • 24/7 Support</span>
        <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
          <a href="#" className="hover:text-accent transition">FB</a>
          <a href="#" className="hover:text-accent transition">TW</a>
          <a href="#" className="hover:text-accent transition">IG</a>
        </div>
      </div>
    </div>
  );
}
