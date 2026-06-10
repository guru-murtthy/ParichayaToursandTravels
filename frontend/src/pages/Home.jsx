import React, { useState } from 'react';
import { Car, Shield, Clock, IndianRupee, MapPin, PhoneCall, CheckCircle2, Plane, User, Star } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';

export default function Home() {
  const [activeTab, setActiveTab] = useState('outstation');
  const [airportDir, setAirportDir] = useState('To Airport');
  const [fromPlace, setFromPlace] = useState({ label: 'Bengaluru, Karnataka, India', details: { lat: 12.9716, lon: 77.5946 } });
  const [toPlace, setToPlace] = useState({ label: '', details: null, route: null });

  // Form states for explicit selection in WhatsApp message
  const [selectedVehicle, setSelectedVehicle] = useState('5-Seater');
  const [acPreference, setAcPreference] = useState('AC');
  const [selectedLocalPackage, setSelectedLocalPackage] = useState('4 Hours / 40 KM');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    const formData = new FormData(e.target);
    const customerName = formData.get('customerName')?.trim().replace(/<[^>]*>/g, '');
    const customerPhone = formData.get('customerPhone')?.trim().replace(/[\s-()]/g, '');
    const bookingDate = formData.get('date');
    const bookingTime = formData.get('time');

    if (!customerName || !customerPhone || !bookingDate || !bookingTime) {
      setStatus({ type: 'error', message: 'Please fill out all required fields.' });
      return;
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(customerPhone)) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-15 digit phone number.' });
      return;
    }

    // Date validation
    const bDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bDate.getTime()) || bDate < today) {
      setStatus({ type: 'error', message: 'Booking date cannot be in the past.' });
      return;
    }

    // Client-side rate limit (spam protection)
    const lastSubmitTime = localStorage.getItem('last_booking_submit');
    const now = Date.now();
    if (lastSubmitTime && now - parseInt(lastSubmitTime, 10) < 30 * 1000) {
      const waitSec = Math.ceil((30 * 1000 - (now - parseInt(lastSubmitTime, 10))) / 1000);
      setStatus({
        type: 'error',
        message: `To prevent spam, please wait ${waitSec} seconds before submitting another booking.`
      });
      return;
    }

    let message = `*New Booking Request* 🚖\n\n`;
    message += `*Name:* ${customerName}\n`;
    message += `*Phone:* ${customerPhone}\n`;
    message += `*Service:* ${activeTab === 'local' ? 'LOCAL PACKAGE' : activeTab === 'airport' ? 'AIRPORT TRANSFER' : activeTab.toUpperCase()}\n`;

    let payload = {
      type: activeTab,
      contactName: customerName,
      contactPhone: customerPhone,
      date: bookingDate,
      time: bookingTime,
      vehicle: selectedVehicle,
    };

    if (activeTab === 'outstation') {
      message += `*Trip:* Round Trip\n`;
      message += `*From:* ${fromPlace.label}\n`;
      message += `*To:* ${toPlace.label}\n`;
      message += `*Vehicle:* ${selectedVehicle} (${acPreference})\n`;
      
      let rate = '';
      if (selectedVehicle === '5-Seater') {
        rate = acPreference === 'AC' ? '₹12/km' : '₹11/km';
      } else if (selectedVehicle === '7-Seater') {
        rate = acPreference === 'AC' ? '₹15/km' : '₹14/km';
      } else if (selectedVehicle === '12-Seater') {
        rate = acPreference === 'AC' ? '₹20/km' : '₹18/km';
      }
      message += `*Rate:* ${rate}\n`;
      
      let distanceKm = 0;
      if (toPlace.route) {
        distanceKm = parseFloat((toPlace.route.distance / 1000).toFixed(1));
        message += `*Approx. Distance:* ~${distanceKm} km\n`;
      }
      
      payload.from = fromPlace.label;
      payload.to = toPlace.label;
      payload.tripType = 'round-trip';
      
      const numericRate = parseInt(rate.replace(/[^0-9]/g, ''), 10) || 12;
      payload.totalFare = numericRate * distanceKm;

    } else if (activeTab === 'local') {
      message += `*Package:* ${selectedLocalPackage}\n`;
      const city = formData.get('localCity')?.trim().replace(/<[^>]*>/g, '') || 'Bengaluru';
      message += `*City:* ${city}\n`;
      message += `*Vehicle:* ${selectedVehicle}\n`;
      
      let price = '';
      if (selectedLocalPackage === '4 Hours / 40 KM') {
        price = selectedVehicle === '5-Seater' ? '₹999' : '₹1399';
      } else if (selectedLocalPackage === '80 KM') {
        price = selectedVehicle === '5-Seater' ? '₹1699' : '₹2099';
      }
      message += `*Fare:* ${price}\n`;
      
      payload.package = selectedLocalPackage;
      payload.from = city;
      payload.totalFare = parseInt(price.replace(/[^0-9]/g, ''), 10);

    } else if (activeTab === 'airport') {
      const location = formData.get('airportLocation')?.trim().replace(/<[^>]*>/g, '');
      message += `*Direction:* ${airportDir}\n`;
      message += `*Location:* ${location}\n`;
      message += `*Vehicle:* ${selectedVehicle}\n`;
      
      payload.from = airportDir === 'To Airport' ? location : 'Kempegowda International Airport';
      payload.to = airportDir === 'To Airport' ? 'Kempegowda International Airport' : location;

    } else if (activeTab === 'rental') {
      message += `*Duration:* 6 Hours (base)\n`;
      message += `*Vehicle:* ${selectedVehicle}\n`;
      message += `*Fare:* ₹799 (₹75 per extra hour)\n`;
      
      payload.hours = 6;
      payload.from = 'Bengaluru';
      payload.totalFare = 799;
    }

    message += `*Date:* ${bookingDate}\n`;
    message += `*Time:* ${bookingTime}\n\n`;
    message += `Please confirm vehicle availability.`;

    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.apiUrl}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Booking requested successfully! Launching WhatsApp to complete confirmation...' });
        localStorage.setItem('last_booking_submit', now.toString());
        
        setTimeout(() => {
          const encodedMessage = encodeURIComponent(message);
          window.open(`https://wa.me/${CONFIG.whatsappPhone}?text=${encodedMessage}`, '_blank');
          setStatus({ type: '', message: '' });
        }, 1200);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to request booking. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-900 text-white pt-24 pb-40 flex items-center justify-center min-h-[700px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/peaceful_hills_bg.png" alt="Peaceful Hills Background" className="w-full h-full object-cover opacity-60 scale-105 transform hover:scale-100 transition duration-10000" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block py-1.5 px-4 rounded-full bg-accent/20 text-accent font-bold tracking-widest text-xs md:text-sm mb-6 border border-accent/30"
            >
              YOUR PREMIUM TRAVEL PARTNER
            </motion.span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Parichaya Tours <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-300">& Travels</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-200 mb-6 tracking-wide">
              Comfortable Journeys Begin Here
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-8 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Experience hassle-free outstation trips, airport transfers, local rentals, and self-drive options with trusted drivers and well-maintained vehicles.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:w-1/2 w-full"
            id="book"
          >
            <div className="glass-panel text-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-yellow-400"></div>
              
              <div className="grid grid-cols-4 bg-slate-100/50 rounded-xl p-1 mb-6">
                <button type="button" onClick={() => { setActiveTab('outstation'); setSelectedVehicle('5-Seater'); }} className={`py-2 px-1 rounded-lg font-bold text-xs transition-all duration-300 text-center ${activeTab === 'outstation' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Outstation</button>
                <button type="button" onClick={() => { setActiveTab('local'); setSelectedVehicle('5-Seater'); }} className={`py-2 px-1 rounded-lg font-bold text-xs transition-all duration-300 text-center ${activeTab === 'local' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Local</button>
                <button type="button" onClick={() => { setActiveTab('airport'); setSelectedVehicle('5-Seater'); }} className={`py-2 px-1 rounded-lg font-bold text-xs transition-all duration-300 text-center ${activeTab === 'airport' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Airport</button>
                <button type="button" onClick={() => { setActiveTab('rental'); setSelectedVehicle('5-Seater'); }} className={`py-2 px-1 rounded-lg font-bold text-xs transition-all duration-300 text-center ${activeTab === 'rental' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Rental</button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                    <input name="customerName" type="text" placeholder="Enter your full name" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input name="customerPhone" type="tel" placeholder="Enter your phone number" className="input-field" required />
                  </div>
                </div>

                {activeTab === 'outstation' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    <div className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-2 rounded-lg border border-amber-100 flex items-center justify-between">
                      <span>Trip Mode: Round Trip Only</span>
                      <span className="bg-amber-200 px-2 py-0.5 rounded text-[10px] uppercase">Active</span>
                    </div>

                    <div className="space-y-4" style={{overflow:'visible'}}>
                      <div>
                        <LocationPicker
                          label="From (Pickup)"
                          isOrigin={true}
                          value={fromPlace.label}
                          placeholder="Search pickup area in Bengaluru..."
                          onChange={(label, details) => setFromPlace({ label, details: details ? { lat: details.lat, lon: details.lon } : null })}
                        />
                      </div>
                      <div>
                        <LocationPicker
                          label="To (Destination)"
                          otherLocation={fromPlace.details ? [parseFloat(fromPlace.details.lat), parseFloat(fromPlace.details.lon)] : null}
                          value={toPlace.label}
                          placeholder="Search destination city or place..."
                          onChange={(label, details, route) => setToPlace({ label, details, route })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label><input name="date" type="date" className="input-field" required /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label><input name="time" type="time" className="input-field" required /></div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AC Preference</label>
                      <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button type="button" onClick={() => setAcPreference('AC')} className={`flex-1 py-1.5 rounded-md font-bold text-xs transition ${acPreference === 'AC' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>AC</button>
                        <button type="button" onClick={() => setAcPreference('Non-AC')} className={`flex-1 py-1.5 rounded-md font-bold text-xs transition ${acPreference === 'Non-AC' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Non-AC</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Vehicle Class & Rate</label>
                      <div className="space-y-2">
                        {[
                          { id: '5-Seater', name: '5-Seater (Swift Dzire, WagonR, Etios)', ac: '₹12/km', nonAc: '₹11/km', info: 'Comfortable seating • Professional driver' },
                          { id: '7-Seater', name: '7-Seater (Ertiga, Kia Carens)', ac: '₹15/km', nonAc: '₹14/km', info: '⭐ Most Popular • Spacious cabin' },
                          { id: '12-Seater', name: '12-Seater Tempo Traveller', ac: '₹20/km', nonAc: '₹18/km', info: 'Large group travel • Corporate trips' }
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedVehicle === v.id ? 'border-accent bg-amber-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                          >
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{v.info}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-accent">{acPreference === 'AC' ? v.ac : v.nonAc}</div>
                              <div className="text-[9px] text-slate-400 font-medium">per km</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'local' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Local Package</label>
                      <select
                        name="localPackage"
                        value={selectedLocalPackage}
                        onChange={(e) => setSelectedLocalPackage(e.target.value)}
                        className="input-field cursor-pointer font-medium text-sm"
                      >
                        <option value="4 Hours / 40 KM">4 Hours / 40 KM</option>
                        <option value="80 KM">80 KM</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label><input name="localCity" type="text" placeholder="City" className="input-field" defaultValue="Bengaluru" required /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label><input name="date" type="date" className="input-field" required /></div>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label><input name="time" type="time" className="input-field" required /></div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Vehicle Class & Rate</label>
                      <div className="space-y-2">
                        {[
                          { id: '5-Seater', name: '5-Seater (Swift Dzire, WagonR, Etios)', prices: { '4 Hours / 40 KM': '₹999', '80 KM': '₹1699' } },
                          { id: '7-Seater', name: '7-Seater (Ertiga, Kia Carens)', prices: { '4 Hours / 40 KM': '₹1399', '80 KM': '₹2099' } }
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedVehicle === v.id ? 'border-accent bg-amber-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                          >
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">Standard package rate</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-accent">{v.prices[selectedLocalPackage]}</div>
                              <div className="text-[9px] text-slate-400 font-medium">fixed price</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'airport' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    <div className="flex gap-6 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <label className="flex items-center space-x-3 cursor-pointer group" onClick={() => setAirportDir('To Airport')}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${airportDir === 'To Airport' ? 'border-accent' : 'border-slate-300'}`}>
                          {airportDir === 'To Airport' && <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>}
                        </div>
                        <span className={`font-medium text-xs transition ${airportDir === 'To Airport' ? 'text-accent font-bold' : 'text-slate-700'}`}>To Airport</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group" onClick={() => setAirportDir('From Airport')}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${airportDir === 'From Airport' ? 'border-accent' : 'border-slate-300'}`}>
                          {airportDir === 'From Airport' && <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>}
                        </div>
                        <span className={`font-medium text-xs transition ${airportDir === 'From Airport' ? 'text-accent font-bold' : 'text-slate-700'}`}>From Airport</span>
                      </label>
                    </div>

                    <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label><input name="airportLocation" type="text" placeholder="Enter pickup or drop address" className="input-field" required /></div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label><input name="date" type="date" className="input-field" required /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label><input name="time" type="time" className="input-field" required /></div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Vehicle Class</label>
                      <div className="space-y-2">
                        {[
                          { id: '5-Seater', name: '5-Seater (Swift Dzire, WagonR, Etios)', info: 'On-time pickup • Flight tracking' },
                          { id: '7-Seater', name: '7-Seater (Ertiga, Kia Carens)', info: 'Professional drivers • 24/7 Support' }
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedVehicle === v.id ? 'border-accent bg-amber-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                          >
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{v.info}</div>
                            </div>
                            <div className="text-[10px] font-bold text-accent uppercase bg-amber-50 px-2 py-1 rounded">Select</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rental' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    <div className="bg-amber-50 text-amber-800 text-xs font-bold p-3 rounded-lg border border-amber-100">
                      Rate: ₹799 for 6 hours (₹75 per extra hour)
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label><input name="date" type="date" className="input-field" required /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label><input name="time" type="time" className="input-field" required /></div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Rental Vehicle</label>
                      <div className="space-y-2">
                        {[
                          { id: '5-Seater', name: '5-Seater (Swift Dzire, WagonR, Etios)', info: '₹799 for 6h | ₹75/extra hr' }
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedVehicle === v.id ? 'border-accent bg-amber-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                          >
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{v.info}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-accent">₹799</div>
                              <div className="text-[9px] text-slate-400 font-medium">base fare</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {status.message && (
                  <div className={`p-4 mt-4 rounded-xl font-bold text-xs border ${
                    status.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {status.message}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full mt-6 text-xl py-4 font-black tracking-widest uppercase shadow-xl hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 min-h-[48px] flex items-center justify-center"
                >
                  {loading ? 'Processing...' : 'Book Now'}
                </button>

                <p className="text-[10px] text-slate-500 text-center mt-3 font-bold">
                  Privacy Notice: Your information is used only for booking purposes and is never shared with third parties. Read our <a href="/privacy-policy" className="text-accent underline hover:text-yellow-600 transition">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Comprehensive Pricing Section */}
      <section className="py-24 bg-white relative">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-800 mb-4">Transparent <span className="text-accent">Pricing</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Clear, direct rates for all your travel needs. Displayed prices are final.</p>
          </div>

          {/* Local Packages */}
          <div className="mb-24">
            <div className="flex items-center mb-8">
              <h3 className="text-3xl font-extrabold text-slate-800 border-l-4 border-accent pl-4">Local Packages</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { title: '4 Hours / 40 KM', p5: '999', p7: '1399' },
                { title: '80 KM', p5: '1699', p7: '2099', popular: true }
              ].map((pkg, idx) => (
                <div key={idx} className={`bg-white rounded-3xl p-8 border ${pkg.popular ? 'border-accent shadow-2xl relative scale-105 z-10' : 'border-slate-200 shadow-lg'}`}>
                  {pkg.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">Most Popular</span>}
                  <h4 className="text-xl font-bold text-slate-800 mb-6 text-center">{pkg.title}</h4>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-700 text-lg">5-Seater</span>
                        <span className="text-2xl font-black text-accent">₹{pkg.p5}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Vehicles: Swift Dzire, WagonR, Etios</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-700 text-lg">7-Seater</span>
                        <span className="text-2xl font-black text-accent">₹{pkg.p7}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Vehicles: Ertiga, Kia Carens</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-amber-50/80 rounded-2xl p-6 border border-amber-100 max-w-3xl mx-auto shadow-sm">
              <h5 className="font-bold text-amber-900 mb-3 flex items-center text-lg"><IndianRupee className="w-5 h-5 mr-2"/> Extra Charges</h5>
              <ul className="text-amber-800 space-y-2 font-medium">
                <li>• Extra KM charges: 5-Seater → ₹11/km | 7-Seater → ₹14/km</li>
                <li>• Extra hours charged separately</li>
              </ul>
            </div>
          </div>

          {/* Outstation Pricing */}
          <div className="mb-24">
            <h3 className="text-3xl font-extrabold text-slate-800 mb-8 border-l-4 border-accent pl-4">Outstation Pricing</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* 5 Seater Outstation */}
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-2xl font-bold mb-4">5-Seater</h4>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-400 font-medium text-sm">AC</span>
                      <span className="text-3xl font-black text-accent">₹12<span className="text-sm text-slate-400 font-medium">/km</span></span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-slate-400 font-medium text-sm">Non-AC</span>
                      <span className="text-3xl font-black text-accent">₹11<span className="text-sm text-slate-400 font-medium">/km</span></span>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-6 mb-6">
                    <p className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">Vehicles</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold">Swift Dzire</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold">WagonR</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold">Etios</span>
                    </div>
                  </div>
                  <ul className="text-slate-400 space-y-2 text-sm">
                    <li>• Comfortable seating</li>
                    <li>• Professional driver</li>
                    <li>• Clean vehicle</li>
                    <li>• Ideal for small families</li>
                  </ul>
                </div>
              </div>

              {/* 7 Seater Outstation */}
              <div className="bg-accent text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between relative scale-105 border-4 border-yellow-300">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-accent px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                </span>
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-slate-900">7-Seater</h4>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center border-b border-amber-400/50 pb-3">
                      <span className="text-slate-800 font-bold text-sm">AC</span>
                      <span className="text-3xl font-black text-slate-900">₹15<span className="text-sm text-slate-800 font-medium">/km</span></span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-slate-800 font-bold text-sm">Non-AC</span>
                      <span className="text-3xl font-black text-slate-900">₹14<span className="text-sm text-slate-800 font-medium">/km</span></span>
                    </div>
                  </div>
                  <div className="border-t border-amber-400/50 pt-6 mb-6">
                    <p className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-3">Vehicles</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/30 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold">Ertiga</span>
                      <span className="bg-white/30 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold">Kia Carens</span>
                    </div>
                  </div>
                  <ul className="text-yellow-900 space-y-2 text-sm font-semibold">
                    <li>• Spacious cabin</li>
                    <li>• Extra luggage space</li>
                    <li>• Comfortable long-distance</li>
                    <li>• Family-friendly</li>
                  </ul>
                </div>
              </div>

              {/* Tempo Traveller Outstation */}
              <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-2xl font-bold mb-4">12-Seater Tempo Traveller</h4>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-slate-500 font-medium text-sm">AC</span>
                      <span className="text-3xl font-black text-accent">₹20<span className="text-sm text-slate-500 font-medium">/km</span></span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-slate-500 font-medium text-sm">Non-AC</span>
                      <span className="text-3xl font-black text-accent">₹18<span className="text-sm text-slate-500 font-medium">/km</span></span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6 mb-6">
                    <p className="text-slate-600 font-semibold text-sm uppercase tracking-wider mb-3">Vehicles</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">12-Seater TT</span>
                    </div>
                  </div>
                  <ul className="text-slate-600 space-y-2 text-sm font-medium">
                    <li>• Large group travel</li>
                    <li>• Corporate trips</li>
                    <li>• Family tours</li>
                    <li>• Comfortable seating</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm max-w-3xl mx-auto">
              <h5 className="font-bold text-slate-800 mb-3 flex items-center text-base"><MapPin className="w-4 h-4 mr-2 text-accent"/> Trip Terms</h5>
              <ul className="text-slate-600 space-y-1.5 text-sm font-medium">
                <li>• Toll & parking charges extra as per actuals</li>
                <li>• Driver night allowance applicable if driving post 10:00 PM</li>
                <li>• Minimum 250 KM per day limit applies</li>
              </ul>
            </div>
          </div>

          {/* Airport Transfers */}
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-8 border-l-4 border-accent pl-4">Airport Transfers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <h4 className="font-bold text-xl text-slate-800 mb-1">5-Seater Option</h4>
                  <p className="text-slate-500 text-sm font-medium">Comfortable and economical airport ride</p>
                </div>
                <p className="text-slate-600 font-bold bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 mt-2 sm:mt-0">Swift Dzire, WagonR, Etios</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <h4 className="font-bold text-xl text-slate-800 mb-1">7-Seater Option</h4>
                  <p className="text-slate-500 text-sm font-medium">Spacious option for extra luggage & family</p>
                </div>
                <p className="text-slate-600 font-bold bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 mt-2 sm:mt-0">Ertiga, Kia Carens</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { title: "On-time pickup", icon: <Clock className="w-8 h-8" /> },
                { title: "Flight tracking", icon: <Plane className="w-8 h-8" /> },
                { title: "Professional drivers", icon: <User className="w-8 h-8" /> },
                { title: "24/7 Availability", icon: <Clock className="w-8 h-8" /> },
                { title: "Airport meet & greet", icon: <User className="w-8 h-8" /> }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col items-center text-center shadow-md border-b-4 border-accent">
                  <div className="bg-white/10 p-4 rounded-full text-accent mb-4">{item.icon}</div>
                  <span className="font-bold text-sm tracking-wide">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">Why Choose <span className="text-accent">Parichaya Tours</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">We provide the best travel experience with top-notch vehicles and professional drivers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Shield className="w-10 h-10 text-accent mb-4" />, title: "Safety First", desc: "Verified drivers & sanitized, well-maintained cars." },
              { icon: <Car className="w-10 h-10 text-accent mb-4" />, title: "Top Rated", desc: "Highly rated by thousands of regular travelers." },
              { icon: <Clock className="w-10 h-10 text-accent mb-4" />, title: "Zero Wait Time", desc: "Always on time, ensuring stress-free rides." },
              { icon: <IndianRupee className="w-10 h-10 text-accent mb-4" />, title: "Direct Pricing", desc: "Transparent pricing without hidden extras." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 text-center border border-slate-100">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{feature.title}</h3>
                <p className="text-slate-500 text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Rental Cars Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">Self-Drive & <span className="text-accent">Rental Cars</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Premium self-drive plans with absolute price transparency.</p>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-3xl shadow-sm mb-16 border border-slate-200 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Flat Rental Pricing</h3>
            <p className="text-slate-600 font-bold text-lg mb-1">₹799 for 6 Hours</p>
            <p className="text-slate-500 font-semibold text-sm">₹75 per extra hour charges apply thereafter</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Swift Dzire', img: '/dzire.png', type: '5-Seater', desc: 'Premium & Comfortable' },
              { name: 'Maruti WagonR', img: '/wagonr.png', type: '5-Seater', desc: 'Sleek & Fuel Efficient' }, 
              { name: 'Toyota Etios', img: '/etios.png', type: '5-Seater', desc: 'Comfortable & Reliable' }
            ].map((car, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 group flex flex-col justify-between">
                <div>
                  <div className="relative">
                    <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-sm">{car.type}</span>
                    {car.img ? (
                      <img src={car.img} alt={car.name} className="w-full h-44 object-contain bg-white p-6 group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-44 flex items-center justify-center bg-slate-50/50 p-6 group-hover:scale-105 transition duration-500">
                        {car.icon}
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-2">
                    <h3 className="text-lg font-bold text-slate-800">{car.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{car.desc}</p>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4">
                    <span className="text-slate-500 font-bold text-xs">AC Rental</span>
                    <a href="#book" className="text-accent font-extrabold hover:text-yellow-600 uppercase text-xs tracking-wider">Book Now</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-slate-800">What Our <span className="text-accent">Customers Say</span></h2>
          <div className="bg-white p-10 md:p-14 rounded-3xl shadow-lg border border-slate-100 relative">
            <div className="text-accent flex justify-center mb-8">
              {[1,2,3,4,5].map(star => <svg key={star} className="w-8 h-8 fill-current mx-1" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            </div>
            <p className="text-2xl italic text-slate-600 mb-8 leading-relaxed">"Excellent service! The driver was very polite and punctual. The car was clean and well-maintained. Highly recommend Parichaya Tours for outstation trips."</p>
            <div className="font-bold text-slate-800 text-lg">- Rahul K.</div>
          </div>
        </motion.div>
      </section>

      {/* 6. Travel Guidelines & Terms */}
      <section className="py-20 bg-white border-t border-slate-200">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">Travel <span className="text-accent">Guidelines & Terms</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Driver Night Allowance applicable after 10:00 PM.',
              'Strictly No Smoking inside the vehicle.',
              'No Alcohol consumption allowed during the ride.',
              'Pets are allowed with prior confirmation only.',
              'Toll & Parking charges are extra as per actual receipts.',
              'Cancellation policy: Free cancellation up to 2 hours before departure.'
            ].map((term, i) => (
              <div key={i} className="flex items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-semibold text-sm">{term}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 7. Yellow CTA Banner */}
      <section className="bg-accent py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between z-10">
          <div className="text-white mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-4xl font-black mb-3 text-slate-900 tracking-tight">Ready to book your ride?</h2>
            <p className="text-yellow-900 font-bold text-lg">Contact us now to get the best deals.</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
             <a href={`tel:${CONFIG.phone}`} className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition shadow-xl flex items-center justify-center text-lg">
              <PhoneCall className="w-5 h-5 mr-3" /> Call Now
            </a>
            <a href={CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition shadow-xl flex items-center justify-center text-lg">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
