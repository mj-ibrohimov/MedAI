import React from 'react';
import { MapPin, Star, ExternalLink, Clock, Navigation } from 'lucide-react';
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

  const calculateWalkingTime = (meters: number | undefined) => {
    if (!meters) return 'Unknown time';
    
    // Average walking speed is about 5 km/h or 1.4 m/s
    const walkingSpeedMps = 1.4;
    const timeSeconds = meters / walkingSpeedMps;
    
    if (timeSeconds < 60) {
      return '< 1 min walk';
    } else if (timeSeconds < 3600) {
      const minutes = Math.round(timeSeconds / 60);
      return `${minutes} min walk`;
    } else {
      const hours = Math.floor(timeSeconds / 3600);
      const minutes = Math.round((timeSeconds % 3600) / 60);
      return `${hours}h ${minutes}m walk`;
    }
  };

  const getDirectionsUrl = (place: Place) => {
    const { lat, lng } = place.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
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
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold text-accent">
                    {formatDistance(place.distanceMeters)}
                  </span>
                  <span className="text-textMuted ml-1">
                    ({calculateWalkingTime(place.distanceMeters)})
                  </span>
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
            
            <a
              href={getDirectionsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-2 bg-gradient-aurora text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg text-sm font-medium btn-interactive"
            >
              <span>Walking Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationResults;