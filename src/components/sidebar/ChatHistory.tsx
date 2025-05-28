import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, User, Bot, Trash2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

const ChatHistory: React.FC = () => {
  const { currentChatId, startNewChat } = useChat();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load chat sessions from localStorage
  useEffect(() => {
    loadChatSessions();
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      loadChatSessions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also reload when messages change (for current session updates)
    const interval = setInterval(loadChatSessions, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadChatSessions = () => {
    const sessions: ChatSession[] = [];
    
    // Get all localStorage keys that start with 'chatMessages_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chatMessages_')) {
        try {
          const chatId = key.replace('chatMessages_', '');
          const messagesData = localStorage.getItem(key);
          
          if (messagesData) {
            const messages = JSON.parse(messagesData);
            if (messages.length > 0) {
              // Get the last user message for the title, or use the first message
              const userMessages = messages.filter((msg: any) => msg.isUser);
              const lastMessage = messages[messages.length - 1];
              
              // Create a title from the first user message or use a default
              let title = 'New Consultation';
              if (userMessages.length > 0) {
                const firstUserMessage = userMessages[0].text;
                title = firstUserMessage.length > 40 
                  ? `${firstUserMessage.substring(0, 40)}...` 
                  : firstUserMessage;
              }

              sessions.push({
                id: chatId,
                title,
                lastMessage: lastMessage.text.length > 60 
                  ? `${lastMessage.text.substring(0, 60)}...` 
                  : lastMessage.text,
                timestamp: lastMessage.timestamp,
                messageCount: messages.length
              });
            }
          }
        } catch (error) {
          console.error('Error loading chat session:', error);
        }
      }
    }
    
    // Sort by timestamp (newest first)
    sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setChatSessions(sessions);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const loadChatSession = (chatId: string) => {
    try {
      const messagesData = localStorage.getItem(`chatMessages_${chatId}`);
      if (messagesData) {
        const messages = JSON.parse(messagesData);
        // You would implement this function to load a specific chat
        // For now, we'll just indicate the current chat
        console.log('Loading chat session:', chatId, messages);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const deleteChatSession = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering loadChatSession
    
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        // Remove the chat messages
        localStorage.removeItem(`chatMessages_${chatId}`);
        
        // If this was the current chat, start a new one
        if (chatId === currentChatId) {
          startNewChat();
        }
        
        // Reload chat sessions
        loadChatSessions();
      } catch (error) {
        console.error('Error deleting chat session:', error);
      }
    }
  };

  const clearAllChats = () => {
    if (window.confirm('Are you sure you want to delete ALL conversations? This action cannot be undone.')) {
      try {
        // Get all chat-related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('chatMessages_') || key === 'currentChatId' || key === 'triageState')) {
            keysToRemove.push(key);
          }
        }
        
        // Remove all keys
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Start a new chat
        startNewChat();
        
        // Reload chat sessions
        loadChatSessions();
      } catch (error) {
        console.error('Error clearing all chats:', error);
      }
    }
  };

  if (chatSessions.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-textMuted mx-auto mb-3 opacity-50" />
        <p className="text-textMuted">No conversations yet</p>
        <p className="text-textMuted text-sm mt-1">Start a medical consultation to see your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Clear All Button */}
      <div className="mb-4">
        <button
          onClick={clearAllChats}
          className="w-full p-2 text-xs text-textMuted hover:text-error border border-white/10 hover:border-error/30 rounded-lg transition-colors duration-200"
        >
          <Trash2 className="w-3 h-3 inline mr-2" />
          Clear All Conversations
        </button>
      </div>

      {chatSessions.map((session) => (
        <div
          key={session.id}
          onClick={() => loadChatSession(session.id)}
          className={`p-4 rounded-xl transition-all duration-200 cursor-pointer group relative ${
            session.id === currentChatId
              ? 'bg-primary/20 border border-primary/30 shadow-lg'
              : 'glass hover:glass-intense hover:border-primary/20'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`shrink-0 p-2 rounded-lg ${
              session.id === currentChatId
                ? 'bg-primary text-white'
                : 'bg-gradient-cosmic text-white group-hover:bg-primary'
            } transition-colors duration-200`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium truncate ${
                  session.id === currentChatId ? 'text-primary' : 'text-textPrimary'
                }`}>
                  {session.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {session.id === currentChatId && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                  <button
                    onClick={(e) => deleteChatSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-textMuted hover:text-error transition-all duration-200 rounded"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-textMuted truncate mb-2">
                {session.lastMessage}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-textMuted">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatTimestamp(session.timestamp)}
                </div>
                <span className="text-xs text-textMuted">
                  {session.messageCount} messages
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;