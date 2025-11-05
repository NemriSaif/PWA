import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Text, Badge, Grid, Card, Table, Tooltip } from '@nextui-org/react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import { PersonnelData } from '../../pages/employees';
import { AddPersonnelModal } from './AddPersonnelModal';

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

interface EmployeesProps {
  personnel?: PersonnelData[];
  onAdd?: (data: PersonnelData) => Promise<{ success: boolean; message: string }>;
  onEdit?: (data: PersonnelData) => Promise<{ success: boolean; message: string }>;
  onDelete?: (id: string) => Promise<{ success: boolean; message: string }>;
  onTogglePayment?: (id: string, isPayed: boolean) => Promise<{ success: boolean; message: string }>;
  onRefresh?: () => void;
}

export const Employees = ({
  personnel = [],
  onAdd,
  onEdit,
  onDelete,
  onTogglePayment,
  onRefresh,
}: EmployeesProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelData | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortColumn, setSortColumn] = useState<'name' | 'role' | 'salary' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Set default view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 960) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions
  const getPaymentStatus = (isPayed: boolean) => isPayed ? 'Paid' : 'Unpaid';
  const getStatusColor = (isPayed: boolean) => isPayed ? 'success' : 'warning';

  // Calculate stats
  const stats = useMemo(() => {
    const total = personnel.length;
    const paid = personnel.filter((p) => p.isPayed).length;
    const unpaid = total - paid;
    const totalSalary = personnel.reduce((sum, p) => sum + (p.salary || 0), 0);
    return { total, paid, unpaid, totalSalary };
  }, [personnel]);

  // Filter personnel
  const filteredPersonnel = Array.isArray(personnel)
    ? personnel.filter((p) => {
        const matchesSearch =
          p.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          p.role?.toLowerCase().includes(searchValue.toLowerCase()) ||
          p.phone?.includes(searchValue) ||
          p.cin?.includes(searchValue);

        const matchesFilter =
          filterStatus === 'all' ||
          (filterStatus === 'paid' && p.isPayed) ||
          (filterStatus === 'unpaid' && !p.isPayed);

        return matchesSearch && matchesFilter;
      })
    : [];

  // Sort personnel
  const sortedPersonnel = [...filteredPersonnel].sort((a, b) => {
    let comparison = 0;
    
    switch (sortColumn) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'role':
        comparison = (a.role || '').localeCompare(b.role || '');
        break;
      case 'salary':
        comparison = (a.salary || 0) - (b.salary || 0);
        break;
      case 'status':
        comparison = (a.isPayed ? 1 : 0) - (b.isPayed ? 1 : 0);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortColumn }) => {
    if (sortColumn !== column) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    }
    return <span style={{ marginLeft: '4px' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setEditingPersonnel(null);
    setModalVisible(true);
  };

  const openEditModal = (person: PersonnelData) => {
    setEditingPersonnel(person);
    setModalVisible(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoading(true);
    if (onDelete) {
      const result = await onDelete(id);
      showNotification(result.success ? 'success' : 'error', result.message);
    }
    setLoading(false);
  };

  const handleTogglePayment = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    if (onTogglePayment) {
      const result = await onTogglePayment(id, !currentStatus);
      showNotification(result.success ? 'success' : 'error', result.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (data: PersonnelData) => {
    setLoading(true);
    let result;

    if (editingPersonnel && onEdit) {
      result = await onEdit({ ...editingPersonnel, ...data });
    } else if (onAdd) {
      result = await onAdd(data);
    }

    if (result) {
      showNotification(result.success ? 'success' : 'error', result.message);
      if (result.success) {
        setModalVisible(false);
      }
    }
    setLoading(false);
  };

  return (
    <Box css={{ px: '$6', mt: '$8', '@xsMax': { px: '$4' } }}>
      {/* Notification Toast */}
      {notification && (
        <Box
          css={{
            position: 'fixed',
            top: '$10',
            right: '$10',
            zIndex: 9999,
            p: '$8',
            borderRadius: '$lg',
            bg: notification.type === 'success' ? '$success' : '$error',
            color: 'white',
            boxShadow: '$lg',
            minWidth: '250px',
            '@xsMax': {
              top: '$4',
              right: '$4',
              left: '$4',
              minWidth: 'auto',
            },
          }}
        >
          <Text b color="white">
            {notification.message}
          </Text>
        </Box>
      )}

      {/* Statistics Cards */}
      <Grid.Container gap={2} css={{ mb: '$8' }}>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%' }}>
            <Text h4 css={{ m: 0 }}>
              {stats.total}
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Total Personnel</Text>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%', borderColor: '$success' }}>
            <Text h4 css={{ m: 0, color: '$success' }}>
              {stats.paid}
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Paid</Text>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%', borderColor: '$warning' }}>
            <Text h4 css={{ m: 0, color: '$warning' }}>
              {stats.unpaid}
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Unpaid</Text>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%', borderColor: '$primary' }}>
            <Text h4 css={{ m: 0, color: '$primary' }}>
              {stats.totalSalary.toFixed(2)} TND
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Total Salary</Text>
          </Card>
        </Grid>
      </Grid.Container>

      {/* Header */}
      <Flex justify="between" align="center" wrap="wrap" css={{ gap: '$4', mb: '$6' }}>
        <Box>
          <Text h2 css={{ fontSize: '$2xl', fontWeight: '700', mb: '$2', '@xsMax': { fontSize: '$xl' } }}>
            Employees
          </Text>
          <Text css={{ color: '$accents7', fontSize: '$sm' }}>
            Manage your workforce and payroll
          </Text>
        </Box>
        <Flex css={{ gap: '$3' }}>
          {/* View Toggle Buttons */}
          <Flex css={{ gap: '$2', mr: '$2' }}>
            <Tooltip content="Grid View">
              <Button
                auto
                light={viewMode !== 'grid'}
                color={viewMode === 'grid' ? 'success' : 'default'}
                onClick={() => setViewMode('grid')}
                css={{ minWidth: 'auto', px: '$4' }}
              >
                <GridIcon />
              </Button>
            </Tooltip>
            <Tooltip content="Table View">
              <Button
                auto
                light={viewMode !== 'table'}
                color={viewMode === 'table' ? 'success' : 'default'}
                onClick={() => setViewMode('table')}
                css={{ minWidth: 'auto', px: '$4' }}
              >
                <TableIcon />
              </Button>
            </Tooltip>
          </Flex>
          
          {onRefresh && (
            <Button auto flat onClick={onRefresh}>
              Refresh
            </Button>
          )}
          <Button auto color="success" onClick={openAddModal}>
            + Add Employee
          </Button>
        </Flex>
      </Flex>

      {/* Search & Filter */}
      <Flex css={{ gap: '$4', mb: '$6', flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          clearable
          bordered
          fullWidth
          placeholder="Search by name, role, phone, or CIN..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          css={{ maxWidth: '500px', flex: 1 }}
        />
        
        {/* Payment Status Filter */}
        <Flex css={{ gap: '$2', alignItems: 'center' }}>
          <Text css={{ fontSize: '$sm', color: '$accents7', whiteSpace: 'nowrap' }}>
            Status:
          </Text>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
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
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </Flex>

        {/* Sort Dropdown - Only show in Grid View */}
        {viewMode === 'grid' && (
          <Flex css={{ gap: '$2', alignItems: 'center' }}>
            <Text css={{ fontSize: '$sm', color: '$accents7', whiteSpace: 'nowrap' }}>
              Sort by:
            </Text>
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
              <option value="name">Name</option>
              <option value="role">Role</option>
              <option value="salary">Salary</option>
              <option value="status">Payment Status</option>
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

      {/* Table/Grid View */}
      {sortedPersonnel.length > 0 ? (
        viewMode === 'table' ? (
          <Box css={{ overflowX: 'auto' }}>
            <Table
              aria-label="Personnel table"
              css={{
                minWidth: '100%',
                '@xsMax': { fontSize: '$xs' },
              }}
              selectionMode="none"
            >
              <Table.Header>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('name')}
                  >
                    NAME
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('role')}
                  >
                    ROLE
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'role' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
                <Table.Column>PHONE</Table.Column>
                <Table.Column>CIN</Table.Column>
                <Table.Column>
                  <Flex
                    align="center"
                    css={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('salary')}
                  >
                    SALARY
                    <Box css={{ ml: '$2' }}>
                      {sortColumn === 'salary' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </Box>
                  </Flex>
                </Table.Column>
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
                {sortedPersonnel.map((person) => (
                  <Table.Row key={person._id}>
                    <Table.Cell>
                      <Text b size="$sm">
                        {person.name}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm" color="$accents8">
                        {person.role}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm">{person.phone}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="$sm">{person.cin}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text b size="$sm" color="$primary">
                        {person.salary?.toLocaleString() || '0'} TND
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusColor(person.isPayed || false)} variant="flat" size="sm">
                        {getPaymentStatus(person.isPayed || false)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex css={{ gap: '$2' }}>
                        <Tooltip content="Edit">
                          <Button
                            auto
                            light
                            size="xs"
                            onClick={() => openEditModal(person)}
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
                            onClick={() => handleDelete(person._id || '', person.name)}
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
                        <Tooltip content={person.isPayed ? 'Mark as Unpaid' : 'Mark as Paid'}>
                          <Button
                            auto
                            light
                            color={person.isPayed ? 'warning' : 'success'}
                            size="xs"
                            onClick={() => handleTogglePayment(person._id || '', person.isPayed || false)}
                            css={{ minWidth: 'auto', px: '$2' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
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
            {sortedPersonnel.map((person) => (
              <Grid xs={12} sm={6} md={4} key={person._id}>
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
                            {person.name}
                          </Text>
                          <Text size="$sm" color="$accents8" css={{ mt: '$1' }}>
                            {person.role}
                          </Text>
                        </Box>
                        <Badge color={getStatusColor(person.isPayed || false)} variant="flat">
                          {getPaymentStatus(person.isPayed || false)}
                        </Badge>
                      </Flex>

                      {/* Details */}
                      <Flex direction="column" css={{ gap: '$2' }}>
                        <Flex align="center" css={{ gap: '$2' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          <Text size="$sm">{person.phone}</Text>
                        </Flex>
                        <Flex align="center" css={{ gap: '$2' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <Text size="$sm">{person.cin}</Text>
                        </Flex>
                        <Flex align="center" css={{ gap: '$2' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          <Text b size="$sm" color="$primary">
                            {person.salary?.toLocaleString() || '0'} TND
                          </Text>
                        </Flex>
                      </Flex>

                      {/* Actions */}
                      <Flex css={{ gap: '$2', mt: '$2' }}>
                        <Button
                          auto
                          flat
                          size="sm"
                          onClick={() => openEditModal(person)}
                          css={{ flex: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          auto
                          flat
                          color="error"
                          size="sm"
                          onClick={() => handleDelete(person._id || '', person.name)}
                          css={{ flex: 1 }}
                        >
                          Delete
                        </Button>
                        <Button
                          auto
                          flat
                          color={person.isPayed ? 'warning' : 'success'}
                          size="sm"
                          onClick={() => handleTogglePayment(person._id || '', person.isPayed || false)}
                          css={{ minWidth: 'auto', px: '$3' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
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
            {searchValue ? 'No personnel found' : 'No personnel yet'}
          </Text>
          {!searchValue && (
            <Button auto color="primary" css={{ mt: '$4' }} onClick={openAddModal}>
              Add Your First Personnel
            </Button>
          )}
        </Box>
      )}

      {/* Modal */}
      {modalVisible && (
        <AddPersonnelModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          initialData={editingPersonnel || undefined}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </Box>
  );
};