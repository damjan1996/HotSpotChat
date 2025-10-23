'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { seedTestData } from '@/scripts/seed-data';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('Testdaten werden erstellt...');
    
    try {
      await seedTestData();
      setMessage('✅ Testdaten erfolgreich erstellt!');
    } catch (error) {
      setMessage('❌ Fehler beim Erstellen der Testdaten');
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Admin - Datenbank</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full"
            variant="primary"
          >
            {isSeeding ? 'Erstelle Testdaten...' : 'Testdaten erstellen'}
          </Button>
          
          {message && (
            <p className="text-center text-sm text-gray-600">{message}</p>
          )}
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>Diese Seite erstellt Testbenutzer für die Entwicklung.</p>
          <p className="mt-2">Testbenutzer haben alle das Passwort: <code>testpassword123</code></p>
        </div>
      </div>
    </div>
  );
}