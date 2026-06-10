import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { CONFIG } from '../config';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-black text-2xl uppercase tracking-wider text-white">
              Parichaya<span className="text-accent">Tours</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Experience the best of South India with our reliable outstation cabs, airport transfers, and local packages. Safety, punctuality, and comfort are our top priorities.
            </p>
            {/* Privacy Notice clearly visible in footer */}
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 max-w-sm">
              <p className="text-xs text-accent font-semibold italic">
                Your information is used only for booking purposes and is never shared with third parties.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b-2 border-accent inline-block pb-1">Quick Links</h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-accent flex items-center transition"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Home</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-accent flex items-center transition"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> About Us</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-accent flex items-center transition"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Services</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-accent flex items-center transition"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b-2 border-accent inline-block pb-1">Our Services</h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li className="text-slate-400 flex items-center"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Outstation Cabs</li>
              <li className="text-slate-400 flex items-center"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Airport Transfers</li>
              <li className="text-slate-400 flex items-center"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Local City Rides</li>
              <li className="text-slate-400 flex items-center"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Rental Cars</li>
              <li className="text-slate-400 flex items-center"><ChevronRight className="w-5 h-5 mr-1 text-accent"/> Corporate Travel</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b-2 border-accent inline-block pb-1">Contact Info</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-400">No. 193 1st main road sri chakra nagara Andrahalli Bengaluru, Karnataka - 560091</span>
              </li>
              <li>
                <a href={`tel:${CONFIG.phone}`} className="flex items-center text-slate-400 hover:text-accent transition">
                  <Phone className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                  <span>{CONFIG.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${CONFIG.email}`} className="flex items-center text-slate-400 hover:text-accent transition">
                  <Mail className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                  <span className="break-all">{CONFIG.email}</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium">
          <p className="text-slate-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Parichaya Tours and Travels. All Rights Reserved.
          </p>
          <div className="text-slate-500 space-x-6 flex flex-wrap justify-center gap-y-2">
            <Link to="/privacy-policy" className="hover:text-accent transition">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-accent transition">Terms & Conditions</Link>
            <Link to="/disclaimer" className="hover:text-accent transition">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
