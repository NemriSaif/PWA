import React, { useState, useMemo } from 'react';
import { Button, Input, Table, Text, Badge, Card, Grid, Dropdown } from '@nextui-org/react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import {
  DailyAssignmentData,
  PersonnelData,
  VehiculeData,
  ChantierData,
} from '../../pages/daily-assignments';
import { DailyAssignmentModal } from './DailyAssignmentModal';

interface DailyAssignmentsProps {
  assignments?: DailyAssignmentData[];
  personnel?: PersonnelData[];
  vehicules?: VehiculeData[];
  chantiers?: ChantierData[];
  onAdd?: (data: DailyAssignmentData) => Promise<{ success: boolean; message: string }>;
  onEdit?: (data: DailyAssignmentData) => Promise<{ success: boolean; message: string }>;
  onDelete?: (id: string) => Promise<{ success: boolean; message: string }>;
  onMarkPaid?: (assignmentId: string, personnelId: string) => Promise<{ success: boolean; message: string }>;
  onRefresh?: () => void;
}

export const DailyAssignments = ({
  assignments = [],
  personnel = [],
  vehicules = [],
  chantiers = [],
  onAdd,
  onEdit,
  onDelete,
  onMarkPaid,
  onRefresh,
}: DailyAssignmentsProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<DailyAssignmentData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredAssignments = useMemo(() => {
    let filtered = Array.isArray(assignments) ? assignments : [];

    if (searchValue) {
      filtered = filtered.filter((a) => {
        const chantierName = typeof a.chantier === 'object' ? a.chantier.name : '';
        return (
          chantierName.toLowerCase().includes(searchValue.toLowerCase()) ||
          new Date(a.date).toLocaleDateString().includes(searchValue)
        );
      });
    }

    if (selectedDate) {
      filtered = filtered.filter((a) => {
        const assignmentDate = new Date(a.date).toISOString().split('T')[0];
        return assignmentDate === selectedDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assignments, searchValue, selectedDate]);

  const stats = useMemo(() => {
    const todayAssignments = assignments.filter((a) => {
      const assignmentDate = new Date(a.date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return assignmentDate === today;
    });

    const totalPersonnelCost = todayAssignments.reduce((sum, a) => sum + (a.totalPersonnelCost || 0), 0);
    const totalFuelCost = todayAssignments.reduce((sum, a) => sum + (a.totalFuelCost || 0), 0);
    const totalCost = todayAssignments.reduce((sum, a) => sum + (a.totalCost || 0), 0);

    return {
      todayAssignments: todayAssignments.length,
      totalPersonnelCost,
      totalFuelCost,
      totalCost,
    };
  }, [assignments]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setEditingAssignment(null);
    setModalVisible(true);
  };

  const openEditModal = (assignment: DailyAssignmentData) => {
    setEditingAssignment(assignment);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    setLoading(true);
    if (onDelete) {
      const result = await onDelete(id);
      showNotification(result.success ? 'success' : 'error', result.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (data: DailyAssignmentData) => {
    setLoading(true);
    let result;

    if (editingAssignment && onEdit) {
      result = await onEdit({ ...editingAssignment, ...data });
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

  const getChantierName = (chantier: string | ChantierData) => {
    return typeof chantier === 'object' ? chantier.name : 'Unknown';
  };

  const columns = [
    { name: 'DATE', uid: 'date' },
    { name: 'WORK SITE', uid: 'chantier' },
    { name: 'PERSONNEL', uid: 'personnel' },
    { name: 'VEHICLES', uid: 'vehicles' },
    { name: 'PERSONNEL COST', uid: 'personnelCost' },
    { name: 'FUEL COST', uid: 'fuelCost' },
    { name: 'TOTAL COST', uid: 'totalCost' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  const renderCell = (assignment: DailyAssignmentData, columnKey: React.Key) => {
    switch (columnKey) {
      case 'date':
        return (
          <Text b css={{ fontSize: '$sm' }}>
            {new Date(assignment.date).toLocaleDateString('en-GB')}
          </Text>
        );
      case 'chantier':
        return <Text b>{getChantierName(assignment.chantier)}</Text>;
      case 'personnel':
        return (
          <Text css={{ fontSize: '$sm' }}>
            {assignment.personnelAssignments?.length || 0} assigned
          </Text>
        );
      case 'vehicles':
        return (
          <Text css={{ fontSize: '$sm' }}>
            {assignment.vehiculeAssignments?.length || 0} assigned
          </Text>
        );
      case 'personnelCost':
        return (
          <Text b css={{ fontSize: '$sm', color: '$primary' }}>
            {(assignment.totalPersonnelCost || 0).toFixed(2)} TND
          </Text>
        );
      case 'fuelCost':
        return (
          <Text b css={{ fontSize: '$sm', color: '$warning' }}>
            {(assignment.totalFuelCost || 0).toFixed(2)} TND
          </Text>
        );
      case 'totalCost':
        return (
          <Text b css={{ fontSize: '$sm', color: '$success' }}>
            {(assignment.totalCost || 0).toFixed(2)} TND
          </Text>
        );
      case 'actions':
        return (
          <Flex css={{ gap: '$2' }}>
            <Button
              size="xs"
              auto
              flat
              color="primary"
              onClick={() => openEditModal(assignment)}
              disabled={loading}
            >
              View/Edit
            </Button>
            <Button
              size="xs"
              auto
              flat
              color="error"
              onClick={() => assignment._id && handleDelete(assignment._id)}
              disabled={loading}
            >
              Delete
            </Button>
          </Flex>
        );
      default:
        return <Text>{(assignment as any)[columnKey]}</Text>;
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
              {stats.todayAssignments}
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Today;s Assignments</Text>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%', borderColor: '$primary' }}>
            <Text h4 css={{ m: 0, color: '$primary' }}>
              {stats.totalPersonnelCost.toFixed(2)} TND
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Personnel Costs Today</Text>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%', borderColor: '$warning' }}>
            <Text h4 css={{ m: 0, color: '$warning' }}>
              {stats.totalFuelCost.toFixed(2)} TND
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Fuel Costs Today</Text>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card css={{ p: '$10', w: '100%', borderColor: '$success' }}>
            <Text h4 css={{ m: 0, color: '$success' }}>
              {stats.totalCost.toFixed(2)} TND
            </Text>
            <Text css={{ fontSize: '$sm', color: '$accents7' }}>Total Costs Today</Text>
          </Card>
        </Grid>
      </Grid.Container>

      {/* Header */}
      <Flex justify="between" align="center" wrap="wrap" css={{ gap: '$4', mb: '$6' }}>
        <Text h3 css={{ '@xsMax': { fontSize: '$xl' } }}>
          Daily Assignments
        </Text>
        <Flex css={{ gap: '$4' }}>
          <Button auto color="primary" onClick={openAddModal}>
            + New Assignment
          </Button>
          {onRefresh && (
            <Button auto flat onClick={onRefresh}>
              🔄 Refresh
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Search & Date Filter */}
      <Flex css={{ gap: '$4', mb: '$6' }} wrap="wrap" align="center">
        <Input
          clearable
          placeholder="Search by work site or date..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          css={{ flex: 1, minWidth: '200px' }}
        />
        <Input
          type="date"
          label="Filter by Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          css={{ maxWidth: '200px' }}
        />
        <Button auto flat onClick={() => setSelectedDate('')}>
          Clear Date
        </Button>
      </Flex>

      {/* Table */}
      <Box css={{ overflowX: 'auto' }}>
        <Table
          aria-label="Daily assignments table"
          css={{ minWidth: '100%' }}
          selectionMode="none"
          lined
          hoverable
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
          <Table.Body items={filteredAssignments}>
            {(item) => (
              <Table.Row key={item._id}>
                {(columnKey) => <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>}
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Box>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <Box css={{ textAlign: 'center', py: '$20' }}>
          <Text h4 color="$accents7">
            {searchValue || selectedDate ? 'No assignments found' : 'No assignments yet'}
          </Text>
          {!searchValue && !selectedDate && (
            <Button auto color="primary" css={{ mt: '$4' }} onClick={openAddModal}>
              Create Your First Assignment
            </Button>
          )}
        </Box>
      )}

      {/* Modal */}
      {modalVisible && (
        <DailyAssignmentModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          initialData={editingAssignment || undefined}
          onSubmit={handleSubmit}
          loading={loading}
          personnel={personnel}
          vehicules={vehicules}
          chantiers={chantiers}
          onMarkPaid={onMarkPaid}
        />
      )}
    </Box>
  );
};