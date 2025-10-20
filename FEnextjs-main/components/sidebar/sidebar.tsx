import React from 'react';
import {Box} from '../styles/box';
import {Sidebar} from './sidebar.styles';
import {Avatar, Tooltip} from '@nextui-org/react';
import {Flex} from '../styles/flex';
import {CompaniesDropdown} from './companies-dropdown';
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

// You'll need to create these icons or use existing ones
// For now, I'm using similar icons from your existing set
const WorkSiteIcon = AccountsIcon; // Replace with custom icon
const EmployeeIcon = CustomersIcon; // Replace with custom icon
const VehicleIcon = ProductsIcon; // Replace with custom icon
const FuelIcon = AccountsIcon; // Replace with custom icon
const AssignmentIcon = ReportsIcon; // Replace with custom icon

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
               <CompaniesDropdown />
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
                        isActive={router.pathname === '/reports'}
                        title="Monthly Reports"
                        icon={<ReportsIcon />}
                        href="/reports"
                     />
                  </SidebarMenu>

                  <SidebarMenu title="General">
                     <SidebarItem
                        isActive={router.pathname === '/settings'}
                        title="Settings"
                        icon={<SettingsIcon />}
                        href="/settings"
                     />
                  </SidebarMenu>
               </Sidebar.Body>
               <Sidebar.Footer>
                  <Tooltip content={'Settings'} rounded color="primary">
                     <SettingsIcon />
                  </Tooltip>
                  <Tooltip content={'Adjustments'} rounded color="primary">
                     <FilterIcon />
                  </Tooltip>
                  <Tooltip content={'Profile'} rounded color="primary">
                     <Avatar
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                        size={'sm'}
                     />
                  </Tooltip>
               </Sidebar.Footer>
            </Flex>
         </Sidebar>
      </Box>
   );
};