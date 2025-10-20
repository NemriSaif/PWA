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
               <meta name="application-name" content="JninaTech" />
               <meta name="apple-mobile-web-app-capable" content="yes" />
               <meta name="apple-mobile-web-app-status-bar-style" content="default" />
               <meta name="apple-mobile-web-app-title" content="JninaTech" />
               <meta name="description" content="Professional construction management system for work sites, employees, vehicles, and inventory" />
               <meta name="format-detection" content="telephone=no" />
               <meta name="mobile-web-app-capable" content="yes" />
               <meta name="theme-color" content="#059669" />
               
               {/* Manifest */}
               <link rel="manifest" href="/manifest.json" />
               
               {/* Favicon */}
               <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
               <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
               <link rel="shortcut icon" href="/favicon.ico" />
               
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