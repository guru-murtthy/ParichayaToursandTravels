import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28 sm:h-24">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Logo 2x larger, border, high-res look, drop shadow */}
              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-100 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-102">
                <img 
                  src="/logo.png" 
                  alt="Parichaya Tours Logo" 
                  className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-md" 
                />
              </div>
              {/* Brand name clearly visible on all screen sizes */}
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-2xl text-slate-800 tracking-tight leading-none uppercase">
                  Parichaya<span className="text-accent">Tours</span>
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-extrabold tracking-widest uppercase mt-0.5 sm:mt-1">
                  & Travels
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-slate-600 hover:text-accent font-bold text-sm tracking-wide transition duration-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex">
            <a 
              href="/#book" 
              className="bg-accent text-slate-900 px-7 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-500 hover:shadow-xl hover:text-slate-950 transition-all duration-300 transform hover:-translate-y-0.5 min-h-[48px] flex items-center justify-center"
            >
              Book Now
            </a>
          </div>

          <div className="md:hidden flex items-center">
            {/* Thumb friendly mobile hamburger menu */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-800 hover:text-accent focus:outline-none p-3 bg-slate-50 border border-slate-100 rounded-xl transition duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 h-6" /> : <Menu className="h-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-inner"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={link.name}
                >
                  <Link 
                    to={link.path} 
                    onClick={() => setIsOpen(false)} 
                    className="block px-4 py-3 text-base font-bold text-slate-700 hover:text-accent hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all duration-200 min-h-[48px]"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <a 
                  href="/#book" 
                  onClick={() => setIsOpen(false)} 
                  className="block w-full text-center mt-6 bg-accent text-slate-900 py-3.5 rounded-xl font-bold shadow hover:bg-yellow-500 transition text-base min-h-[48px]"
                >
                  Book Now
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
