import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '../types';

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  hasStartedChat: boolean;
  triageState: TriageState;
  currentChatId: string;
  sendMessage: (text: string) => Promise<void>;
  sendQuickResponse: (response: string, questionId?: string) => Promise<void>;
  clearChat: () => void;
  startNewChat: () => void;
}

interface TriageState {
  isActive: boolean;
  currentStep: number;
  questionsAsked: string[];
  symptomsGathered: Record<string, any>;
  isComplete: boolean;
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
  const [currentChatId, setCurrentChatId] = useState('');
  const [triageState, setTriageState] = useState<TriageState>({
    isActive: false,
    currentStep: 0,
    questionsAsked: [],
    symptomsGathered: {},
    isComplete: false
  });

  // Generate unique chat ID
  const generateChatId = () => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedCurrentChatId = localStorage.getItem('currentChatId');
    const savedTriageState = localStorage.getItem('triageState');
    
    if (savedCurrentChatId) {
      setCurrentChatId(savedCurrentChatId);
      const savedMessages = localStorage.getItem(`chatMessages_${savedCurrentChatId}`);
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          const userMessages = parsedMessages.filter((msg: Message) => msg.isUser);
          setHasStartedChat(userMessages.length > 0);
        } catch (error) {
          console.error('Error parsing saved messages:', error);
          startNewChat();
        }
      } else {
        addWelcomeMessage();
      }
    } else {
      startNewChat();
    }

    if (savedTriageState) {
      try {
        setTriageState(JSON.parse(savedTriageState));
      } catch (error) {
        console.error('Error parsing saved triage state:', error);
        localStorage.removeItem('triageState');
      }
    }
  }, []);

  // Save messages and triage state to localStorage
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(`chatMessages_${currentChatId}`, JSON.stringify(messages));
      localStorage.setItem('currentChatId', currentChatId);
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    localStorage.setItem('triageState', JSON.stringify(triageState));
  }, [triageState]);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm your AI medical assistant. I'll help you by asking some questions about your symptoms to provide better guidance. Please describe your main concern or symptom.",
      isUser: false,
      timestamp: new Date().toISOString(),
      chatId: currentChatId
    };
    setMessages([welcomeMessage]);
    setHasStartedChat(false);
    setTriageState({
      isActive: false,
      currentStep: 0,
      questionsAsked: [],
      symptomsGathered: {},
      isComplete: false
    });
  };

  const startNewChat = () => {
    const newChatId = generateChatId();
    setCurrentChatId(newChatId);
    setMessages([]);
    setHasStartedChat(false);
    setTriageState({
      isActive: false,
      currentStep: 0,
      questionsAsked: [],
      symptomsGathered: {},
      isComplete: false
    });
    
    // Add welcome message after setting new chat ID
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! I'm your AI medical assistant. I'll help you by asking some questions about your symptoms to provide better guidance. Please describe your main concern or symptom.",
        isUser: false,
        timestamp: new Date().toISOString(),
        chatId: newChatId
      };
      setMessages([welcomeMessage]);
    }, 100);
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
      timestamp: new Date().toISOString(),
      chatId: currentChatId
    };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Update triage state
      let newTriageState = { ...triageState };
      
      if (!triageState.isActive) {
        // Start triage process
        newTriageState = {
          isActive: true,
          currentStep: 1,
          questionsAsked: [],
          symptomsGathered: { mainSymptom: text },
          isComplete: false
        };
      } else {
        // Add response to gathered symptoms
        const questionId = `step_${triageState.currentStep}`;
        newTriageState.symptomsGathered = {
          ...triageState.symptomsGathered,
          [questionId]: text
        };
        newTriageState.currentStep += 1;
      }

      // Determine if we should complete the assessment (after 4-5 questions)
      const shouldComplete = newTriageState.currentStep >= 5;
      
      if (shouldComplete) {
        newTriageState.isComplete = true;
      }

      // Call API for response - let AI generate contextual questions and options
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: messages,
          triageData: newTriageState.symptomsGathered,
          isFinalAssessment: shouldComplete,
          needsOptions: !shouldComplete && newTriageState.currentStep <= 4,
          stepNumber: newTriageState.currentStep
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setTriageState(newTriageState);

      // Ensure response text is valid
      const responseText = typeof data.response === 'string' ? data.response : 'I apologize, but I encountered an issue processing your request. Please try again.';
      const responseOptions = Array.isArray(data.options) ? data.options : undefined;

      // Create bot message with AI-generated options if provided
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString(),
        chatId: currentChatId,
        options: responseOptions
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
        chatId: currentChatId,
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickResponse = async (response: string, questionId?: string) => {
    // This handles button clicks for quick responses
    await sendMessage(response);
  };

  const clearChat = () => {
    startNewChat();
  };

  const value = {
    messages,
    isLoading,
    hasStartedChat,
    triageState,
    currentChatId,
    sendMessage,
    sendQuickResponse,
    clearChat,
    startNewChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};