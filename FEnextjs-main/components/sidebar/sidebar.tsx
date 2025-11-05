import React, { useState, useEffect } from 'react';
import {Box} from '../styles/box';
import {Sidebar} from './sidebar.styles';
import {Avatar, Tooltip, Text} from '@nextui-org/react';
import {Flex} from '../styles/flex';
import {HomeIcon} from '../icons/sidebar/home-icon';
import {AccountsIcon} from '../icons/sidebar/accounts-icon';
import {CustomersIcon} from '../icons/sidebar/customers-icon';
import {ProductsIcon} from '../icons/sidebar/products-icon';
import {ReportsIcon} from '../icons/sidebar/reports-icon';
import {SettingsIcon} from '../icons/sidebar/settings-icon';
import {SidebarItem} from './sidebar-item';
import {SidebarMenu} from './sidebar-menu';
import {FilterIcon} from '../icons/sidebar/filter-icon';
import {useSidebarContext} from '../layout/layout-context';
import {useRouter} from 'next/router';
import { getUserRole } from '../../utils/auth';

// Icon mappings
const WorkSiteIcon = AccountsIcon;
const EmployeeIcon = CustomersIcon;
const VehicleIcon = ProductsIcon;
const FuelIcon = AccountsIcon;
const AssignmentIcon = ReportsIcon;

export const SidebarWrapper = () => {
   const router = useRouter();
   const {collapsed, setCollapsed} = useSidebarContext();
   const [userRole, setUserRole] = useState<string | null>(getUserRole());

   // Get user role and update when it changes (storage events across tabs and route changes)
   useEffect(() => {
      const updateRole = () => {
         // Debug: Check what's in localStorage
         const userStr = localStorage.getItem('user');
         console.log('Sidebar: localStorage user =', userStr);
         
         const role = getUserRole();
         console.log('Sidebar: User role detected/updated:', role);
         setUserRole(role);
      };

      // Initial read
      updateRole();

      // Listen for storage changes from other tabs/windows
      const handleStorageChange = () => {
         updateRole();
      };
      window.addEventListener('storage', handleStorageChange);

      // Also update role on route changes (useful after login redirect in same tab)
      const handleRouteChange = () => {
         updateRole();
      };
      router.events.on('routeChangeComplete', handleRouteChange);

      return () => {
         window.removeEventListener('storage', handleStorageChange);
         router.events.off('routeChangeComplete', handleRouteChange);
      };
   }, [router.events]);

   // Define menu items based on role
   const getMenuItems = () => {
      const commonItems = [
         {
            title: 'Dashboard',
            icon: <HomeIcon />,
            href: '/dashboard',
            roles: ['manager', 'fournisseur', 'personnel']
         }
      ];

      const managerItems = [
         { title: 'Work Sites', icon: <WorkSiteIcon />, href: '/work-sites', roles: ['manager'] },
         { title: 'Employees', icon: <EmployeeIcon />, href: '/employees', roles: ['manager'] },
         { title: 'Vehicles', icon: <VehicleIcon />, href: '/vehicles', roles: ['manager'] },
         { title: 'Fuel Costs', icon: <FuelIcon />, href: '/fuel-costs', roles: ['manager'] },
         { title: 'Daily Assignments', icon: <AssignmentIcon />, href: '/daily-assignments', roles: ['manager'] },
         { title: 'Suppliers', icon: <CustomersIcon />, href: '/suppliers', roles: ['manager'] },
         { title: 'Stock', icon: <ProductsIcon />, href: '/stock', roles: ['manager'] },
         { title: 'Orders', icon: <ReportsIcon />, href: '/orders', roles: ['manager'] },
      ];

      const supplierItems = [
         { title: 'My Stock', icon: <ProductsIcon />, href: '/stock', roles: ['fournisseur'] },
         { title: 'Orders', icon: <ReportsIcon />, href: '/orders', roles: ['fournisseur'] },
      ];

      const personnelItems = [
         { title: 'My Work Sites', icon: <WorkSiteIcon />, href: '/work-sites', roles: ['personnel'] },
         { title: 'My Assignments', icon: <AssignmentIcon />, href: '/daily-assignments', roles: ['personnel'] },
      ];

      if (userRole === 'manager') {
         return [...commonItems, ...managerItems];
      } else if (userRole === 'fournisseur') {
         return [...commonItems, ...supplierItems];
      } else if (userRole === 'personnel') {
         return [...commonItems, ...personnelItems];
      }

      return commonItems;
   };

   const menuItems = getMenuItems();
   
   console.log('========== SIDEBAR DEBUG ==========');
   console.log('Sidebar: userRole =', userRole);
   console.log('Sidebar: menuItems.length =', menuItems.length);
   console.log('Sidebar: menuItems =', menuItems.map(i => i.title));
   console.log('Sidebar: Will show menu?', userRole && menuItems.length > 1);
   console.log('===================================');

   return (
      <Box
         as="aside"
         css={{
            height: '0',
            width: '0',
            overflow: 'visible',
            zIndex: 202,
            '@md': {
               height: '100vh',
               width: 'auto',
               position: 'sticky',
               top: '0',
            },
         }}
      >
         {collapsed ? <Sidebar.Overlay onClick={setCollapsed} /> : null}

         <Sidebar collapsed={collapsed}>
            <Sidebar.Header>
               <Flex align="center" css={{ gap: '$6', px: '$6', py: '$4' }}>
                  <Box
                     css={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '$lg',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '$2xl',
                     }}
                  >
                     🌳
                  </Box>
                  <Text
                     css={{
                        fontWeight: '$bold',
                        fontSize: '$lg',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                     }}
                  >
                     JninaTech
                  </Text>
               </Flex>
            </Sidebar.Header>
            <Flex
               direction={'column'}
               justify={'between'}
               css={{height: '100%'}}
            >
               <Sidebar.Body className="body sidebar">
                  <SidebarItem
                     title="Dashboard"
                     icon={<HomeIcon />}
                     isActive={router.pathname === '/dashboard'}
                     href="/dashboard"
                  />
                  {userRole && menuItems.length > 1 && (
                     <SidebarMenu title={userRole === 'manager' ? 'Management' : userRole === 'fournisseur' ? 'Supplier Portal' : 'My Work'}>
                        {menuItems.slice(1).map((item) => (
                           <SidebarItem
                              key={item.href}
                              isActive={router.pathname === item.href}
                              title={item.title}
                              icon={item.icon}
                              href={item.href}
                           />
                        ))}
                     </SidebarMenu>
                  )}
               </Sidebar.Body>
            </Flex>
         </Sidebar>
      </Box>
   );
};