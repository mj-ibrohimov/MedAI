import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '../types';

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  hasStartedChat: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        // Check if there are any user messages (not just the welcome message)
        const userMessages = parsedMessages.filter((msg: Message) => msg.isUser);
        setHasStartedChat(userMessages.length > 0);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        localStorage.removeItem('chatMessages');
        addWelcomeMessage();
      }
    } else {
      addWelcomeMessage();
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm your AI medical assistant. Please describe your symptoms or health concerns, and I'll do my best to help you. Remember, I'm not a replacement for professional medical advice.",
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    setHasStartedChat(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Mark that the user has started chatting
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Create bot message with response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      // Add bot message to state
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : "I'm sorry, I couldn't process your request. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    addWelcomeMessage();
  };

  const value = {
    messages,
    isLoading,
    hasStartedChat,
    sendMessage,
    clearChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};