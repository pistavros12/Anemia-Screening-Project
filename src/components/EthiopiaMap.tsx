import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Compass, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface Props {
  latitude: number;
  longitude: number;
  elevationM: number;
  locationName: string;
  onLocationChange: (lat: number, lon: number, elevation: number, locationName: string) => void;
  lang: Language;
  theme: Theme;
}

export const EthiopiaMap: React.FC<Props> = ({
  latitude,
  longitude,
  elevationM,
  locationName,
  onLocationChange,
  lang,
  theme,
}) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [elevationLookupNotice, setElevationLookupNotice] = useState<string | null>(null);
  const [isElevationLoading, setIsElevationLoading] = useState(false);
  const [manualElevation, setManualElevation] = useState<number>(elevationM);

  // Sync internal manualElevation if prop updates
  useEffect(() => {
    setManualElevation(elevationM);
  }, [elevationM]);

  // Elevation fetch helper
  const fetchElevation = async (lat: number, lon: number, locName: string) => {
    setIsElevationLoading(true);
    setElevationLookupNotice(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const elev = Math.round(data.results[0].elevation);
          setManualElevation(elev);
          setElevationLookupNotice(`${t.elevation_lookup_success}: ${elev} m`);
          onLocationChange(lat, lon, elev, locName);
          return;
        }
      }
      throw new Error('No elevation returned');
    } catch {
      setElevationLookupNotice(t.elevation_offline_fallback);
      onLocationChange(lat, lon, manualElevation, locName);
    } finally {
      setIsElevationLoading(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = latitude || 9.03;
      const initialLon = longitude || 38.74;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 7,
        zoomControl: true,
      });

      // OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #1d4ed8; border: 2.5px solid #FFFFFF; width: 28px; height: 28px; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">+</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([initialLat, initialLon], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${locationName}</b><br/>${Math.round(elevationM)} m a.s.l.`).openPopup();

      // Click on map to place/move marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        const locDesc = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        marker.setPopupContent(`<b>${locDesc}</b>`).openPopup();
        fetchElevation(lat, lng, locDesc);
      });

      // Drag marker
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const locDesc = `Coordinates: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
        marker.setPopupContent(`<b>${locDesc}</b>`).openPopup();
        fetchElevation(pos.lat, pos.lng, locDesc);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      // Map cleanup handled on teardown
    };
  }, []);

  // Update map center when props change from preset or search
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      markerRef.current.setPopupContent(`<b>${locationName}</b><br/>${Math.round(elevationM)} m a.s.l.`);
      mapInstanceRef.current.setView([latitude, longitude], Math.max(mapInstanceRef.current.getZoom(), 8));
    }
  }, [latitude, longitude, locationName, elevationM]);

  // Geocoding Search handler (Nominatim) with Ethiopian regional fallbacks
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    // Predefined offline dictionary of major Ethiopian highlands and lowlands
    const ethiopianPredefinedPlaces: Record<string, { lat: number; lon: number; elev: number; name: string }> = {
      'addis ababa': { lat: 9.03, lon: 38.74, elev: 2355, name: 'Addis Ababa (2,355m)' },
      'finfinnee': { lat: 9.03, lon: 38.74, elev: 2355, name: 'Finfinnee (2,355m)' },
      'debre berhan': { lat: 9.68, lon: 39.53, elev: 2840, name: 'Debre Berhan (2,840m)' },
      'dabra birhaan': { lat: 9.68, lon: 39.53, elev: 2840, name: 'Dabra Birhaan (2,840m)' },
      'gondar': { lat: 12.60, lon: 37.46, elev: 2133, name: 'Gondar (2,133m)' },
      'hawassa': { lat: 7.06, lon: 38.47, elev: 1708, name: 'Hawassa (1,708m)' },
      'hawaasaa': { lat: 7.06, lon: 38.47, elev: 1708, name: 'Hawaasaa (1,708m)' },
      'jimma': { lat: 7.67, lon: 36.83, elev: 1780, name: 'Jimma (1,780m)' },
      'mekelle': { lat: 13.50, lon: 39.47, elev: 2084, name: 'Mekelle (2,084m)' },
      'bahir dar': { lat: 11.59, lon: 37.39, elev: 1800, name: 'Bahir Dar (1,800m)' },
      'baahir daar': { lat: 11.59, lon: 37.39, elev: 1800, name: 'Baahir Daar (1,800m)' },
      'dire dawa': { lat: 9.60, lon: 41.86, elev: 1276, name: 'Dire Dawa (1,276m)' },
      'harar': { lat: 9.31, lon: 42.12, elev: 1885, name: 'Harar (1,885m)' },
      'adama': { lat: 8.54, lon: 39.27, elev: 1712, name: 'Adama / Nazret (1,712m)' },
      'bishoftu': { lat: 8.75, lon: 38.98, elev: 1920, name: 'Bishoftu (1,920m)' },
      'dessie': { lat: 11.13, lon: 39.63, elev: 2470, name: 'Dessie (2,470m)' },
      'arba minch': { lat: 6.03, lon: 37.55, elev: 1285, name: 'Arba Minch (1,285m)' },
      'asosa': { lat: 10.06, lon: 34.53, elev: 1570, name: 'Asosa (1,570m)' },
      'jijiga': { lat: 9.35, lon: 42.80, elev: 1609, name: 'Jijiga (1,609m)' },
      'gambela': { lat: 8.25, lon: 34.58, elev: 526, name: 'Gambela (526m)' },
      'semera': { lat: 11.79, lon: 41.00, elev: 433, name: 'Semera, Afar (433m)' },
      'robel': { lat: 7.12, lon: 40.00, elev: 2492, name: 'Robe, Bale (2,492m)' },
      'lalibela': { lat: 12.03, lon: 39.04, elev: 2500, name: 'Lalibela (2,500m)' },
      'axum': { lat: 14.12, lon: 38.72, elev: 2131, name: 'Axum (2,131m)' },
    };

    const queryKey = searchQuery.toLowerCase().trim();
    const localMatch = ethiopianPredefinedPlaces[queryKey];
    if (localMatch) {
      setManualElevation(localMatch.elev);
      onLocationChange(localMatch.lat, localMatch.lon, localMatch.elev, localMatch.name);
      setElevationLookupNotice(`${t.elevation_lookup_success}: ${localMatch.elev} m`);
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=et&q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            'User-Agent': 'EthiopianAnemiaScreeningApp/1.0',
          },
        }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);
          const name = first.display_name.split(',')[0];
          await fetchElevation(lat, lon, name);
          return;
        }
      }
      setSearchError(t.location_search_error);
    } catch {
      setSearchError(t.elevation_offline_fallback);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualElevationChange = (newVal: number) => {
    setManualElevation(newVal);
    onLocationChange(latitude, longitude, newVal, locationName);
  };

  return (
    <div
      id="ethiopia-map-altitude-section"
      className={`box-interactive-green rounded-2xl p-4 sm:p-6 shadow-sm transition-all ${
        isDark
          ? 'bg-[#1E293B] text-[#F8FAFC]'
          : 'bg-white text-slate-950'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Compass className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
        <h2 className={`font-serif-header text-base sm:text-lg font-extrabold ${
          isDark ? 'text-slate-100' : 'text-slate-950'
        }`}>
          {t.step_c_title}
        </h2>
      </div>

      <p className={`text-xs sm:text-sm mb-4 font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
        {t.manual_elevation_hint}
      </p>

      {/* Search Bar for Ethiopian towns */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="map-search-input"
              type="text"
              placeholder={t.map_search_placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border-2 font-bold outline-none transition-all ${
                isDark
                  ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] placeholder-slate-400 focus:border-emerald-400'
                  : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
              }`}
            />
          </div>

          <button
            id="btn-search-location"
            type="submit"
            disabled={isSearching}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
              isDark
                ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500'
                : 'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-800'
            } disabled:opacity-50`}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.searching_location}</span>
              </>
            ) : (
              <span>{t.map_search_btn}</span>
            )}
          </button>
        </div>

        {searchError && (
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{searchError}</span>
          </p>
        )}
      </form>

      {/* Interactive Map Container */}
      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border-2 border-emerald-400 dark:border-emerald-700/60 shadow-inner mb-4">
        <div ref={mapContainerRef} className="w-full h-full" />

        {isElevationLoading && (
          <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-xs shadow-md border border-emerald-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span className="font-bold">{t.looking_up_elevation}</span>
          </div>
        )}
      </div>

      {/* Location Details & Altitude Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div
          className={`box-interactive-green p-3.5 rounded-xl ${
            isDark ? 'bg-[#0F172A]' : 'bg-slate-50'
          }`}
        >
          <div className="flex items-start gap-2">
            <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.selected_location}</p>
              <p className={`text-sm font-extrabold leading-snug ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{locationName}</p>
              <p className={`text-[11px] mt-0.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
              </p>
            </div>
          </div>
        </div>

        <div
          className={`box-interactive-gold p-3.5 rounded-xl ${
            isDark ? 'bg-[#0F172A]' : 'bg-slate-50'
          }`}
        >
          <label htmlFor="elevation-input" className={`block text-xs font-extrabold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>
            {t.elevation_label} ({t.elevation_unit})
          </label>
          <div className="flex items-center gap-2">
            <input
              id="elevation-input"
              type="number"
              min="-400"
              max="5000"
              step="50"
              value={manualElevation}
              onChange={(e) => handleManualElevationChange(Number(e.target.value))}
              className={`w-full px-3 py-1.5 rounded-lg text-base font-extrabold border-2 outline-none ${
                isDark
                  ? 'bg-[#1E293B] border-amber-600/60 text-[#F8FAFC] focus:border-amber-400'
                  : 'bg-white border-amber-300 text-slate-950 focus:border-amber-600 focus:ring-2 focus:ring-amber-100'
              }`}
            />
            <span className={`text-xs font-extrabold whitespace-nowrap ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>
              {t.meters_asl}
            </span>
          </div>

          {elevationLookupNotice && (
            <p className="text-[11px] mt-1.5 flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{elevationLookupNotice}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
