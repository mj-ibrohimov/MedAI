import React, { useState } from 'react';
import { MapPin, Search, Clock, Star, Navigation, ExternalLink, X, Loader2, Car, User } from 'lucide-react';
import { Place } from '../../types';

const LocationServices: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationType, setLocationType] = useState<string>('pharmacy');

  const healthcareTypes = [
    { type: 'pharmacy', emoji: '💊', label: 'Pharmacy', color: 'from-green-500 to-emerald-600' },
    { type: 'doctor', emoji: '👨‍⚕️', label: 'Doctor', color: 'from-blue-500 to-cyan-600' },
    { type: 'hospital', emoji: '🏥', label: 'Hospital', color: 'from-red-500 to-pink-600' },
    { type: 'dentist', emoji: '🦷', label: 'Dentist', color: 'from-purple-500 to-violet-600' }
  ];

  const formatDistance = (meters: number | undefined) => {
    if (!meters) return 'Unknown';
    return meters < 1000 ? `${meters.toFixed(0)}m` : `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTravelTime = (place: Place) => {
    if (!place.travelTimes) {
      // Fallback to calculated walking time
      const walkingTime = calculateWalkingTime(place.distanceMeters);
      return {
        walking: walkingTime,
        driving: 'Unknown',
        walkingDistance: formatDistance(place.distanceMeters),
        drivingDistance: 'Unknown'
      };
    }

    const { walking, driving } = place.travelTimes;
    
    return {
      walking: walking.status === 'OK' ? walking.duration : 'Unknown',
      driving: driving.status === 'OK' ? driving.duration : 'Unknown',
      walkingDistance: walking.status === 'OK' ? walking.distance : formatDistance(place.distanceMeters),
      drivingDistance: driving.status === 'OK' ? driving.distance : 'Unknown'
    };
  };

  const calculateWalkingTime = (meters: number | undefined) => {
    if (!meters) return 'Unknown';
    const walkingSpeedMps = 1.4;
    const timeSeconds = meters / walkingSpeedMps;
    
    if (timeSeconds < 60) return '< 1 min';
    if (timeSeconds < 3600) return `${Math.round(timeSeconds / 60)} min`;
    
    const hours = Math.floor(timeSeconds / 3600);
    const minutes = Math.round((timeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getDirectionsUrl = (place: Place, mode: 'walking' | 'driving' = 'walking') => {
    const { lat, lng } = place.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
  };

  const fetchNearbyPlaces = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `/api/places?lat=${latitude}&lng=${longitude}&type=${locationType}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch nearby places');
          }
          
          const data = await response.json();
          setPlaces(data.places);
        } catch (err) {
          console.error('Error fetching places:', err);
          setError('Failed to load nearby healthcare facilities');
          
          // Fallback dummy data with realistic walking distances
          setPlaces([
            {
              id: 'place1',
              name: 'HealthPlus Pharmacy',
              address: '123 Medical Street, Downtown',
              location: { lat: 37.7749, lng: -122.4194 },
              rating: 4.6,
              openNow: true,
              distanceMeters: 240
            },
            {
              id: 'place2',
              name: 'CityLife Medical Center',
              address: '456 Wellness Boulevard, City Center',
              location: { lat: 37.7749, lng: -122.4194 },
              rating: 4.8,
              openNow: true,
              distanceMeters: 850
            },
            {
              id: 'place3',
              name: 'Express Care Clinic',
              address: '789 Health Avenue, Midtown',
              location: { lat: 37.7749, lng: -122.4194 },
              rating: 4.3,
              openNow: false,
              distanceMeters: 1200
            }
          ]);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to access your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const handleSearch = () => {
    setIsExpanded(true);
    fetchNearbyPlaces();
  };

  const handleTypeChange = (type: string) => {
    setLocationType(type);
    if (isExpanded) {
      fetchNearbyPlaces();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {!isExpanded ? (
        // Compact Search Bar
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-aurora/20 backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-textPrimary">Find Healthcare</h3>
              <p className="text-xs text-textMuted">Discover nearby medical services</p>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-aurora text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg btn-interactive"
          >
            <Search className="w-4 h-4" />
            <span className="font-medium">Search Nearby</span>
          </button>
        </div>
      ) : (
        // Expanded Healthcare Finder
        <div className="space-y-6">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-aurora/20 backdrop-blur-sm">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-textPrimary">Healthcare Finder</h2>
                <p className="text-textMuted">Find medical services near you</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-textSecondary hover:text-error rounded-xl hover:bg-error/10 transition-all duration-200 btn-interactive"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Healthcare Type Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {healthcareTypes.map(({ type, emoji, label, color }) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 btn-interactive ${
                  locationType === type
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent scale-105'
                    : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`} />
                <div className="relative flex flex-col items-center space-y-2">
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-sm font-medium text-textPrimary">{label}</span>
                </div>
                {locationType === type && (
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-2xl" />
                )}
              </button>
            ))}
          </div>

          {/* Results Section */}
          <div className="glass rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl">
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-textSecondary">Finding nearby healthcare facilities...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 space-y-4">
                  <div className="p-4 rounded-full bg-error/20 w-fit mx-auto">
                    <MapPin className="w-8 h-8 text-error" />
                  </div>
                  <div>
                    <p className="text-error font-medium">{error}</p>
                    <p className="text-textMuted text-sm mt-1">Showing sample results instead</p>
                  </div>
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="p-4 rounded-full bg-textMuted/20 w-fit mx-auto">
                    <Search className="w-8 h-8 text-textMuted" />
                  </div>
                  <p className="text-textMuted">No healthcare facilities found nearby</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-textPrimary mb-4 text-center">
                    Found {places.length} {healthcareTypes.find(t => t.type === locationType)?.label.toLowerCase()} facilities nearby
                  </h3>
                  
                  <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                    <div className="grid gap-3 pr-2">
                      {places.map((place, index) => (
                        <div 
                          key={place.id} 
                          className="glass-intense rounded-xl p-4 hover:scale-[1.01] transition-all duration-300 group animate-fade-in shadow-lg border border-primary/20"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-textPrimary group-hover:text-accent transition-colors mb-1 truncate">
                                {place.name}
                              </h4>
                              <div className="flex items-start text-textSecondary">
                                <MapPin className="w-4 h-4 mt-0.5 mr-2 shrink-0 text-primary" />
                                <p className="text-sm line-clamp-2">{place.address}</p>
                              </div>
                            </div>
                            
                            {place.rating && (
                              <div className="flex items-center bg-gradient-aurora/20 backdrop-blur-sm rounded-full px-2 py-1 ml-3 shrink-0">
                                <Star className="w-3 h-3 fill-warning text-warning" />
                                <span className="ml-1 text-xs font-medium text-textPrimary">{place.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex flex-col space-y-1 bg-glass rounded-lg px-3 py-2 min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <User className="w-3 h-3 text-blue-400 shrink-0" />
                                  <div className="text-xs min-w-0 truncate">
                                    <span className="font-semibold text-textPrimary">
                                      {formatTravelTime(place).walkingDistance}
                                    </span>
                                    <span className="text-textMuted ml-1">
                                      · {formatTravelTime(place).walking} walk
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Car className="w-3 h-3 text-green-400 shrink-0" />
                                  <div className="text-xs min-w-0 truncate">
                                    <span className="font-semibold text-textPrimary">
                                      {formatTravelTime(place).drivingDistance}
                                    </span>
                                    <span className="text-textMuted ml-1">
                                      · {formatTravelTime(place).driving} drive
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {place.openNow !== undefined && (
                                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${
                                  place.openNow 
                                    ? 'bg-success/20 text-success' 
                                    : 'bg-error/20 text-error'
                                }`}>
                                  <Clock className="w-3 h-3 mr-1" />
                                  {place.openNow ? 'Open' : 'Closed'}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 shrink-0">
                              <a
                                href={getDirectionsUrl(place, 'walking')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-2 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:scale-105 transition-all duration-200 shadow-md text-xs font-medium btn-interactive border border-blue-500/30"
                              >
                                <User className="w-3 h-3" />
                                <span>Walk</span>
                              </a>
                              <a
                                href={getDirectionsUrl(place, 'driving')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-2 py-1.5 bg-green-500/20 text-green-300 rounded-lg hover:scale-105 transition-all duration-200 shadow-md text-xs font-medium btn-interactive border border-green-500/30"
                              >
                                <Car className="w-3 h-3" />
                                <span>Drive</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationServices;