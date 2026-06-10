import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import { CONFIG } from '../config';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Client-side rate limiting (spam protection)
    const lastSubmitTime = localStorage.getItem('last_contact_submit');
    const now = Date.now();
    if (lastSubmitTime && now - parseInt(lastSubmitTime, 10) < 30 * 1000) {
      const waitSec = Math.ceil((30 * 1000 - (now - parseInt(lastSubmitTime, 10))) / 1000);
      setStatus({
        type: 'error',
        message: `To prevent spam, please wait ${waitSec} seconds before submitting another request.`
      });
      return;
    }

    // Input validation & sanitization
    const name = formData.name.replace(/<[^>]*>/g, '').trim();
    const phone = formData.phone.replace(/[\s-()]/g, '').trim();
    const email = formData.email.trim();
    const message = formData.message.replace(/<[^>]*>/g, '').trim();

    if (!name || !phone || !message) {
      setStatus({ type: 'error', message: 'Please fill out all required fields.' });
      return;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-15 digit phone number.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
        setFormData({ name: '', phone: '', email: '', message: '' });
        localStorage.setItem('last_contact_submit', now.toString());
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send. Please check your network connection.' });
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    { 
      icon: <Phone className="w-8 h-8 text-accent" />, 
      title: 'Call Us', 
      text: CONFIG.phoneDisplay,
      href: `tel:${CONFIG.phone}`
    },
    { 
      icon: <MessageCircle className="w-8 h-8 text-accent" />, 
      title: 'WhatsApp Us', 
      text: `+91 ${CONFIG.whatsappPhone}`,
      href: CONFIG.whatsappUrl
    },
    { 
      icon: <Mail className="w-8 h-8 text-accent" />, 
      title: 'Email Us', 
      text: CONFIG.email,
      href: `mailto:${CONFIG.email}`
    },
    { 
      icon: <MapPin className="w-8 h-8 text-accent" />, 
      title: 'Office Address', 
      text: 'No. 193 1st main road sri chakra nagara Andrahalli Bengaluru, Karnataka - 560091',
      href: '#'
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-slate-900 text-white py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Contact <span className="text-accent text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-300">Us</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-medium">
          We are here to assist you 24/7. Get in touch with us for quotes, bookings, or queries.
        </p>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactCards.map((info, idx) => (
                <a 
                  key={idx} 
                  href={info.href}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center hover:shadow-md transition duration-300 group"
                >
                  <div className="bg-accent/10 p-4 rounded-2xl group-hover:bg-accent/20 transition duration-300 mr-4">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">{info.title}</h3>
                    <p className="text-slate-600 font-semibold text-sm break-all">{info.text}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Send Us a Message</h2>
              
              {status.message && (
                <div className={`p-4 mb-6 rounded-2xl font-semibold text-sm border ${
                  status.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full border-slate-200 rounded-xl p-3.5 border focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition font-semibold" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full border-slate-200 rounded-xl p-3.5 border focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition font-semibold" 
                      placeholder="+91 98765 43210" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full border-slate-200 rounded-xl p-3.5 border focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition font-semibold" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea 
                    required 
                    rows="4" 
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})} 
                    className="w-full border-slate-200 rounded-xl p-3.5 border focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition font-semibold" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-accent text-slate-900 font-bold py-4 px-8 rounded-xl hover:bg-yellow-500 transition-all duration-300 w-full shadow-lg disabled:opacity-50 min-h-[48px] flex items-center justify-center text-base"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
