import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {createTheme, NextUIProvider} from '@nextui-org/react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import {Layout} from '../components/layout/layout';
import QueueIndicator from '../components/offline-queue/QueueIndicator';
import { useEffect } from 'react';

const lightTheme = createTheme({
   type: 'light',
   theme: {
      colors: {},
   },
});

const darkTheme = createTheme({
   type: 'dark',
   theme: {
      colors: {},
   },
});

function MyApp({Component, pageProps}: AppProps) {
   useEffect(() => {
      // Initialize SIMPLE sync engine (auto-sync on online event)
      if (typeof window !== 'undefined') {
         // Use the ultra-simple version to avoid _ is not defined error
         import('../utils/simpleSyncEngine');
      }
   }, []);

   return (
      <NextThemesProvider
         defaultTheme="system"
         attribute="class"
         value={{
            light: lightTheme.className,
            dark: darkTheme.className,
         }}
      >
         <NextUIProvider>
            <Layout>
               <Component {...pageProps} />
               <QueueIndicator />
            </Layout>
         </NextUIProvider>
      </NextThemesProvider>
   );
}

export default MyApp;
