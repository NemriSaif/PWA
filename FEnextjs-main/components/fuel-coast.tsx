import {Button, Input, Table, Text, Badge} from '@nextui-org/react';
import React, {useState} from 'react';
import {Flex} from './styles/flex';
import {Box} from './styles/box';

export const FuelCosts = () => {
   const [searchValue, setSearchValue] = useState('');

   // Mock data
   const fuelCosts = [
      {id: 1, vehicle: 'TUN-1234', date: '2024-01-15', quantity: 50, price: 75.5, total: 3775, workSite: 'Construction Site A'},
      {id: 2, vehicle: 'TUN-5678', date: '2024-01-15', quantity: 40, price: 75.5, total: 3020, workSite: 'Building Project B'},
      {id: 3, vehicle: 'TUN-9012', date: '2024-01-14', quantity: 80, price: 75.5, total: 6040, workSite: 'Road Work C'},
      {id: 4, vehicle: 'TUN-1234', date: '2024-01-14', quantity: 55, price: 75.5, total: 4152.5, workSite: 'Construction Site A'},
   ];

   const columns = [
      {name: 'ID', uid: 'id'},
      {name: 'VEHICLE', uid: 'vehicle'},
      {name: 'DATE', uid: 'date'},
      {name: 'QUANTITY (L)', uid: 'quantity'},
      {name: 'PRICE/L (TND)', uid: 'price'},
      {name: 'TOTAL (TND)', uid: 'total'},
      {name: 'WORK SITE', uid: 'workSite'},
      {name: 'ACTIONS', uid: 'actions'},
   ];

   const renderCell = (fuelCost: any, columnKey: React.Key) => {
      switch (columnKey) {
         case 'id':
            return <Text>{fuelCost.id}</Text>;
         case 'vehicle':
            return <Text b>{fuelCost.vehicle}</Text>;
         case 'date':
            return <Text>{fuelCost.date}</Text>;
         case 'quantity':
            return <Text>{fuelCost.quantity}</Text>;
         case 'price':
            return <Text>{fuelCost.price.toFixed(2)}</Text>;
         case 'total':
            return (
               <Text b color="success">
                  {fuelCost.total.toFixed(2)} TND
               </Text>
            );
         case 'workSite':
            return <Text css={{fontSize: '$sm'}}>{fuelCost.workSite}</Text>;
         case 'actions':
            return (
               <Flex justify="center" align="center">
                  <Button size="xs" color="primary" auto flat>
                     Edit
                  </Button>
                  <Button size="xs" color="error" auto flat css={{ml: '$4'}}>
                     Delete
                  </Button>
               </Flex>
            );
         default:
            return <Text>{fuelCost[columnKey]}</Text>;
      }
   };

   // Calculate total
   const totalCost = fuelCosts.reduce((sum, item) => sum + item.total, 0);

   return (
      <Box css={{px: '$12', mt: '$8', '@xsMax': {px: '$10'}}}>
         {/* Header */}
         <Flex
            justify="between"
            align="center"
            wrap="wrap"
            css={{
               gap: '$8',
               mb: '$8',
            }}
         >
            <Text h3>Fuel Costs Management</Text>
            <Button auto color="primary">
               Add Fuel Entry
            </Button>
         </Flex>

         {/* Summary Card */}
         <Flex css={{gap: '$8', mb: '$6'}} wrap="wrap">
            <Box
               css={{
                  p: '$10',
                  bg: '$blue200',
                  borderRadius: '$lg',
                  minWidth: '200px',
               }}
            >
               <Text css={{fontSize: '$sm', color: '$blue800'}}>Total Fuel Cost</Text>
               <Text h3 css={{color: '$blue900', mt: '$2'}}>
                  {totalCost.toFixed(2)} TND
               </Text>
            </Box>
            <Box
               css={{
                  p: '$10',
                  bg: '$green200',
                  borderRadius: '$lg',
                  minWidth: '200px',
               }}
            >
               <Text css={{fontSize: '$sm', color: '$green800'}}>Total Quantity</Text>
               <Text h3 css={{color: '$green900', mt: '$2'}}>
                  {fuelCosts.reduce((sum, item) => sum + item.quantity, 0)} L
               </Text>
            </Box>
         </Flex>

         {/* Search Bar */}
         <Flex
            css={{gap: '$8', mb: '$6'}}
            align="center"
            wrap="wrap"
         >
            <Input
               clearable
               placeholder="Search fuel entries..."
               value={searchValue}
               onChange={(e) => setSearchValue(e.target.value)}
               css={{flex: 1, minWidth: '280px'}}
            />
            <Input
               type="date"
               label="Filter by date"
               css={{minWidth: '200px'}}
            />
         </Flex>

         {/* Table */}
         <Table
            aria-label="Fuel costs table"
            css={{
               height: 'auto',
               minWidth: '100%',
            }}
            selectionMode="none"
         >
            <Table.Header columns={columns}>
               {(column) => (
                  <Table.Column
                     key={column.uid}
                     hideHeader={column.uid === 'actions'}
                     align={column.uid === 'actions' ? 'center' : 'start'}
                  >
                     {column.name}
                  </Table.Column>
               )}
            </Table.Header>
            <Table.Body items={fuelCosts}>
               {(item) => (
                  <Table.Row key={item.id}>
                     {(columnKey) => (
                        <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                     )}
                  </Table.Row>
               )}
            </Table.Body>
         </Table>
      </Box>
   );
};