import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Layout } from '../components/layout/layout';
import QueueIndicator from '../components/offline-queue/QueueIndicator';
import { useEffect } from 'react';
import { useRouter } from 'next/router'; // ✅ add this

const lightTheme = createTheme({ type: 'light', theme: { colors: {} } });
const darkTheme  = createTheme({ type: 'dark',  theme: { colors: {} } });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter(); // ✅
  const noLayoutRoutes = ['/login','/register']; // add others if needed: '/register', '/forgot-password'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../utils/simpleSyncEngine');
    }
  }, []);

  const content = (
    <>
      <Component {...pageProps} />
      <QueueIndicator />
    </>
  );

  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{ light: lightTheme.className, dark: darkTheme.className }}
    >
      <NextUIProvider>
        {noLayoutRoutes.includes(router.pathname)
          ? content // 👈 no Layout on /login
          : <Layout>{content}</Layout>}
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default MyApp;