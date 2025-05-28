import React from 'react';
import { MapPin, Star, ExternalLink, Clock, Navigation, Car, User } from 'lucide-react';
import { Place } from '../../types';

interface LocationResultsProps {
  places: Place[];
  loading: boolean;
  error: string | null;
}

const LocationResults: React.FC<LocationResultsProps> = ({ places, loading, error }) => {
  const formatDistance = (meters: number | undefined) => {
    if (!meters) return 'Unknown distance';
    
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
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
    if (!meters) return 'Unknown time';
    
    // Average walking speed is about 5 km/h or 1.4 m/s
    const walkingSpeedMps = 1.4;
    const timeSeconds = meters / walkingSpeedMps;
    
    if (timeSeconds < 60) {
      return '< 1 min';
    } else if (timeSeconds < 3600) {
      const minutes = Math.round(timeSeconds / 60);
      return `${minutes} min`;
    } else {
      const hours = Math.floor(timeSeconds / 3600);
      const minutes = Math.round((timeSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getDirectionsUrl = (place: Place, mode: 'walking' | 'driving' = 'walking') => {
    const { lat, lng } = place.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-white/20 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 glass rounded-xl">
        <p className="text-error mb-2 font-medium">{error}</p>
        <p className="text-textMuted text-sm">Please try again or check your connection.</p>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-8 glass rounded-xl">
        <MapPin className="w-12 h-12 text-textMuted mx-auto mb-3" />
        <p className="text-textMuted">No healthcare facilities found nearby</p>
        <p className="text-textMuted text-sm mt-1">Try expanding your search or selecting a different category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {places.map(place => (
        <div key={place.id} className="glass rounded-xl p-5 hover:glass-intense transition-all duration-300 group border border-white/10">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-textPrimary text-lg group-hover:text-accent transition-colors duration-200">
              {place.name}
            </h4>
            {place.rating && (
              <div className="flex items-center bg-gradient-aurora/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="ml-1 text-sm font-medium text-textPrimary">{place.rating}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-start mb-4 text-textSecondary">
            <MapPin className="w-4 h-4 mt-0.5 mr-2 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed">{place.address}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col space-y-2 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 min-w-0">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="text-sm min-w-0">
                    <span className="font-semibold text-accent">
                      {formatTravelTime(place).walkingDistance}
                    </span>
                    <span className="text-textMuted ml-1">
                      · {formatTravelTime(place).walking} walk
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-green-400 shrink-0" />
                  <div className="text-sm min-w-0">
                    <span className="font-semibold text-accent">
                      {formatTravelTime(place).drivingDistance}
                    </span>
                    <span className="text-textMuted ml-1">
                      · {formatTravelTime(place).driving} drive
                    </span>
                  </div>
                </div>
              </div>
              
              {place.openNow !== undefined && (
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  place.openNow 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : 'bg-error/20 text-error border border-error/30'
                }`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {place.openNow ? 'Open now' : 'Closed'}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <a
                href={getDirectionsUrl(place, 'walking')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg text-sm font-medium btn-interactive border border-blue-500/30"
              >
                <User className="w-3 h-3" />
                <span>Walk</span>
              </a>
              <a
                href={getDirectionsUrl(place, 'driving')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-2 bg-green-500/20 text-green-300 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg text-sm font-medium btn-interactive border border-green-500/30"
              >
                <Car className="w-3 h-3" />
                <span>Drive</span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationResults;