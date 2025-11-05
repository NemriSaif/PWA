import { useEffect, useState } from 'react';
import { Badge, Text } from '@nextui-org/react';
import { Box } from '../styles/box';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showMessage && isOnline) return null;

  return (
    <Box
      css={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        background: isOnline ? '$success' : '$error',
        color: 'white',
        padding: '$4 $8',
        borderRadius: '$md',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '$2',
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          from: {
            transform: 'translateX(100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateX(0)',
            opacity: 1,
          },
        },
      }}
    >
      <span style={{ fontSize: '20px' }}>{isOnline ? '●' : '○'}</span>
      <Text
        css={{
          color: 'white',
          fontWeight: '$semibold',
          fontSize: '$sm',
        }}
      >
        {isOnline ? 'Back Online!' : 'Offline Mode - Limited Functionality'}
      </Text>
    </Box>
  );
};
