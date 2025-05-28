import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage, isLoading } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      await sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const toggleRecording = () => {
    // This would be replaced with actual speech recognition implementation
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert('Speech recognition would start here (not implemented in this demo)');
    } else {
      alert('Speech recognition would stop here (not implemented in this demo)');
    }
  };

  const commonSymptoms = [
    '🤒 Headache', '😷 Cold symptoms', '🤧 Allergies', 
    '😰 Anxiety', '😴 Sleep issues', '🤕 Stomach pain'
  ];

  return (
    <div className="space-y-4">
      {/* Quick symptom buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {commonSymptoms.map((symptom) => (
          <button
            key={symptom}
            onClick={() => setMessage(symptom.split(' ').slice(1).join(' '))}
            className="px-3 py-1 text-sm glass rounded-full hover:glass-intense transition-all duration-200 text-textSecondary hover:text-primary btn-interactive"
          >
            {symptom}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end glass rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a health question..."
            className="flex-1 py-4 px-6 bg-transparent outline-none resize-none max-h-32 min-h-[56px] text-textPrimary placeholder-textMuted focus-glow"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex items-center p-2 space-x-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all duration-200 btn-interactive ${
                isRecording 
                  ? 'bg-error/20 text-error hover:bg-error/30' 
                  : 'text-textSecondary hover:text-primary hover:bg-primary/10'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-aurora text-white disabled:bg-textMuted/20 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100 btn-interactive"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-textMuted mt-3 text-center">
          💡 This AI assistant provides general health information but is not a substitute for professional medical advice.
        </p>
      </form>
    </div>
  );
};

export default ChatInput;