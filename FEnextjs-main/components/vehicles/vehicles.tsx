import { Button, Input, Table, Text, Badge, Grid, Card, Tooltip } from '@nextui-org/react';
import React, { useState, useMemo } from 'react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import { VehiculeData } from '../../pages/vehicles';

// View toggle icons
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
  </svg>
);

const TableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4zm0 6h18v2H3v-2z"/>
  </svg>
);

interface VehiclesProps {
  vehicles: VehiculeData[];
  onEdit?: (vehicle: VehiculeData) => void;
  onDelete?: (vehicleId: string) => void;
}

export const Vehicles = ({ vehicles, onEdit, onDelete }: VehiclesProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortColumn, setSortColumn] = useState<'immatriculation' | 'type' | 'marque' | 'kilometrage' | 'status'>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Helper functions
  const getStatus = (vehicle: VehiculeData) => vehicle.chantier ? 'In Use' : 'Available';
  
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, 'success' | 'primary' | 'warning' | 'error'> = {
      'Available': 'success',
      'In Use': 'primary',
      'Maintenance': 'warning',
    };
    return colorMap[status] || 'default' as any;
  };

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter((v) =>
    v.immatriculation.toLowerCase().includes(searchValue.toLowerCase()) ||
    (v.marque && v.marque.toLowerCase().includes(searchValue.toLowerCase())) ||
    (v.modele && v.modele.toLowerCase().includes(searchValue.toLowerCase())) ||
    (v.type && v.type.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Sort vehicles
  const sortedVehicles = useMemo(() => {
    const sorted = [...filteredVehicles].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'immatriculation':
          comparison = a.immatriculation.localeCompare(b.immatriculation);
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'marque':
          comparison = (a.marque || '').localeCompare(b.marque || '');
          break;
        case 'kilometrage':
          comparison = (a.kilometrage || 0) - (b.kilometrage || 0);
          break;
        case 'status':
          const statusA = getStatus(a);
          const statusB = getStatus(b);
          // Available first, then In Use
          const statusOrder: Record<string, number> = { 'Available': 1, 'In Use': 2, 'Maintenance': 3 };
          comparison = (statusOrder[statusA] || 999) - (statusOrder[statusB] || 999);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredVehicles, sortColumn, sortDirection]);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <Box css={{ 
      px: '$12', 
      mt: '$8',
      pb: '$10',
      '@xs': { px: '$4', mt: '$4' },
      '@sm': { px: '$6', mt: '$6' },
      '@md': { px: '$8' },
    }}>
      {/* Header */}
      <Flex justify="between" align="center" wrap="wrap" css={{ gap: '$4', mb: '$8', '@xs': { gap: '$4', mb: '$6' } }}>
        <Box>
          <Text h2 css={{ 
            fontSize: '$2xl',
            fontWeight: '700',
            '@xs': { fontSize: '$lg' },
            '@sm': { fontSize: '$xl' },
          }}>
            Vehicles Management
          </Text>
        </Box>
        <Flex css={{ gap: '$3' }}>
          {/* View Toggle */}
          <Flex css={{ gap: '$2' }}>
            <Tooltip content="Grid View">
              <Button
                auto
                light
                size="sm"
                onClick={() => setViewMode('grid')}
                css={{ opacity: viewMode === 'grid' ? 1 : 0.5 }}
              >
                <GridIcon />
              </Button>
            </Tooltip>
            <Tooltip content="Table View">
              <Button
                auto
                light
                size="sm"
                onClick={() => setViewMode('table')}
                css={{ opacity: viewMode === 'table' ? 1 : 0.5 }}
              >
                <TableIcon />
              </Button>
            </Tooltip>
          </Flex>

          {/* Grid Sort Controls */}
          {viewMode === 'grid' && (
            <Flex css={{ gap: '$2', alignItems: 'center' }}>
              <select
                value={sortColumn}
                onChange={(e) => {
                  setSortColumn(e.target.value as typeof sortColumn);
                  setSortDirection('asc');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--nextui-colors-border)',
                  background: 'var(--nextui-colors-background)',
                  color: 'var(--nextui-colors-text)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="immatriculation">Registration</option>
                <option value="type">Type</option>
                <option value="marque">Brand</option>
                <option value="kilometrage">Kilometrage</option>
                <option value="status">Status</option>
              </select>
              <Button
                auto
                light
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                css={{ minWidth: 'auto', px: '$3' }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Search Bar */}
      <Flex css={{ gap: '$8', mb: '$6', '@xs': { gap: '$4', mb: '$4' } }} align="center" wrap="wrap">
        <Input
          clearable
          placeholder="Search vehicles..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          css={{ 
            flex: 1, 
            minWidth: '280px',
            '@xs': { minWidth: 'auto', width: '100%' },
          }}
        />
      </Flex>

      {/* Table/Grid View */}
      {sortedVehicles.length > 0 ? (
        viewMode === 'table' ? (
          <Box css={{ 
            overflowX: 'auto',
            '@xs': {
              mx: '-$4',
              px: '$4',
            },
          }}>
            <Table
              aria-label="Vehicles table"
              css={{ 
                height: 'auto', 
                minWidth: '100%',
                '@xs': {
                  fontSize: '$xs',
                  minWidth: '800px',
                },
              }}
              selectionMode="none"
            >
              <Table.Header>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('immatriculation')}
                  >
                    REGISTRATION
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'immatriculation' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('type')}
                  >
                    TYPE
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'type' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('marque')}
                  >
                    BRAND
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'marque' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>MODEL</Table.Column>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('kilometrage')}
                  >
                    KILOMETRAGE
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'kilometrage' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>CHANTIER</Table.Column>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('status')}
                  >
                    STATUS
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>ACTIONS</Table.Column>
              </Table.Header>
              <Table.Body>
                {sortedVehicles.map((vehicle) => (
                  <Table.Row key={vehicle._id}>
                    <Table.Cell>
                      <Text b size="$sm">{vehicle.immatriculation}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm">{vehicle.type || '-'}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm">{vehicle.marque || '-'}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm" color="$accents8">{vehicle.modele || '-'}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm">{vehicle.kilometrage?.toLocaleString() || '-'} km</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm">{vehicle.chantier || 'None'}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusColor(getStatus(vehicle))} variant="flat" size="sm">
                        {getStatus(vehicle)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex css={{ gap: '$2' }}>
                        <Tooltip content="Edit">
                          <Button
                            auto
                            light
                            size="xs"
                            onClick={() => onEdit && onEdit(vehicle)}
                            css={{ minWidth: 'auto', px: '$2' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button
                            auto
                            light
                            color="error"
                            size="xs"
                            onClick={() => onDelete && onDelete(vehicle._id!)}
                            css={{ minWidth: 'auto', px: '$2' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </Button>
                        </Tooltip>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Box>
        ) : (
          <Grid.Container gap={2} css={{ mt: '$4' }}>
            {sortedVehicles.map((vehicle) => (
              <Grid xs={12} sm={6} md={4} key={vehicle._id}>
                <Card
                  variant="bordered"
                  css={{
                    p: '$6',
                    width: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '$lg',
                    },
                  }}
                >
                  <Card.Body css={{ padding: 0 }}>
                    <Flex direction="column" css={{ gap: '$4' }}>
                      {/* Header */}
                      <Flex justify="between" align="start">
                        <Box css={{ flex: 1 }}>
                          <Text b size="$lg">
                            {vehicle.immatriculation}
                          </Text>
                          <Text size="$sm" color="$accents8" css={{ mt: '$1' }}>
                            {vehicle.marque} {vehicle.modele}
                          </Text>
                        </Box>
                        <Badge color={getStatusColor(getStatus(vehicle))} variant="flat">
                          {getStatus(vehicle)}
                        </Badge>
                      </Flex>

                      {/* Details */}
                      <Flex direction="column" css={{ gap: '$2' }}>
                        <Flex align="center" css={{ gap: '$2' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 11V6a2 2 0 0 0-2-2H2v16h2a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h2v-5l-4-4z"/>
                            <circle cx="7" cy="17" r="2"/>
                            <circle cx="17" cy="17" r="2"/>
                          </svg>
                          <Text size="$sm">{vehicle.type || 'N/A'}</Text>
                        </Flex>
                        <Flex align="center" css={{ gap: '$2' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                          <Text b size="$sm" color="$primary">
                            {vehicle.kilometrage?.toLocaleString() || '0'} km
                          </Text>
                        </Flex>
                        <Flex align="center" css={{ gap: '$2' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                          </svg>
                          <Text size="$sm">{vehicle.chantier || 'Not Assigned'}</Text>
                        </Flex>
                      </Flex>

                      {/* Actions */}
                      <Flex css={{ gap: '$2', mt: '$2' }}>
                        <Button
                          auto
                          flat
                          size="sm"
                          onClick={() => onEdit && onEdit(vehicle)}
                          css={{ flex: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          auto
                          flat
                          color="error"
                          size="sm"
                          onClick={() => onDelete && onDelete(vehicle._id!)}
                          css={{ flex: 1 }}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Flex>
                  </Card.Body>
                </Card>
              </Grid>
            ))}
          </Grid.Container>
        )
      ) : (
        <Box css={{ textAlign: 'center', py: '$20' }}>
          <Text h4 color="$accents7">
            {searchValue ? 'No vehicles found' : 'No vehicles yet'}
          </Text>
        </Box>
      )}
    </Box>
  );
};
