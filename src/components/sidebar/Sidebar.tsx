import React from 'react';
import { MessageSquare, Plus, BookOpen } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatHistory from './ChatHistory';

const Sidebar: React.FC = () => {
  const { startNewChat, hasStartedChat } = useChat();

  const handleNewChat = () => {
    if (hasStartedChat && window.confirm('Are you sure you want to start a new chat? This will save your current conversation and create a new one.')) {
      startNewChat();
    } else if (!hasStartedChat) {
      startNewChat();
    }
  };

  return (
    <aside className="w-80 glass-intense border-r border-white/10 flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold flex items-center text-textPrimary">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            AI Medical Assistant
          </h2>
        </div>

        {/* New Chat Button */}
        <div className="p-6 border-b border-white/10">
          <button 
            onClick={handleNewChat}
            className="w-full p-4 bg-gradient-aurora text-white rounded-xl hover:shadow-xl transition-all duration-200 btn-interactive flex items-center justify-center space-x-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="font-medium">New Medical Consultation</span>
          </button>
        </div>

        {/* Status Indicator */}
        {!hasStartedChat && (
          <div className="px-6 py-3 border-b border-white/10 animate-fade-in">
            <div className="flex items-center text-sm text-textMuted">
              <BookOpen className="w-4 h-4 mr-2 text-accent" />
              <span>Articles visible • Full chat mode on first message</span>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-medium text-textSecondary mb-4 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Recent Conversations
            </h3>
            <ChatHistory />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;