import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const ChatInterface: React.FC = () => {
  const { messages } = useChat();
  
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-center mb-4 flex-shrink-0">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-textPrimary">🩺 Medical Assistant</h2>
          <span className="ml-2 px-2 py-1 bg-success/20 text-success text-xs font-medium rounded-full border border-success/30">
            Online
          </span>
        </div>
      </div>
      
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto glass rounded-xl mb-4 min-h-0">
        <ChatMessages messages={messages} />
      </div>
      
      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatInterface;