import {Input, Link, Navbar, Text, Badge} from '@nextui-org/react';
import React from 'react';
import {SearchIcon} from '../icons/searchicon';
import {Box} from '../styles/box';
import {Flex} from '../styles/flex';
import {BurguerButton} from './burguer-button';
import {NotificationsDropdown} from './notifications-dropdown';
import {UserDropdown} from './user-dropdown';
import { InstallPWA } from '../install-pwa/InstallPWA';

interface Props {
   children: React.ReactNode;
}

export const NavbarWrapper = ({children}: Props) => {
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
               '@md': {
                  justifyContent: 'space-between',
               },

               '& .nextui-navbar-container': {
                  'border': 'none',
                  'maxWidth': '100%',
                  'gap': '$6',
                  '@md': {
                     justifyContent: 'space-between',
                  },
               },
            }}
         >
            <Navbar.Content showIn="md">
               <BurguerButton />
            </Navbar.Content>
            
            {/* Logo & Brand */}
            <Navbar.Content hideIn="md" css={{ gap: '$8' }}>
               <Text
                  h3
                  css={{
                     fontWeight: '$bold',
                     fontSize: '$xl',
                     background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     m: 0,
                  }}
               >
                  🌳 JninaTech
               </Text>
            </Navbar.Content>

            <Navbar.Content
               hideIn={'md'}
               css={{
                  width: '100%',
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
                     '@xsMax': {
                        w: '100%',
                     },
                     '& .nextui-input-content--left': {
                        h: '100%',
                        ml: '$4',
                        dflex: 'center',
                     },
                  }}
                  placeholder="Search..."
               />
            </Navbar.Content>
            
            <Navbar.Content>
               <Navbar.Content hideIn={'md'}>
                  <InstallPWA />
               </Navbar.Content>

               <Navbar.Content>
                  <NotificationsDropdown />
               </Navbar.Content>

               <Navbar.Content>
                  <UserDropdown />
               </Navbar.Content>
            </Navbar.Content>
         </Navbar>
         {children}
      </Box>
   );
};
