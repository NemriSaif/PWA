import React, { useState, useMemo } from 'react';
import { Button, Input, Table, Text, Badge, Card, Tooltip, Grid } from '@nextui-org/react';
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
  readOnly?: boolean;
}

type SortColumn = 'date' | 'chantier' | 'personnel' | 'vehicles' | 'totalCost';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

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
  readOnly = false,
}: DailyAssignmentsProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<DailyAssignmentData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Helper function to get chantier name
  const getChantierName = (chantier: string | ChantierData): string => {
    if (typeof chantier === 'object') return chantier.name;
    const found = chantiers.find(c => c._id === chantier);
    return found?.name || 'Unknown';
  };

  const filteredAssignments = useMemo(() => {
    let filtered = Array.isArray(assignments) ? assignments : [];

    if (searchValue) {
      filtered = filtered.filter((a) => {
        const chantierName = getChantierName(a.chantier);
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

    // Sort assignments
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'chantier':
          aValue = getChantierName(a.chantier).toLowerCase();
          bValue = getChantierName(b.chantier).toLowerCase();
          break;
        case 'personnel':
          aValue = a.personnelAssignments?.length || 0;
          bValue = b.personnelAssignments?.length || 0;
          break;
        case 'vehicles':
          aValue = a.vehiculeAssignments?.length || 0;
          bValue = b.vehiculeAssignments?.length || 0;
          break;
        case 'totalCost':
          aValue = a.totalCost || 0;
          bValue = b.totalCost || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [assignments, searchValue, selectedDate, sortColumn, sortDirection, chantiers]);

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

  // Sort handler
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Responsive view mode default
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 650 && viewMode === 'table') {
        setViewMode('grid');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Sort indicator
  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
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
          {readOnly ? 'My Assignments' : 'Daily Assignments'}
        </Text>
        <Flex css={{ gap: '$4' }}>
          {!readOnly && (
            <Button auto color="primary" onClick={openAddModal}>
              + New Assignment
            </Button>
          )}
          {onRefresh && (
            <Button auto flat onClick={onRefresh}>
              🔄 Refresh
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Search & Date Filter & View Toggle */}
      <Flex css={{ gap: '$4', mb: '$6', flexWrap: 'wrap' }} align="center">
        <Input
          clearable
          placeholder="Search by work site..."
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
        
        {/* View Toggle */}
        <Flex css={{ gap: '$2' }}>
          <Tooltip content="Grid View">
            <Button
              auto
              flat={viewMode !== 'grid'}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
              css={{ minWidth: 'auto', px: '$8' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Table View">
            <Button
              auto
              flat={viewMode !== 'table'}
              color={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => setViewMode('table')}
              css={{ minWidth: 'auto', px: '$8', '@xsMax': { display: 'none' } }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      {/* Table View */}
      {viewMode === 'table' && (
        <Box css={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--nextui-colors-border)' }}>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('date')}
                >
                  <Text b size="$xs">DATE{getSortIndicator('date')}</Text>
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('chantier')}
                >
                  <Text b size="$xs">WORK SITE{getSortIndicator('chantier')}</Text>
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('personnel')}
                >
                  <Text b size="$xs">PERSONNEL{getSortIndicator('personnel')}</Text>
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('vehicles')}
                >
                  <Text b size="$xs">VEHICLES{getSortIndicator('vehicles')}</Text>
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('totalCost')}
                >
                  <Text b size="$xs">TOTAL COST{getSortIndicator('totalCost')}</Text>
                </th>
                {!readOnly && (
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Text b size="$xs">ACTIONS</Text>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr 
                  key={assignment._id}
                  style={{ 
                    borderBottom: '1px solid var(--nextui-colors-border)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--nextui-colors-accents1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Text b size="$sm">{new Date(assignment.date).toLocaleDateString('en-GB')}</Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Text b>{getChantierName(assignment.chantier)}</Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color="primary" variant="flat">
                      {assignment.personnelAssignments?.length || 0} workers
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color="warning" variant="flat">
                      {assignment.vehiculeAssignments?.length || 0} vehicles
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Text b color="success">{(assignment.totalCost || 0).toFixed(2)} TND</Text>
                  </td>
                  {!readOnly && (
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Flex css={{ gap: '$2', justifyContent: 'center' }}>
                        <Button
                          size="xs"
                          auto
                          flat
                          color="primary"
                          onClick={() => openEditModal(assignment)}
                          disabled={loading}
                        >
                          Edit
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid.Container gap={2}>
          {filteredAssignments.map((assignment) => (
            <Grid xs={12} sm={6} md={4} key={assignment._id}>
              <Card
                variant="bordered"
                css={{
                  p: '$12',
                  w: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '$lg',
                  },
                }}
              >
                <Flex direction="column" css={{ gap: '$6' }}>
                  {/* Header */}
                  <Flex justify="between" align="start">
                    <Box>
                      <Text b size="$lg">{getChantierName(assignment.chantier)}</Text>
                      <Text size="$sm" color="$accents7">
                        {new Date(assignment.date).toLocaleDateString('en-GB')}
                      </Text>
                    </Box>
                    <Badge color="success" variant="flat">
                      {(assignment.totalCost || 0).toFixed(0)} TND
                    </Badge>
                  </Flex>

                  {/* Details */}
                  <Flex direction="column" css={{ gap: '$3' }}>
                    <Flex align="center" css={{ gap: '$2' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <Text size="$sm">
                        <Text b span>{assignment.personnelAssignments?.length || 0}</Text> Personnel
                      </Text>
                      <Text size="$xs" color="$accents7">
                        ({(assignment.totalPersonnelCost || 0).toFixed(0)} TND)
                      </Text>
                    </Flex>
                    <Flex align="center" css={{ gap: '$2' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13"/>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      <Text size="$sm">
                        <Text b span>{assignment.vehiculeAssignments?.length || 0}</Text> Vehicles
                      </Text>
                      <Text size="$xs" color="$accents7">
                        ({(assignment.totalFuelCost || 0).toFixed(0)} TND)
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Actions */}
                  {!readOnly && (
                    <Flex css={{ gap: '$2', mt: '$2' }}>
                      <Button
                        size="sm"
                        auto
                        flat
                        color="primary"
                        onClick={() => openEditModal(assignment)}
                        disabled={loading}
                        css={{ flex: 1 }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        auto
                        flat
                        color="error"
                        onClick={() => assignment._id && handleDelete(assignment._id)}
                        disabled={loading}
                        css={{ minWidth: 'auto', px: '$8' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Card>
            </Grid>
          ))}
        </Grid.Container>
      )}

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <Box css={{ textAlign: 'center', py: '$20' }}>
          <Text h4 color="$accents7">
            {searchValue || selectedDate ? 'No assignments found' : readOnly ? 'No assignments assigned to you yet' : 'No assignments yet'}
          </Text>
          {!searchValue && !selectedDate && !readOnly && (
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
        />
      )}
    </Box>
  );
};