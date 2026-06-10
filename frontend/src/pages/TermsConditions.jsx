import React from 'react';

export default function TermsConditions() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Terms and Conditions</h1>
        <p className="text-sm text-slate-500 mb-8 font-semibold uppercase tracking-wider">Last updated: June 9, 2026</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-lg font-medium text-slate-700">
            Welcome to Parichaya Tours and Travels. By accessing our website and requesting bookings, you agree to comply with the following terms.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. Booking Requests</h2>
          <p>
            Any submission of a booking form on this website constitutes a request. All bookings are subject to vehicle availability and final confirmation via phone call or WhatsApp message.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. Fare Estimation and Pricing</h2>
          <p>
            Fare estimates provided by the tool are for general planning purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Outstation fares:</strong> Calculated on actual kilometers traveled, subject to minimum distance rules and driver allowance.</li>
            <li><strong>Local Packages:</strong> Packages are fixed up to their respective limits (e.g. 4 Hours / 40 KM, 80 KM). Overages are billed at standard per-hour or per-km rates.</li>
            <li>Toll charges, parking fees, and state entry taxes are not included in the base fare and must be paid by the customer.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. Cancellations and Changes</h2>
          <p>
            Customers are requested to notify us of cancellations or schedule modifications at least 12 hours before the scheduled pickup time. No cancellation fees are charged under normal circumstances.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Passenger Conduct</h2>
          <p>
            Passengers are expected to treat the drivers and vehicles with respect. Carrying illegal materials, smoking, or consuming alcohol inside vehicles is strictly prohibited.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">5. Limitation of Liability</h2>
          <p>
            While we strive to maintain absolute punctuality, Parichaya Tours and Travels is not liable for travel delays caused by traffic congestion, weather anomalies, vehicle breakdowns, or force majeure events.
          </p>
        </div>
      </div>
    </div>
  );
}
