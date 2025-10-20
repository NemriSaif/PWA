import { useEffect, useState } from 'react';
import { Button, Text } from '@nextui-org/react';
import { Box } from '../styles/box';

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    // Remember user dismissed (optional - store in localStorage)
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setShowInstall(false);
    }
  }, []);

  if (!showInstall) return null;

  return (
    <Box
      css={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '$6 $8',
        borderRadius: '$lg',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '$4',
        maxWidth: '90vw',
        width: '400px',
        animation: 'slideUp 0.5s ease-out',
        '@media (max-width: 768px)': {
          bottom: '10px',
          width: '95vw',
          padding: '$4 $6',
        },
        '@keyframes slideUp': {
          from: {
            transform: 'translateX(-50%) translateY(100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateX(-50%) translateY(0)',
            opacity: 1,
          },
        },
      }}
    >
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '$3',
          width: '100%',
        }}
      >
        <span style={{ fontSize: '32px' }}>📱</span>
        <Box css={{ flex: 1 }}>
          <Text
            css={{
              color: 'white',
              fontWeight: '$bold',
              fontSize: '$lg',
              marginBottom: '$1',
            }}
          >
            Install Green Management System
          </Text>
          <Text
            css={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '$sm',
            }}
          >
            Install this app on your device for quick access and offline use!
          </Text>
        </Box>
      </Box>

      <Box
        css={{
          display: 'flex',
          gap: '$3',
          width: '100%',
          '@media (max-width: 768px)': {
            flexDirection: 'column',
          },
        }}
      >
        <Button
          auto
          css={{
            flex: 1,
            background: 'white',
            color: '#667eea',
            fontWeight: '$semibold',
            '&:hover': {
              background: 'rgba(255,255,255,0.9)',
            },
          }}
          onPress={handleInstall}
        >
          ⚡ Install Now
        </Button>
        <Button
          auto
          light
          css={{
            color: 'white',
            fontWeight: '$medium',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
            },
          }}
          onPress={handleDismiss}
        >
          Maybe Later
        </Button>
      </Box>
    </Box>
  );
};
