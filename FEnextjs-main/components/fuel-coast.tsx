import {Button, Input, Table, Text, Badge} from '@nextui-org/react';
import React, {useState} from 'react';
import {Flex} from './styles/flex';
import {Box} from './styles/box';

interface FuelCostEntry {
   id: string;
   assignmentId: string;
   date: string;
   chantier: string;
   description: string;
   amount: number;
   paymentMethod: string;
   notes: string;
}

interface FuelCostsProps {
   fuelCosts: FuelCostEntry[];
   onRefresh: () => void;
}

export const FuelCosts = ({ fuelCosts, onRefresh }: FuelCostsProps) => {
   const [searchValue, setSearchValue] = useState('');

   const columns = [
      {name: 'DATE', uid: 'date'},
      {name: 'WORK SITE', uid: 'chantier'},
      {name: 'DESCRIPTION', uid: 'description'},
      {name: 'AMOUNT (TND)', uid: 'amount'},
      {name: 'PAYMENT', uid: 'paymentMethod'},
      {name: 'NOTES', uid: 'notes'},
   ];

   const renderCell = (fuelCost: FuelCostEntry, columnKey: React.Key) => {
      switch (columnKey) {
         case 'date':
            return <Text>{new Date(fuelCost.date).toLocaleDateString()}</Text>;
         case 'chantier':
            return <Text b>{fuelCost.chantier}</Text>;
         case 'description':
            return <Text>{fuelCost.description}</Text>;
         case 'amount':
            return (
               <Text b color="success">
                  {fuelCost.amount.toFixed(2)} TND
               </Text>
            );
         case 'paymentMethod':
            return (
               <Badge color={fuelCost.paymentMethod === 'cash' ? 'success' : 'primary'}>
                  {fuelCost.paymentMethod}
               </Badge>
            );
         case 'notes':
            return <Text css={{fontSize: '$sm'}}>{fuelCost.notes || '-'}</Text>;
         default:
            return <Text>{fuelCost[columnKey as keyof FuelCostEntry]}</Text>;
      }
   };

   // Filter fuel costs based on search
   const filteredFuelCosts = fuelCosts.filter(fc => 
      fc.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      fc.chantier.toLowerCase().includes(searchValue.toLowerCase())
   );

   // Calculate total
   const totalCost = fuelCosts.reduce((sum, item) => sum + item.amount, 0);
   const totalEntries = fuelCosts.length;

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
            <Text h3>Fuel Costs Overview</Text>
            <Flex css={{gap: '$6'}}>
               <Button auto color="primary" flat onClick={onRefresh}>
                  Refresh
               </Button>
            </Flex>
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
               <Text css={{fontSize: '$sm', color: '$green800'}}>Total Entries</Text>
               <Text h3 css={{color: '$green900', mt: '$2'}}>
                  {totalEntries}
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
               placeholder="Search by description or work site..."
               value={searchValue}
               onChange={(e) => setSearchValue(e.target.value)}
               css={{flex: 1, minWidth: '280px'}}
            />
         </Flex>

         {/* Table */}
         {filteredFuelCosts.length === 0 ? (
            <Box css={{textAlign: 'center', py: '$20'}}>
               <Text h4 color="$gray600">
                  {fuelCosts.length === 0 
                     ? 'No fuel costs recorded yet. Add fuel costs through Daily Assignments.' 
                     : 'No matching fuel costs found.'}
               </Text>
            </Box>
         ) : (
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
                        align="start"
                     >
                        {column.name}
                     </Table.Column>
                  )}
               </Table.Header>
               <Table.Body items={filteredFuelCosts}>
                  {(item) => (
                     <Table.Row key={item.id}>
                        {(columnKey) => (
                           <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                        )}
                     </Table.Row>
                  )}
               </Table.Body>
            </Table>
         )}
      </Box>
   );
};