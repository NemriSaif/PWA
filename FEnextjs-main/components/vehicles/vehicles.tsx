import { Button, Input, Table, Text, Badge } from '@nextui-org/react';
import React, { useState } from 'react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import { VehiculeData } from '../../pages/vehicles';

interface VehiclesProps {
  vehicles: VehiculeData[];
  onEdit?: (vehicle: VehiculeData) => void;
  onDelete?: (vehicleId: string) => void;
}

export const Vehicles = ({ vehicles, onEdit, onDelete }: VehiclesProps) => {
  const [searchValue, setSearchValue] = useState('');

  const columns = [
    { name: 'ID', uid: '_id' },
    { name: 'REGISTRATION', uid: 'immatriculation' },
    { name: 'TYPE', uid: 'type' },
    { name: 'BRAND', uid: 'marque' },
    { name: 'MODEL', uid: 'modele' },
    { name: 'KILOMETRAGE', uid: 'kilometrage' },
    { name: 'CHANTIER', uid: 'chantier' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter((v) =>
    v.immatriculation.toLowerCase().includes(searchValue.toLowerCase()) ||
    (v.marque && v.marque.toLowerCase().includes(searchValue.toLowerCase())) ||
    (v.modele && v.modele.toLowerCase().includes(searchValue.toLowerCase())) ||
    (v.type && v.type.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const renderCell = (vehicle: VehiculeData, columnKey: React.Key) => {
    switch (columnKey) {
      case '_id':
        return <Text>{vehicle._id}</Text>;
      case 'immatriculation':
        return <Text b>{vehicle.immatriculation}</Text>;
      case 'type':
        return <Text>{vehicle.type}</Text>;
      case 'marque':
        return <Text>{vehicle.marque}</Text>;
      case 'modele':
        return <Text>{vehicle.modele}</Text>;
      case 'kilometrage':
        return <Text>{vehicle.kilometrage ?? '-'}</Text>;
      case 'chantier':
        return <Text>{vehicle.chantier ?? 'None'}</Text>;
      case 'status':
        const status = vehicle.chantier ? 'In Use' : 'Available';
        const statusColorMap: any = {
          Available: 'success',
          'In Use': 'primary',
          Maintenance: 'warning',
        };
        return (
          <Badge color={statusColorMap[status]} variant="flat">
            {status}
          </Badge>
        );
      case 'actions':
        return (
          <Flex justify="center" align="center">
            <Button
              size="xs"
              color="primary"
              auto
              flat
              onClick={() => onEdit && onEdit(vehicle)}
            >
              Edit
            </Button>
            <Button
              size="xs"
              color="error"
              auto
              flat
              css={{ ml: '$4' }}
              onClick={() => onDelete && onDelete(vehicle._id!)}
            >
              Delete
            </Button>
          </Flex>
        );
      default:
        return <Text>{(vehicle as any)[columnKey]}</Text>;
    }
  };

  return (
    <Box css={{ px: '$12', mt: '$8', '@xsMax': { px: '$10' } }}>
      {/* Header */}
      <Flex justify="between" align="center" wrap="wrap" css={{ gap: '$8', mb: '$8' }}>
        <Text h3>Vehicles Management</Text>
      </Flex>

      {/* Search Bar */}
      <Flex css={{ gap: '$8', mb: '$6' }} align="center" wrap="wrap">
        <Input
          clearable
          placeholder="Search vehicles..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          css={{ flex: 1, minWidth: '280px' }}
        />
      </Flex>

      {/* Table */}
      <Table
        aria-label="Vehicles table"
        css={{ height: 'auto', minWidth: '100%' }}
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
        <Table.Body items={filteredVehicles}>
          {(item) => (
            <Table.Row key={item._id}>
              {(columnKey) => <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Box>
  );
};
