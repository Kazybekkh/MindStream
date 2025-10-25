'use client';

import { useState, useEffect } from 'react';
import WebcamStream from '@/components/WebcamStream';
import ThemeDisplay from '@/components/ThemeDisplay';
import HistoryPanel from '@/components/HistoryPanel';
import { useSocket } from '@/lib/useSocket';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('theme-update', (data) => {
      setCurrentTheme(data);
    });

    socket.on('session-started', (data) => {
      setSessionId(data.sessionId);
    });

    return () => {
      socket.off('theme-update');
      socket.off('session-started');
    };
  }, [socket]);

  const handleStartStream = () => {
    if (socket && connected) {
      socket.emit('start-stream', { timestamp: Date.now() });
      setIsStreaming(true);
    }
  };

  const handleStopStream = () => {
    if (socket) {
      socket.emit('stop-stream');
      setIsStreaming(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🌊 Mindstream</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-Generated Visual Narrative from Your Speech
          </p>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main video area */}
          <div className="lg:col-span-2">
            <WebcamStream 
              isStreaming={isStreaming}
              onStart={handleStartStream}
              onStop={handleStopStream}
            />
            
            {currentTheme && (
              <ThemeDisplay theme={currentTheme} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HistoryPanel sessionId={sessionId} />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Built with Livepeer Daydream • Envio HyperIndex • Base Sepolia</p>
        </footer>
      </div>
    </main>
  );
}
