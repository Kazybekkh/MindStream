'use client';

import { useState, useEffect } from 'react';

export default function HistoryPanel({ sessionId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchHistory();
    }
  }, [sessionId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from Envio indexer via GraphQL
      // const response = await fetch(ENVIO_GRAPHQL_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query: historyQuery })
      // });
      // const data = await response.json();
      // setHistory(data);
      
      // Mock data for now
      setHistory([]);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <h2 className="text-xl font-bold mb-4">Session History</h2>
      
      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Start a stream to begin tracking themes</p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No theme shifts recorded yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold capitalize">{item.theme}</span>
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.prompt}
              </p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Indexed by Envio • Stored on Base Sepolia
        </p>
      </div>
    </div>
  );
}
