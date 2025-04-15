import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [userId] = useState(() => uuidv4());
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Focus the name input when component mounts
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, payload => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        } else if (payload.eventType === 'DELETE') {
          const deletedMessage = payload.old as Message;
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
        }
      })
      .subscribe();

    const fetchMessages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .gte('created_at', new Date(Date.now() - 40000).toISOString());

        if (fetchError) {
          throw fetchError;
        }

        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      }
    };

    fetchMessages();
    const refreshInterval = setInterval(fetchMessages, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoinChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsJoining(true);
    // Simulate a small delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsJoining(false);
    setUserName(userName.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userName.trim()) return;

    try {
      const messageToSend = {
        content: newMessage.trim(),
        sender_id: userId,
        sender_name: userName.trim(),
      };

      const optimisticMessage = {
        ...messageToSend,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');

      const { error: insertError } = await supabase
        .from('messages')
        .insert([messageToSend]);

      if (insertError) {
        throw insertError;
      }

      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.sender_id !== userId || msg.content !== newMessage));
      setNewMessage(newMessage);
    }
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-500 p-3 rounded-full">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Chat
            </h1>
          </div>
          
          <form onSubmit={handleJoinChat} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                What should we call you?
              </label>
              <input
                ref={nameInputRef}
                id="name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                required
                minLength={2}
                maxLength={30}
              />
            </div>
            <button
              type="submit"
              disabled={isJoining || !userName.trim()}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg font-medium transition-all duration-200
                ${isJoining ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-600 active:scale-98'}
                flex items-center justify-center gap-2`}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Chat'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <div className="bg-white shadow-sm backdrop-blur-lg bg-opacity-90 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Real-time Chat
            </h1>
          </div>
          <div className="text-sm">
            Chatting as <span className="font-semibold text-blue-600">{userName}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-shake">
            {error}
          </div>
        )}

        <div className="flex-1 bg-white rounded-2xl shadow-md p-4 mb-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Be the first to send one!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 animate-fadeIn ${
                      message.sender_id === userId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <div className="text-xs mb-1 opacity-75">
                      {message.sender_id === userId ? 'You' : message.sender_name}
                    </div>
                    <div>{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 active:scale-98"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;