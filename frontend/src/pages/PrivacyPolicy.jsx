import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8 font-semibold uppercase tracking-wider">Last updated: June 9, 2026</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-lg font-medium text-slate-700">
            At Parichaya Tours and Travels, we take your privacy seriously. This privacy notice explains our simple, privacy-first approach to handling your information.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. Information We Collect</h2>
          <p>
            We collect only the minimal information required to arrange your travel and vehicle bookings, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your name (to address you during the booking).</li>
            <li>Your phone number (to contact you and finalize WhatsApp coordination).</li>
            <li>Trip details (pickup/drop locations, date, and time).</li>
            <li>Preferred vehicle category.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. How We Use Your Information</h2>
          <p className="bg-amber-50 border-l-4 border-accent p-4 text-amber-900 rounded-r-xl font-medium">
            Your information is used only for booking purposes and is never shared with third parties.
          </p>
          <p>
            We do not sell, rent, trade, or distribute your personal details to advertising networks or marketing databases.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. No Trackers or Analytics Cookies</h2>
          <p>
            To respect your privacy, this website is completely tracker-free:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No Google Analytics or Facebook Pixel scripts are loaded.</li>
            <li>No tracking or marketing cookies are stored on your device.</li>
            <li>No cross-site fingerprinting is performed.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Security</h2>
          <p>
            All connection data is encrypted in transit using secure HTTPS protocols. Form submissions are validated and rate-limited to prevent automated spam and injection attacks.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">5. Contact Us</h2>
          <p>
            If you have any questions regarding your data or would like to request deletion of your records, feel free to contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
