import React from 'react';
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

// Icon mappings
const WorkSiteIcon = AccountsIcon;
const EmployeeIcon = CustomersIcon;
const VehicleIcon = ProductsIcon;
const FuelIcon = AccountsIcon;
const AssignmentIcon = ReportsIcon;

export const SidebarWrapper = () => {
   const router = useRouter();
   const {collapsed, setCollapsed} = useSidebarContext();

   return (
      <Box
         as="aside"
         css={{
            height: '100vh',
            zIndex: 202,
            position: 'sticky',
            top: '0',
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
                     title="Home"
                     icon={<HomeIcon />}
                     isActive={router.pathname === '/'}
                     href="/"
                  />
                  <SidebarMenu title="Main Menu">
                     <SidebarItem
                        isActive={router.pathname === '/work-sites'}
                        title="Work Sites"
                        icon={<WorkSiteIcon />}
                        href="/work-sites"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/employees'}
                        title="Employees"
                        icon={<EmployeeIcon />}
                        href="/employees"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/vehicles'}
                        title="Vehicles"
                        icon={<VehicleIcon />}
                        href="/vehicles"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/fuel-costs'}
                        title="Fuel Costs"
                        icon={<FuelIcon />}
                        href="/fuel-costs"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/daily-assignments'}
                        title="Daily Assignments"
                        icon={<AssignmentIcon />}
                        href="/daily-assignments"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/suppliers'}
                        title="Suppliers"
                        icon={<CustomersIcon />}
                        href="/suppliers"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/stock'}
                        title="Stock"
                        icon={<ProductsIcon />}
                        href="/stock"
                     />
                  </SidebarMenu>
               </Sidebar.Body>
            </Flex>
         </Sidebar>
      </Box>
   );
};