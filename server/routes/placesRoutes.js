import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

/**
 * @route GET /api/places/travel-times
 * @desc Get travel times and distances for multiple destinations
 * @access Public
 */
router.get('/travel-times', async (req, res) => {
  try {
    const { origins, destinations } = req.query;
    
    if (!origins || !destinations) {
      return res.status(400).json({ error: 'Origins and destinations are required' });
    }

    // Get travel times for both walking and driving
    const [walkingResponse, drivingResponse] = await Promise.all([
      axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins,
          destinations,
          mode: 'walking',
          units: 'metric',
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      }),
      axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins,
          destinations,
          mode: 'driving',
          units: 'metric',
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      })
    ]);

    const walkingData = walkingResponse.data;
    const drivingData = drivingResponse.data;

    if (walkingData.status !== 'OK' || drivingData.status !== 'OK') {
      throw new Error('Distance Matrix API error');
    }

    const travelTimes = [];
    
    for (let i = 0; i < walkingData.rows[0].elements.length; i++) {
      const walkingElement = walkingData.rows[0].elements[i];
      const drivingElement = drivingData.rows[0].elements[i];
      
      travelTimes.push({
        walking: {
          distance: walkingElement.distance?.text || 'Unknown',
          distanceMeters: walkingElement.distance?.value || null,
          duration: walkingElement.duration?.text || 'Unknown',
          durationSeconds: walkingElement.duration?.value || null,
          status: walkingElement.status
        },
        driving: {
          distance: drivingElement.distance?.text || 'Unknown',
          distanceMeters: drivingElement.distance?.value || null,
          duration: drivingElement.duration?.text || 'Unknown',
          durationSeconds: drivingElement.duration?.value || null,
          status: drivingElement.status
        }
      });
    }

    res.json({ travelTimes });
  } catch (error) {
    console.error('Error fetching travel times:', error);
    res.status(500).json({ error: 'Failed to fetch travel times' });
  }
});

/**
 * @route GET /api/places
 * @desc Get nearby healthcare facilities based on coordinates
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lng, type = 'pharmacy', radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // Valid place types for healthcare
    const validTypes = ['pharmacy', 'doctor', 'hospital', 'dentist', 'physiotherapist'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid place type', 
        validTypes 
      });
    }
    
    // Make request to Google Places API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      }
    );
    
    // Transform and filter the results
    let places = response.data.results.map(place => {
      const distanceMeters = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: place.geometry.location,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })),
        distanceMeters: Math.round(distanceMeters)
      };
    });

    // Sort by distance and limit to top 10
    places = places.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0)).slice(0, 10);

    // Get travel times for the places
    try {
      if (places.length > 0 && process.env.GOOGLE_PLACES_API_KEY) {
        const origins = `${lat},${lng}`;
        const destinations = places.map(place => `${place.location.lat},${place.location.lng}`).join('|');
        
        // Get travel times for both walking and driving
        const [walkingResponse, drivingResponse] = await Promise.all([
          axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
              origins,
              destinations,
              mode: 'walking',
              units: 'metric',
              key: process.env.GOOGLE_PLACES_API_KEY
            }
          }),
          axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
              origins,
              destinations,
              mode: 'driving',
              units: 'metric',
              key: process.env.GOOGLE_PLACES_API_KEY
            }
          })
        ]);

        const walkingData = walkingResponse.data;
        const drivingData = drivingResponse.data;

        if (walkingData.status === 'OK' && drivingData.status === 'OK' && 
            walkingData.rows.length > 0 && drivingData.rows.length > 0) {
          
          const walkingElements = walkingData.rows[0].elements;
          const drivingElements = drivingData.rows[0].elements;
          
          places = places.map((place, index) => {
            if (index < walkingElements.length && index < drivingElements.length) {
              const walkingElement = walkingElements[index];
              const drivingElement = drivingElements[index];
              
              return {
                ...place,
                travelTimes: {
                  walking: {
                    distance: walkingElement.distance?.text || 'Unknown',
                    distanceMeters: walkingElement.distance?.value || null,
                    duration: walkingElement.duration?.text || 'Unknown',
                    durationSeconds: walkingElement.duration?.value || null,
                    status: walkingElement.status
                  },
                  driving: {
                    distance: drivingElement.distance?.text || 'Unknown',
                    distanceMeters: drivingElement.distance?.value || null,
                    duration: drivingElement.duration?.text || 'Unknown',
                    durationSeconds: drivingElement.duration?.value || null,
                    status: drivingElement.status
                  }
                }
              };
            }
            return place;
          });
        }
      }
    } catch (travelError) {
      console.error('Error fetching travel times:', travelError);
      // Continue without travel times - not a critical error
    }
    
    res.json({
      places,
      type,
      total: places.length
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Error from Places API', 
        details: error.response.data 
      });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/places/photo
 * @desc Get place photo by reference
 * @access Public
 */
router.get('/photo', async (req, res) => {
  try {
    const { reference, maxwidth = 400 } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Photo reference is required' });
    }
    
    // Redirect to the Google Places Photo API
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${reference}&maxwidth=${maxwidth}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    
    res.redirect(photoUrl);
  } catch (error) {
    console.error('Error fetching place photo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;