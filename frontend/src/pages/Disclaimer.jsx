import React from 'react';

export default function Disclaimer() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Disclaimer</h1>
        <p className="text-sm text-slate-500 mb-8 font-semibold uppercase tracking-wider">Last updated: June 9, 2026</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-800">1. Website Accuracy</h2>
          <p>
            The content, images, maps, and fare estimations provided on this website are for general informational purposes only. We make every effort to ensure accuracy but make no representations or warranties of any kind, express or implied, about the completeness, accuracy, or suitability of the information.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. Pricing Updates</h2>
          <p>
            Displayed fares and tariff calculations are current estimates. Final pricing may vary slightly based on fuel price adjustments, seasonal demand, holiday surcharges, and actual routes taken. Always confirm final pricing with our representative during booking validation.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. Map Data and Routes</h2>
          <p>
            Route calculations, distances, and mapping visualizers integrated into this site utilize OpenStreetMap (Nominatim API) datasets. Actual route distances during travel might differ slightly from system calculations due to real-time route detours, construction zones, or driver discretion for safety and efficiency.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. External Services</h2>
          <p>
            This site facilitates WhatsApp message composition to simplify user booking. We do not own, control, or take responsibility for the security or availability of third-party platforms like WhatsApp or external telecommunication networks.
          </p>
        </div>
      </div>
    </div>
  );
}
