import React, { useState, useMemo } from 'react';
import { Button, Input, Table, Text, Badge, Grid, Card, Tooltip, Dropdown } from '@nextui-org/react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import { PersonnelData } from '../../pages/employees';
import { AddPersonnelModal } from './AddPersonnelModal';

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

  const stats = useMemo(() => {
    const total = personnel.length;
    const paid = personnel.filter((p) => p.isPayed).length;
    const unpaid = total - paid;
    const totalSalary = personnel.reduce((sum, p) => sum + (p.salary || 0), 0);

    return { total, paid, unpaid, totalSalary };
  }, [personnel]);

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

  const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'ROLE', uid: 'role' },
    { name: 'PHONE', uid: 'phone' },
    { name: 'CIN', uid: 'cin' },
    { name: 'SALARY', uid: 'salary' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  const renderCell = (person: PersonnelData, columnKey: React.Key) => {
    switch (columnKey) {
      case 'name':
        return <Text b>{person.name}</Text>;
      case 'role':
        return <Text>{person.role || '-'}</Text>;
      case 'phone':
        return <Text css={{ fontSize: '$sm' }}>{person.phone || '-'}</Text>;
      case 'cin':
        return (
          <Text css={{ fontSize: '$sm', fontFamily: 'monospace' }}>
            {person.cin || '-'}
          </Text>
        );
      case 'salary':
        return (
          <Text b css={{ fontSize: '$sm' }}>
            {person.salary ? `${person.salary.toFixed(2)} TND` : '-'}
          </Text>
        );
      case 'status':
        return (
          <Tooltip content={person.isPayed ? 'Click to mark as unpaid' : 'Click to mark as paid'}>
            <Badge
              color={person.isPayed ? 'success' : 'warning'}
              variant="flat"
              css={{ cursor: 'pointer' }}
              onClick={() => handleTogglePayment(person._id!, person.isPayed || false)}
            >
              {person.isPayed ? 'Paid' : 'Unpaid'}
            </Badge>
          </Tooltip>
        );
      case 'actions':
        return (
          <Flex css={{ gap: '$2' }}>
            <Button
              size="xs"
              auto
              flat
              color="primary"
              onClick={() => openEditModal(person)}
              disabled={loading}
            >
              Edit
            </Button>
            <Button
              size="xs"
              auto
              flat
              color="error"
              onClick={() => person._id && handleDelete(person._id, person.name)}
              disabled={loading}
            >
              Delete
            </Button>
          </Flex>
        );
      default:
        return <Text>{(person as any)[columnKey]}</Text>;
    }
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
        <Text h3 css={{ '@xsMax': { fontSize: '$xl' } }}>
          Personnel Management
        </Text>
        <Flex css={{ gap: '$4' }}>
          <Button auto color="primary" onClick={openAddModal} css={{ '@xsMax': { minWidth: 'auto', px: '$8' } }}>
            + Add
          </Button>
          {onRefresh && (
            <Button auto flat onClick={onRefresh} css={{ '@xsMax': { minWidth: 'auto', px: '$8' } }}>
              🔄 Refresh
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Search & Filter */}
      <Flex css={{ gap: '$4', mb: '$6' }} wrap="wrap" align="center">
        <Input
          clearable
          placeholder="Search personnel..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          css={{ flex: 1, minWidth: '200px' }}
        />
        <Dropdown>
          <Dropdown.Button flat size="sm">
            Filter: {filterStatus === 'all' ? 'All' : filterStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </Dropdown.Button>
          <Dropdown.Menu
            aria-label="Filter options"
            onAction={(key) => setFilterStatus(key as any)}
            selectedKeys={[filterStatus]}
            selectionMode="single"
          >
            <Dropdown.Item key="all">All Personnel</Dropdown.Item>
            <Dropdown.Item key="paid">Paid Only</Dropdown.Item>
            <Dropdown.Item key="unpaid">Unpaid Only</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Flex>

      {/* Table */}
      <Box css={{ overflowX: 'auto' }}>
        <Table
          aria-label="Personnel table"
          css={{
            minWidth: '100%',
            '@xsMax': { fontSize: '$xs' },
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
          <Table.Body items={filteredPersonnel}>
            {(item) => (
              <Table.Row key={item._id}>
                {(columnKey) => <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>}
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Box>

      {/* Empty State */}
      {filteredPersonnel.length === 0 && (
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