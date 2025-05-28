import React from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatHistory from './ChatHistory';

const Sidebar: React.FC = () => {
  const { clearChat } = useChat();

  const handleNewChat = () => {
    if (window.confirm('Are you sure you want to start a new chat? This will clear your current conversation.')) {
      clearChat();
    }
  };

  return (
    <aside className="w-80 glass-intense border-r border-white/10 flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold flex items-center text-textPrimary">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            Chat History
          </h2>
          <button 
            onClick={handleNewChat}
            className="p-2 text-textSecondary hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-200 btn-interactive"
            title="New Chat"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6">
          <ChatHistory />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;