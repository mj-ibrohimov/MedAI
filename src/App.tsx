import React from 'react';
import { LayoutProvider } from './context/LayoutContext';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/Layout';
import ChatInterface from './components/chat/ChatInterface';
import ArticlesFeed from './components/articles/ArticlesFeed';
import LocationServices from './components/location/LocationServices';
import { useChat } from './context/ChatContext';

const AppContent: React.FC = () => {
  const { hasStartedChat } = useChat();

  return (
    <div className="min-h-screen bg-gradient-purple-dark text-textPrimary">
      <Layout
        main={<ChatInterface />}
        footer={!hasStartedChat ? <ArticlesFeed /> : undefined}
        header={<LocationServices />}
      />
    </div>
  );
};

function App() {
  return (
    <LayoutProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </LayoutProvider>
  );
}

export default App;