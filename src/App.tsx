import React from 'react';
import { LayoutProvider } from './context/LayoutContext';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/Layout';
import ChatInterface from './components/chat/ChatInterface';
import ArticlesFeed from './components/articles/ArticlesFeed';
import LocationServices from './components/location/LocationServices';

function App() {
  return (
    <LayoutProvider>
      <ChatProvider>
        <div className="min-h-screen bg-gradient-purple-dark text-textPrimary">
          <Layout
            main={<ChatInterface />}
            footer={<ArticlesFeed />}
            header={<LocationServices />}
          />
        </div>
      </ChatProvider>
    </LayoutProvider>
  );
}

export default App;