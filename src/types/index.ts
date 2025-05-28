// Message type for chat
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  error?: boolean;
}

// Article type for health articles feed
export interface Article {
  id: number;
  title: string;
  summary: string;
  content?: string;
  imageUrl: string;
  category: string;
  readTime: string;
  publishDate?: string;
}

// Place type for location-based services
export interface Place {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  photos?: {
    reference: string;
    width: number;
    height: number;
  }[];
  distanceMeters?: number;
  travelTimes?: {
    walking: {
      distance: string;
      distanceMeters: number | null;
      duration: string;
      durationSeconds: number | null;
      status: string;
    };
    driving: {
      distance: string;
      distanceMeters: number | null;
      duration: string;
      durationSeconds: number | null;
      status: string;
    };
  } | null;
}