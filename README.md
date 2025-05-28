# AI Doctor Chatbot

An intelligent medical assistant chatbot powered by Sonar API for deep reasoning and contextual understanding of symptoms and medical concerns.

## Features

- **Symptom Triage Chatbot**: Interactive medical assistant that asks follow-up questions about symptoms and provides guidance
- **Chat History Sidebar**: View and manage your conversation history, preserved across sessions
- **Health Articles Feed**: Browse curated health articles on various topics
- **Location-Based Services**: Find nearby healthcare facilities using geolocation

## Tech Stack

### Frontend
- React with functional components and hooks
- Context API for global state management
- Tailwind CSS for styling
- LocalStorage for chat persistence
- Axios for API requests
- Responsive design (mobile & desktop)

### Backend
- Node.js with Express
- `/api/chat` route to proxy user messages to Sonar API
- `/api/articles` route for health article data
- `/api/places` route for nearby healthcare locations

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Sonar API key
- Google Places API key (or other places API)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-doctor-chatbot.git
cd ai-doctor-chatbot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following:
```
SONAR_API_KEY=your_sonar_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Running the Application

For development (runs both client and server with hot reloading):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## API Integration

### Sonar API
The application integrates with the Sonar API to process user queries, analyze symptoms, and provide medical information. The backend proxies requests to protect your API key.

### Places API
For location-based services, the application uses Google Places API to find nearby healthcare facilities. You can replace this with any other places API by modifying the `placesRoutes.js` file.

## Project Structure

```
ai-doctor-chatbot/
├── server/             # Backend code
│   ├── data/           # Static data files
│   ├── routes/         # API route handlers
│   └── index.js        # Server entry point
├── src/                # Frontend code
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main React component
│   ├── index.css       # Global styles
│   └── main.tsx        # React entry point
├── .env.example        # Example environment variables
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── ...                 # Other configuration files
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.