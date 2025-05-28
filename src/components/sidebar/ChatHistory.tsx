import React from 'react';
import { User, Bot } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatHistory: React.FC = () => {
  const { messages } = useChat();

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  const groupedMessagesArray = Object.entries(groupedMessages).map(([date, messages]) => ({
    date,
    messages
  }));

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <Bot className="w-12 h-12 text-textMuted mx-auto mb-3" />
        <p className="text-textMuted">No conversations yet</p>
        <p className="text-textMuted text-sm mt-1">Start chatting to see your history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedMessagesArray.map(({ date, messages }) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center">
            <div className="flex-grow h-px bg-white/20"></div>
            <span className="px-3 text-sm text-textSecondary bg-glass rounded-full">{date}</span>
            <div className="flex-grow h-px bg-white/20"></div>
          </div>
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 p-3 rounded-xl glass hover:glass-intense transition-all duration-200 ${
                message.error ? 'border border-error/30' : ''
              }`}
            >
              <div className={`shrink-0 p-2 rounded-full ${
                message.isUser 
                  ? 'bg-gradient-aurora text-white' 
                  : 'bg-gradient-cosmic text-white'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${
                  message.error ? 'text-error' : 'text-textPrimary'
                }`}>
                  {message.text}
                </p>
                <p className="text-xs text-textMuted mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;