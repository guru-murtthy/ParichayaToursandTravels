import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Disclaimer from './pages/Disclaimer';

import { CONFIG } from './config';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans pb-20 md:pb-0">
        <TopBar />
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
          </Routes>
        </main>
        
        <Footer />

        {/* Floating Blinking WhatsApp Button for Desktop only */}
        <a 
          href={CONFIG.whatsappUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden md:flex fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition flex items-center justify-center z-50 animate-bounce"
          title="Book via WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>

        {/* Sticky Mobile Bottom Navigation Bar - Thumb friendly, high tap targets */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-4 py-3 flex justify-between items-center gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <a
            href={`tel:${CONFIG.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-2 rounded-xl font-bold text-sm active:scale-95 transition-transform min-h-[48px]"
          >
            <Phone className="w-5 h-5 text-accent animate-pulse" />
            <span>Call Now</span>
          </a>
          
          <a
            href={CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-2 rounded-xl font-bold text-sm active:scale-95 transition-transform min-h-[48px]"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
          
          <a
            href="/#book"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 px-2 rounded-xl font-bold text-sm active:scale-95 transition-transform min-h-[48px]"
          >
            <Calendar className="w-5 h-5 text-slate-900" />
            <span>Book Now</span>
          </a>
        </div>
      </div>
    </Router>
  );
}

export default App;
