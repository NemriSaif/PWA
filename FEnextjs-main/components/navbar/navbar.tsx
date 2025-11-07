import {Input, Link, Navbar, Text, Badge, Button} from '@nextui-org/react';
import React from 'react';
import {SearchIcon} from '../icons/searchicon';
import {LogoutIcon} from '../icons/logout-icon';
import {Box} from '../styles/box';
import {Flex} from '../styles/flex';
import {BurguerButton} from './burguer-button';
import {NotificationsDropdown} from './notifications-dropdown';
import {UserDropdown} from './user-dropdown';
import { InstallPWA } from '../install-pwa/InstallPWA';
import { useRouter } from 'next/router';

interface Props {
   children: React.ReactNode;
}

export const NavbarWrapper = ({children}: Props) => {
   const router = useRouter();

   const handleLogout = () => {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      router.push('/login');
   };

   return (
      <Box
         css={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'hidden',
         }}
      >
         <Navbar
            isBordered
            css={{
               'borderBottom': '1px solid $border',
               'justifyContent': 'space-between',
               'width': '100%',
               'background': '$background',
               'padding': '$0 $4',
               '@xs': {
                  padding: '$0 $2',
               },
               '@md': {
                  justifyContent: 'space-between',
                  padding: '$0 $8',
               },

               '& .nextui-navbar-container': {
                  'border': 'none',
                  'maxWidth': '100%',
                  'gap': '$4',
                  '@xs': {
                     gap: '$2',
                  },
                  '@md': {
                     justifyContent: 'space-between',
                     gap: '$6',
                  },
               },
            }}
         >
            {/* Mobile: Burger + Logo */}
            <Navbar.Content 
               hideIn="md" 
               css={{ 
                  gap: '$3',
                  display: 'flex',
                  '@md': {
                     display: 'none !important',
                  },
               }}
            >
               <BurguerButton />
               <Text
                  h3
                  css={{
                     fontWeight: '$bold',
                     fontSize: '$lg',
                     background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     m: 0,
                     '@xs': {
                        fontSize: '$md',
                     },
                  }}
               >
                  🌳 JninaTech
               </Text>
            </Navbar.Content>

            {/* Desktop: Burger Button */}
            <Navbar.Content 
               showIn="md"
               css={{
                  display: 'none',
                  '@md': {
                     display: 'flex !important',
                  },
               }}
            >
               <BurguerButton />
            </Navbar.Content>

            {/* Desktop: Search Bar */}
            <Navbar.Content
               showIn="md"
               css={{
                  width: '100%',
                  maxWidth: '400px',
                  display: 'none',
                  '@md': {
                     display: 'flex !important',
                  },
               }}
            >
               <Input
                  clearable
                  contentLeft={
                     <SearchIcon
                        fill="var(--nextui-colors-accents6)"
                        size={16}
                     />
                  }
                  contentLeftStyling={false}
                  css={{
                     'w': '100%',
                     'transition': 'all 0.2s ease',
                     '& .nextui-input-content--left': {
                        h: '100%',
                        ml: '$4',
                        dflex: 'center',
                     },
                  }}
                  placeholder="Search..."
               />
            </Navbar.Content>
            
            {/* Right side: Actions */}
            <Navbar.Content css={{ gap: '$2', '@xs': { gap: '$1' } }}>
               <Navbar.Content hideIn={'md'}>
                  <InstallPWA />
               </Navbar.Content>

               <Navbar.Content>
                  <NotificationsDropdown />
               </Navbar.Content>

               <Navbar.Content>
                  <UserDropdown />
               </Navbar.Content>

               <Navbar.Content>
                  <Button 
                     auto 
                     flat 
                     color="error"
                     size="sm"
                     onPress={handleLogout}
                     icon={<LogoutIcon size={18} />}
                     css={{
                        fontWeight: '$semibold',
                        '@xs': {
                           minWidth: 'auto',
                           px: '$6',
                        },
                     }}
                  >
                     Logout
                  </Button>
               </Navbar.Content>
            </Navbar.Content>
         </Navbar>
         <Box css={{
            px: '$6',
            py: '$4',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            '@xs': {
               px: '$4',
               py: '$3',
            },
         }}>
            {children}
         </Box>
      </Box>
   );
};
