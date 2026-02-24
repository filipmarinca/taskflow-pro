import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchMessages, sendMessage } from '../../features/chatSlice';
import { useSocket } from '../../hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';

interface ChatProps {
  projectId: string;
}

export const Chat: React.FC<ChatProps> = ({ projectId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.messages[projectId] || []);
  const typingUsers = useAppSelector(state => state.chat.typingUsers[projectId] || []);
  const currentUser = useAppSelector(state => state.auth.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { emitTyping } = useSocket(projectId);

  useEffect(() => {
    dispatch(fetchMessages(projectId));
  }, [projectId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (value && !isTyping) {
      setIsTyping(true);
      emitTyping(true);
    } else if (!value && isTyping) {
      setIsTyping(false);
      emitTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const mentions: string[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1]);
    }

    await dispatch(sendMessage({ projectId, content: message, mentions }));
    setMessage('');
    setIsTyping(false);
    emitTyping(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Team Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold">
              {msg.userId.substring(0, 2).toUpperCase()}
            </div>
            
            <div className={`flex-1 ${msg.userId === currentUser?.id ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{msg.userId}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.userId === currentUser?.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.length} {typingUsers.length === 1 ? 'person is' : 'people are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message... (@mention)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
