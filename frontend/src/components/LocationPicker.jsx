import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Navigation2, Clock, Route, Building2, Globe, Locate } from 'lucide-react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl
} from 'react-leaflet';
import L from 'leaflet';

/* ─── Fix Leaflet default icon paths in Vite ─────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── Custom markers ─────────────────────────────────────────────── */
const originIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#3b82f6;border:3px solid white;
    box-shadow:0 2px 8px rgba(59,130,246,0.5)">
  </div>`,
  iconAnchor: [8, 8],
});

const destIcon = new L.DivIcon({
  className: '',
  html: `<div style="display:flex;flex-direction:column;align-items:center">
    <div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:#f59e0b;transform:rotate(-45deg);
      border:3px solid white;box-shadow:0 4px 12px rgba(245,158,11,0.5)">
    </div>
    <div style="width:2px;height:8px;background:#f59e0b;margin-top:-2px"></div>
  </div>`,
  iconAnchor: [15, 38],
  popupAnchor: [0, -40],
});

/* ─── BENGALURU BOUNDS for restrictive search ───────────────────── */
const BLR_VIEWBOX = '77.3400,12.7300,77.8500,13.1400';

/* ─── Auto-fit map bounds to show route ─────────────────────────── */
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1.5 });
    }
  }, [positions, map]);
  return null;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmtDistance = (m) =>
  m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

const fmtDuration = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const typeLabel = (place) => {
  const t = place.type || place.class || '';
  const map = {
    city:'City', town:'Town', village:'Village', state:'State',
    administrative:'Region', tourism:'Point of Interest', natural:'Nature',
    amenity:'Amenity', highway:'Road', suburb:'Area', county:'District',
  };
  return map[t] || 'Location';
};

/* ════════════════════════════════════════════════════════════════════
   LocationPicker
════════════════════════════════════════════════════════════════════ */
export default function LocationPicker({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  isOrigin = false,
  otherLocation = null, // [lat, lon]
  label = ""
}) {
  const [query,       setQuery]       = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [selected,    setSelected]    = useState(null);   // Nominatim result
  const [route,       setRoute]       = useState(null);   // { coords, distance, duration }
  const [loading,     setLoading]     = useState(false);
  const [routeLoading,setRouteLoading]= useState(false);
  const [showDrop,    setShowDrop]    = useState(false);
  const [showMap,     setShowMap]     = useState(false);

  const debounceRef = useRef(null);
  const inputRef    = useRef(null);
  const dropRef     = useRef(null);

  /* ── Nominatim autocomplete ──────────────────────────────────── */
  const search = useCallback((q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 3) { setSuggestions([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // If it's origin, boost Bengaluru results
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=7&countrycodes=in${isOrigin ? `&viewbox=${BLR_VIEWBOX}&bounded=0` : ''}`;
        
        const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'ParichayaTours/1.0' } });
        const data = await res.json();
        setSuggestions(data);
        setShowDrop(data.length > 0);
      } catch { setSuggestions([]); }
      finally  { setLoading(false); }
    }, 350);
  }, [isOrigin]);

  /* ── OSRM driving route ──────────────────────────────────────── */
  const fetchRoute = useCallback(async (start, end) => {
    if (!start || !end) return;
    setRouteLoading(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.routes && json.routes[0]) {
        const r = json.routes[0];
        const coords = r.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRoute({ coords, distance: r.distance, duration: r.duration });
        return { distance: r.distance, duration: r.duration };
      }
    } catch { setRoute(null); }
    finally  { setRouteLoading(false); }
  }, []);

  /* ── Locate Me ──────────────────────────────────────────────── */
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
        const data = await res.json();
        handleSelect(data);
      } catch {
        setLoading(false);
      }
    }, () => setLoading(false));
  };

  /* ── Handle input change ─────────────────────────────────────── */
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange?.(v, null, null);
    if (selected) { setSelected(null); setRoute(null); setShowMap(false); }
    search(v);
  };

  /* ── Select a suggestion ─────────────────────────────────────── */
  const handleSelect = async (place) => {
    const name = place.display_name;
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    
    setQuery(name);
    setSelected(place);
    setSuggestions([]);
    setShowDrop(false);
    setShowMap(true);
    
    let routeInfo = null;
    if (otherLocation) {
      const start = isOrigin ? [lat, lon] : otherLocation;
      const end = isOrigin ? otherLocation : [lat, lon];
      routeInfo = await fetchRoute(start, end);
    }
    
    onChange?.(name, place, routeInfo);
  };

  /* ── Clear ───────────────────────────────────────────────────── */
  const handleClear = () => {
    setQuery(''); setSelected(null); setRoute(null);
    setSuggestions([]); setShowDrop(false); setShowMap(false);
    onChange?.('', null, null);
    inputRef.current?.focus();
  };

  /* ── Close dropdown on outside click ────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Derived values ──────────────────────────────────────────── */
  const currentPos = selected ? [parseFloat(selected.lat), parseFloat(selected.lon)] : null;
  const addr       = selected?.address || {};
  const shortName  = addr.city || addr.town || addr.village || addr.suburb || addr.road || selected?.name || '';

  return (
    <div className="w-full relative">
      {/* Label */}
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>}
      
      {/* Search input group */}
      <div className="relative group">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors ${loading ? 'text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'}`}>
          {isOrigin ? <Navigation2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          placeholder={placeholder}
          className="input-field pl-9 pr-20"
          autoComplete="off"
        />
        
        {/* Action buttons (Locate Me / Clear) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading ? (
             <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <>
              {isOrigin && !query && (
                <button type="button" onClick={handleLocateMe} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition" title="Use my current location">
                  <Locate className="w-4 h-4" />
                </button>
              )}
              {query && (
                <button type="button" onClick={handleClear} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {showDrop && suggestions.length > 0 && (
        <div ref={dropRef} className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto border-t-0">
          <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Suggestions</div>
          {suggestions.map((place, idx) => {
            const a = place.address || {};
            const primary   = a.city || a.town || a.village || a.road || a.suburb || place.name;
            const secondary = [a.suburb, a.city, a.state].filter((v, i, self) => v && self.indexOf(v) === i && v !== primary).slice(0, 2).join(', ');
            
            return (
              <button
                key={place.place_id || idx}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-amber-50/50 text-left transition-all border-b border-slate-50 last:border-none group"
              >
                <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors ${isOrigin ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100' : 'bg-amber-50 text-amber-500 group-hover:bg-amber-100'}`}>
                  {isOrigin ? <Navigation2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 text-sm truncate">{primary}</div>
                  <div className="text-xs text-slate-500 truncate">{secondary || 'India'}</div>
                </div>
                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {typeLabel(place)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Map display for destination only (or full route if start is selected) */}
      {!isOrigin && showMap && currentPos && (
        <div className="mt-4 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-2xl bg-white transition-all animate-in fade-in slide-in-from-top-2">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Route Analysis</span>
                </div>
                <h4 className="font-black text-lg leading-tight truncate">{shortName}</h4>
                <p className="text-slate-400 text-[11px] truncate opacity-80">{selected.display_name}</p>
              </div>
              {route && (
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Route className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-black text-sm">{fmtDistance(route.distance)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400 font-black text-sm">{fmtDuration(route.duration)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="h-72 w-full relative">
            {routeLoading && (
              <div className="absolute inset-0 z-[1000] bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="font-bold text-xs tracking-widest uppercase">Plotting Route...</span>
              </div>
            )}
            <MapContainer
              center={currentPos}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
              <ZoomControl position="bottomright" />

              {/* Start point */}
              {otherLocation && <Marker position={otherLocation} icon={originIcon} />}

              {/* End point */}
              <Marker position={currentPos} icon={destIcon}>
                <Popup className="custom-popup">
                  <div className="p-1">
                    <div className="font-black text-slate-800">{shortName}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{addr.state}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Route line */}
              {route?.coords && (
                <Polyline
                  positions={route.coords}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 6,
                    opacity: 0.9,
                    lineJoin: 'round',
                    lineCap: 'round',
                  }}
                />
              )}

              {/* Auto fit */}
              {route?.coords ? (
                <FitBounds positions={[otherLocation, ...route.coords, currentPos]} />
              ) : otherLocation ? (
                <FitBounds positions={[otherLocation, currentPos]} />
              ) : null}
            </MapContainer>
            
            {/* Price badge if route exists (Injected by parent Home.jsx usually, but can show placeholder) */}
            {route && (
              <div className="absolute bottom-4 left-4 z-[500] bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                   <Navigation2 className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Est. Distance</div>
                  <div className="text-lg font-black text-slate-900 leading-none">{fmtDistance(route.distance)}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer details */}
          <div className="p-4 bg-slate-50 grid grid-cols-2 gap-3 border-t border-slate-100">
             <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600 truncate">{addr.state || 'N/A'}</span>
             </div>
             <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600 truncate">{addr.postcode || 'N/A'}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
