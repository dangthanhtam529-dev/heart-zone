import React, { useEffect, useState } from 'react';
import { useMoodStore } from './context/MoodContext';

export const Debug: React.FC = () => {
  const { moods } = useMoodStore();
  const [localStorageData, setLocalStorageData] = useState<any[]>([]);

  useEffect(() => {
    const rawData = localStorage.getItem('heartspace_moods_db');
    if (rawData) {
      try {
        setLocalStorageData(JSON.parse(rawData));
      } catch (e) {
        console.error('Failed to parse localStorage data', e);
      }
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">Debug Information</h2>
      
      <div className="mb-4">
        <h3 className="font-bold">Moods from Context:</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(moods, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3 className="font-bold">Raw localStorage Data:</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>
    </div>
  );
};