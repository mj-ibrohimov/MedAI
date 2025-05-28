import React, { useEffect, useRef } from 'react';
import { User, Bot, Sparkles } from 'lucide-react';
import { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../context/ChatContext';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-textMuted">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg">Start a conversation by typing a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div
            className={`flex max-w-[80%] ${
              message.isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`shrink-0 p-3 rounded-full self-end mb-2 ${
                message.isUser 
                  ? 'ml-3 bg-gradient-aurora text-white shadow-lg' 
                  : 'mr-3 bg-gradient-cosmic text-white shadow-lg'
              }`}
            >
              {message.isUser ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`py-4 px-6 rounded-2xl ${
                message.isUser
                  ? 'message-user rounded-tr-none shadow-xl'
                  : 'message-ai rounded-tl-none shadow-xl'
              } ${message.error ? 'border-2 border-error/50' : ''}`}
            >
              <div className="prose prose-sm max-w-none">
                {message.isUser ? (
                  <p className="m-0 whitespace-pre-wrap text-white">
                    {message.text}
                  </p>
                ) : (
                  <div className="text-textPrimary">
                    <ReactMarkdown 
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-textPrimary">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-textPrimary">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-textPrimary">{children}</ol>,
                        li: ({ children }) => <li className="mb-1 text-textPrimary">{children}</li>,
                        strong: ({ children }) => <strong className="text-accent font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="text-textAccent italic">{children}</em>,
                        code: ({ children }) => <code className="bg-primary/20 text-primary px-1 py-0.5 rounded text-sm">{children}</code>,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="text-xs mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start animate-fade-in">
          <div className="flex max-w-[80%] flex-row">
            <div className="shrink-0 p-3 rounded-full self-end mb-2 mr-3 bg-gradient-cosmic text-white shadow-lg animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="py-4 px-6 rounded-2xl message-ai rounded-tl-none shadow-xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-textSecondary text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;