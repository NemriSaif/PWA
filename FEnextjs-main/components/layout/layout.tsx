import React from 'react';
import {useLockedBody} from '../hooks/useBodyLock';
import {NavbarWrapper} from '../navbar/navbar';
import {SidebarWrapper} from '../sidebar/sidebar';
import {SidebarContext} from './layout-context';
import {WrapperLayout} from './layout.styles';
import {OfflineIndicator} from '../offline-indicator/OfflineIndicator';
import {InstallPWA} from '../install-pwa/InstallPWA';
import {ProtectedRoute} from '../ProtectedRoute';

interface Props {
   children: React.ReactNode;
}

export const Layout = ({children}: Props) => {
   const [sidebarOpen, setSidebarOpen] = React.useState(true); // Default open for desktop
   const [_, setLocked] = useLockedBody(false);
   const handleToggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
      setLocked(!sidebarOpen);
   };

   return (
      <ProtectedRoute>
         <SidebarContext.Provider
            value={{
               collapsed: sidebarOpen,
               setCollapsed: handleToggleSidebar,
            }}
         >
            <WrapperLayout>
               <SidebarWrapper />
               <NavbarWrapper>{children}</NavbarWrapper>
               <OfflineIndicator />
               <InstallPWA />
            </WrapperLayout>
         </SidebarContext.Provider>
      </ProtectedRoute>
   );
};
