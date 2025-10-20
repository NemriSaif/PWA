// Queue Indicator Component
// Shows pending operations count and sync status

import React, { useState, useEffect } from 'react';
import { Badge, Text } from '@nextui-org/react';
import { getQueueCount } from '../../utils/offlineQueue';

export const QueueIndicator: React.FC = () => {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const updateQueueCount = async () => {
    const count = await getQueueCount();
    setQueueCount(count);
  };

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    updateQueueCount();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Queue count will update after sync
      setTimeout(updateQueueCount, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update queue count every 5 seconds
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (queueCount === 0) {
    return null; // Don't show if no pending operations
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '12px 20px',
      backgroundColor: isOnline ? '#10b981' : '#f59e0b',
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      fontWeight: '500',
    }}>
      <Badge color={isOnline ? "success" : "warning"} variant="flat">
        {queueCount}
      </Badge>
      <Text css={{ color: 'white', fontSize: '$sm', fontWeight: '$medium' }}>
        {isOnline 
          ? `Syncing ${queueCount} pending operation${queueCount > 1 ? 's' : ''}...`
          : `${queueCount} operation${queueCount > 1 ? 's' : ''} queued (offline)`
        }
      </Text>
    </div>
  );
};

export default QueueIndicator;
