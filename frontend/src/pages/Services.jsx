import React from 'react';
import { Car, Plane, Map, Building2, PartyPopper, Key } from 'lucide-react';

export default function Services() {
  const services = [
    { title: 'Local City Rides', icon: <Map className="w-8 h-8 text-accent" />, desc: 'Explore the city comfortably with our flexible hourly packages. Perfect for shopping, meetings, or sightseeing.' },
    { title: 'Airport Transfers', icon: <Plane className="w-8 h-8 text-accent" />, desc: 'Punctual pickup and drop-off to and from the airport. Never worry about missing a flight again.' },
    { title: 'Outstation Trips', icon: <Car className="w-8 h-8 text-accent" />, desc: 'Safe and reliable outstation cabs for your weekend getaways or long-distance travel across South India.' },
    { title: 'Rental Cars', icon: <Key className="w-8 h-8 text-accent" />, desc: 'Self-drive or chauffeur-driven rental cars available by the hour or day. Choose from our wide fleet.' },
    { title: 'Corporate Rentals', icon: <Building2 className="w-8 h-8 text-accent" />, desc: 'Tailored transportation solutions for businesses. Monthly billing and dedicated account managers.' },
    { title: 'Wedding/Event Packages', icon: <PartyPopper className="w-8 h-8 text-accent" />, desc: 'Premium vehicles and coordinated logistics for your special day. Ensure your guests travel in style.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-slate-900 text-white py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Our <span className="text-accent text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-300">Services</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-medium">
          Comprehensive travel solutions tailored to your needs.
        </p>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((srv, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="mb-6 bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300">
                  {srv.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">{srv.title}</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
