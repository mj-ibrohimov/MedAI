import express from 'express';
import axios from 'axios';

const router = express.Router();

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
    const places = response.data.results.map(place => ({
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
      distanceMeters: place.distance // If available
    }));
    
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