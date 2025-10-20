import React from 'react';
import Document, {
   Html,
   Head,
   Main,
   NextScript,
   DocumentContext,
   DocumentInitialProps,
} from 'next/document';
import {CssBaseline} from '@nextui-org/react';

class MyDocument extends Document {
   static async getInitialProps(
      ctx: DocumentContext
   ): Promise<DocumentInitialProps> {
      const initialProps = await Document.getInitialProps(ctx);
      return {
         ...initialProps,
         styles: React.Children.toArray([initialProps.styles]),
      };
   }

   render() {
      return (
         <Html lang="en">
            <Head>
               {/* PWA Meta Tags */}
               <meta name="application-name" content="Vehicle Management System" />
               <meta name="apple-mobile-web-app-capable" content="yes" />
               <meta name="apple-mobile-web-app-status-bar-style" content="default" />
               <meta name="apple-mobile-web-app-title" content="VMS" />
               <meta name="description" content="Manage vehicles, employees, work sites, and daily assignments" />
               <meta name="format-detection" content="telephone=no" />
               <meta name="mobile-web-app-capable" content="yes" />
               <meta name="theme-color" content="#0070f3" />
               
               {/* Manifest */}
               <link rel="manifest" href="/manifest.json" />
               
               {/* Favicon */}
               <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
               <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
               <link rel="shortcut icon" href="/favicon.ico" />
               
               {/* Apple Touch Icons */}
               <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
               <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
               <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
               <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
               
               {/* Fonts */}
               <link rel="preconnect" href="https://fonts.googleapis.com" />
               <link
                  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                  rel="stylesheet"
               />
               
               {/* Viewport for better mobile experience */}
               <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
               
               {CssBaseline.flush()}
            </Head>

            <body>
               <Main />
               <NextScript />
            </body>
         </Html>
      );
   }
}

export default MyDocument;