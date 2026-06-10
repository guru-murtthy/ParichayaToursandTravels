import React from 'react';
import { Target, CheckCircle, Clock, ShieldCheck, PhoneCall } from 'lucide-react';
import { CONFIG } from '../config';

export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dark Hero */}
      <section className="bg-slate-900 text-white py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Reliability is our <span className="text-accent text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-300">Second Name</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-medium">
          Learn more about Parichaya Tours and Travels and our core values.
        </p>
      </section>

      {/* Two Column Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Our Story</h2>
            <p className="text-slate-600 leading-relaxed text-base font-medium">
              Parichaya Tours and Travels was founded with a simple goal: to provide the most reliable, comfortable, and transparent travel experiences across South India. With years of experience in the transportation industry, we understand what travelers truly need.
            </p>
            <p className="text-slate-600 leading-relaxed text-base font-medium">
              From our humble beginnings, we have grown into a trusted partner for thousands of passengers, offering a modern fleet of vehicles and professional, verified drivers. Your safety and satisfaction remain our highest priorities.
            </p>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-800">
              <div className="flex items-center mb-8 border-b border-slate-800 pb-4">
                <Target className="w-10 h-10 text-accent mr-4" />
                <h3 className="text-2xl font-black">Our Mission</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <ShieldCheck className="w-8 h-8 text-accent mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-lg mb-1">Safety First</h4>
                    <p className="text-slate-400 text-sm font-semibold">We ensure every vehicle is regularly sanitized and maintained, driven by experienced professionals.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-8 h-8 text-accent mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-lg mb-1">Transparent Pricing</h4>
                    <p className="text-slate-400 text-sm font-semibold">What you see is what you pay. No hidden fees, no last-minute surprises.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="w-8 h-8 text-accent mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-lg mb-1">Punctuality</h4>
                    <p className="text-slate-400 text-sm font-semibold">We value your time. Our drivers arrive before the scheduled pickup time.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Yellow CTA Banner */}
      <section className="bg-accent py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-900 mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-3xl font-black mb-2 tracking-tight">Experience the difference today</h2>
            <p className="text-yellow-950 font-bold text-lg">Book your ride in just a few clicks.</p>
          </div>
          <div className="flex space-x-4">
            <a 
              href={`tel:${CONFIG.phone}`} 
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-extrabold hover:bg-slate-800 transition shadow-lg flex items-center justify-center min-h-[48px] text-base"
            >
              <PhoneCall className="w-6 h-6 mr-2 text-accent" /> Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
