import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const fetchBookings = async (pass) => {
    try {
      const res = await fetch(`${CONFIG.apiUrl}/bookings`, {
        headers: { 'x-admin-password': pass }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setIsAuth(true);
        setError('');
      } else {
        setError('Invalid Password');
      }
    } catch (err) {
      setError('Server Error');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchBookings(password);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-96 border border-slate-100">
          <h2 className="text-3xl font-black mb-6 text-center text-slate-800 tracking-tight">Admin Login</h2>
          {error && <div className="text-red-500 mb-4 text-center font-semibold text-sm bg-red-50 py-2 rounded-xl border border-red-100">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Password" 
              className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none font-semibold"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="w-full bg-accent text-slate-900 font-extrabold py-3.5 rounded-xl hover:bg-yellow-500 transition shadow-md">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Booking Requests</h1>
          <button onClick={() => setIsAuth(false)} className="text-red-500 font-extrabold hover:underline">Logout</button>
        </div>
        <div className="bg-white shadow-lg rounded-3xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">No bookings found.</td></tr>
                ) : (
                  bookings.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-800 capitalize">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          b.type === 'outstation' ? 'bg-indigo-50 text-indigo-700' :
                          b.type === 'local' ? 'bg-teal-50 text-teal-700' :
                          b.type === 'airport' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {b.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold leading-relaxed">
                        {b.type === 'outstation' && (
                          <div>
                            <div><strong className="text-slate-800">From:</strong> {b.from}</div>
                            <div><strong className="text-slate-800">To:</strong> {b.to}</div>
                            <div><strong className="text-slate-800">Trip:</strong> Round Trip | {b.vehicle}</div>
                            <div><strong className="text-slate-800">Schedule:</strong> {b.date} at {b.time}</div>
                          </div>
                        )}
                        {b.type === 'local' && (
                          <div>
                            <div><strong className="text-slate-800">Package:</strong> {b.package}</div>
                            <div><strong className="text-slate-800">City:</strong> {b.from}</div>
                            <div><strong className="text-slate-800">Vehicle:</strong> {b.vehicle}</div>
                            <div><strong className="text-slate-800">Schedule:</strong> {b.date} at {b.time}</div>
                          </div>
                        )}
                        {b.type === 'airport' && (
                          <div>
                            <div><strong className="text-slate-800">Route:</strong> {b.from} &rarr; {b.to}</div>
                            <div><strong className="text-slate-800">Vehicle:</strong> {b.vehicle}</div>
                            <div><strong className="text-slate-800">Schedule:</strong> {b.date} at {b.time}</div>
                          </div>
                        )}
                        {b.type === 'rental' && (
                          <div>
                            <div><strong className="text-slate-800">Vehicle:</strong> {b.vehicle}</div>
                            <div><strong className="text-slate-800">Duration:</strong> {b.hours} hours</div>
                            <div><strong className="text-slate-800">Schedule:</strong> {b.date} at {b.time}</div>
                            <div><strong className="text-slate-800">Base Fare:</strong> ₹{b.totalFare}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                        <div className="font-extrabold text-slate-800">{b.contactName}</div>
                        <a href={`tel:${b.contactPhone}`} className="text-accent hover:underline font-bold text-xs">{b.contactPhone}</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800 uppercase">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
