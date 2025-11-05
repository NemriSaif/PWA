import React, { useState, useEffect } from 'react';
import { Button, Input, Text, Badge, Grid, Card, Table, Tooltip } from '@nextui-org/react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import { WorkSiteData } from '../../pages/work-sites';
import { WorksiteModal } from './worksiteModal';

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

interface WorkSitesProps {
  workSites?: WorkSiteData[];
  onAdd?: (data: WorkSiteData) => Promise<{ success: boolean; message: string }>;
  onEdit?: (data: WorkSiteData) => Promise<{ success: boolean; message: string }>;
  onDelete?: (id: string) => Promise<{ success: boolean; message: string }>;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export const WorkSites = ({
  workSites = [],
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  readOnly = false,
}: WorkSitesProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorksite, setEditingWorksite] = useState<WorkSiteData | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortColumn, setSortColumn] = useState<'name' | 'location' | 'status' | 'startDate' | 'endDate'>('status');
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
    
    handleResize(); // Set initial view
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions
  const getStatus = (workSite: WorkSiteData) => {
    if (!workSite.startDate) return 'Pending';
    if (workSite.endDate && new Date(workSite.endDate) < new Date()) return 'Completed';
    if (new Date(workSite.startDate) > new Date()) return 'Scheduled';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'default';
      case 'Scheduled': return 'warning';
      case 'Pending': return 'secondary';
      default: return 'default';
    }
  };

  // ✅ Safe filtering (handles undefined or wrong type)
  const filteredWorkSites = Array.isArray(workSites)
    ? workSites.filter(
        (w) =>
          w.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          w.location?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

  // Sort work sites
  const sortedWorkSites = [...filteredWorkSites].sort((a, b) => {
    let comparison = 0;
    
    switch (sortColumn) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'location':
        comparison = (a.location || '').localeCompare(b.location || '');
        break;
      case 'status':
        const statusA = getStatus(a);
        const statusB = getStatus(b);
        // Custom status order: Active > Scheduled > Pending > Completed
        const statusOrder: { [key: string]: number } = {
          'Active': 1,
          'Scheduled': 2,
          'Pending': 3,
          'Completed': 4,
        };
        comparison = (statusOrder[statusA] || 5) - (statusOrder[statusB] || 5);
        break;
      case 'startDate':
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'endDate':
        const endA = a.endDate ? new Date(a.endDate).getTime() : 0;
        const endB = b.endDate ? new Date(b.endDate).getTime() : 0;
        comparison = endA - endB;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortColumn }) => {
    if (sortColumn !== column) {
      return (
        <span style={{ opacity: 0.3, marginLeft: '4px' }}>
          ↕
        </span>
      );
    }
    return (
      <span style={{ marginLeft: '4px' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setEditingWorksite(null);
    setModalVisible(true);
  };

  const openEditModal = (worksite: WorkSiteData) => {
    setEditingWorksite(worksite);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work site?')) return;

    setLoading(true);
    if (onDelete) {
      const result = await onDelete(id);
      showNotification(result.success ? 'success' : 'error', result.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (data: WorkSiteData) => {
    setLoading(true);
    let result;

    if (editingWorksite && onEdit) {
      result = await onEdit({ ...editingWorksite, ...data });
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
    <Box css={{ width: '100%', height: '100%', pb: '$10' }}>
      {/* Notification Toast */}
      {notification && (
        <Box
          css={{
            position: 'fixed',
            top: '$10',
            right: '$10',
            zIndex: 9999,
            p: '$6',
            borderRadius: '$lg',
            bg: notification.type === 'success' ? '$green600' : '$error',
            color: 'white',
            boxShadow: '$xl',
            minWidth: '300px',
            '@xsMax': {
              top: '$4',
              right: '$4',
              left: '$4',
              minWidth: 'auto',
            },
          }}
        >
          <Text b color="white">{notification.message}</Text>
        </Box>
      )}

      {/* Header */}
      <Box css={{ mb: '$8' }}>
        <Flex justify="between" align="center" wrap="wrap" css={{ gap: '$4', mb: '$6' }}>
          <Box>
            <Text h2 css={{ fontSize: '$2xl', fontWeight: '700', mb: '$2', '@xsMax': { fontSize: '$xl' } }}>
              Work Sites
            </Text>
            <Text css={{ color: '$accents7', fontSize: '$sm' }}>
              Manage construction sites and projects
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
              <Button auto flat onClick={onRefresh} disabled={loading}>
                Refresh
              </Button>
            )}
            {!readOnly && (
              <Button auto color="success" onClick={openAddModal} disabled={loading}>
                + Add Work Site
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Search */}
        <Flex css={{ gap: '$4', flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            clearable
            bordered
            fullWidth
            placeholder="Search by name or location..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            css={{ maxWidth: '500px', flex: 1 }}
          />
          
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
                <option value="status">Status</option>
                <option value="name">Name</option>
                <option value="location">Location</option>
                <option value="startDate">Start Date</option>
                <option value="endDate">End Date</option>
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
      </Box>

      {/* Content - Table or Grid View */}
      {sortedWorkSites.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <Table
            lined
            headerLined
            shadow={false}
            aria-label="Work sites table"
            css={{
              height: 'auto',
              minWidth: '100%',
            }}
          >
            <Table.Header>
              <Table.Column>
                <Box 
                  as="button"
                  onClick={() => handleSort('name')}
                  css={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '600',
                    fontSize: '$xs',
                    color: '$accents7',
                    padding: 0,
                    '&:hover': {
                      color: '$text',
                    },
                  }}
                >
                  NAME <SortIcon column="name" />
                </Box>
              </Table.Column>
              <Table.Column>
                <Box 
                  as="button"
                  onClick={() => handleSort('location')}
                  css={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '600',
                    fontSize: '$xs',
                    color: '$accents7',
                    padding: 0,
                    '&:hover': {
                      color: '$text',
                    },
                  }}
                >
                  LOCATION <SortIcon column="location" />
                </Box>
              </Table.Column>
              <Table.Column>
                <Box 
                  as="button"
                  onClick={() => handleSort('status')}
                  css={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '600',
                    fontSize: '$xs',
                    color: '$accents7',
                    padding: 0,
                    '&:hover': {
                      color: '$text',
                    },
                  }}
                >
                  STATUS <SortIcon column="status" />
                </Box>
              </Table.Column>
              <Table.Column>
                <Box 
                  as="button"
                  onClick={() => handleSort('startDate')}
                  css={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '600',
                    fontSize: '$xs',
                    color: '$accents7',
                    padding: 0,
                    '&:hover': {
                      color: '$text',
                    },
                  }}
                >
                  START DATE <SortIcon column="startDate" />
                </Box>
              </Table.Column>
              <Table.Column>
                <Box 
                  as="button"
                  onClick={() => handleSort('endDate')}
                  css={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '600',
                    fontSize: '$xs',
                    color: '$accents7',
                    padding: 0,
                    '&:hover': {
                      color: '$text',
                    },
                  }}
                >
                  END DATE <SortIcon column="endDate" />
                </Box>
              </Table.Column>
              <Table.Column>ACTIONS</Table.Column>
            </Table.Header>
            <Table.Body>
              {sortedWorkSites.map((workSite) => {
                const status = getStatus(workSite);
                return (
                  <Table.Row key={workSite._id}>
                    <Table.Cell>
                      <Text b css={{ fontSize: '$sm' }}>{workSite.name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text css={{ fontSize: '$sm', color: '$accents7' }}>
                        {workSite.location}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusColor(status)} variant="flat" size="sm">
                        {status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text css={{ fontSize: '$sm' }}>
                        {workSite.startDate
                          ? new Date(workSite.startDate).toLocaleDateString()
                          : '-'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text css={{ fontSize: '$sm' }}>
                        {workSite.endDate
                          ? new Date(workSite.endDate).toLocaleDateString()
                          : '-'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      {!readOnly && (
                        <Flex css={{ gap: '$2' }}>
                          <Button
                            size="sm"
                            flat
                            color="primary"
                            onClick={() => openEditModal(workSite)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            flat
                            color="error"
                            onClick={() => workSite._id && handleDelete(workSite._id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </Flex>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        ) : (
          /* Grid View */
          <Grid.Container gap={2}>
            {sortedWorkSites.map((workSite) => {
              const status = getStatus(workSite);
              return (
                <Grid xs={12} sm={6} md={4} key={workSite._id}>
                  <Card
                    variant="bordered"
                    css={{
                      p: '$6',
                      height: '100%',
                      borderRadius: '$lg',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '$green600',
                        boxShadow: '$md',
                      },
                    }}
                  >
                    <Flex direction="column" css={{ height: '100%', gap: '$4' }}>
                      {/* Header */}
                      <Flex justify="between" align="start">
                        <Box css={{ flex: 1 }}>
                          <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$2' }}>
                            {workSite.name}
                          </Text>
                          <Text css={{ fontSize: '$sm', color: '$accents7' }}>
                            {workSite.location}
                          </Text>
                        </Box>
                        <Badge color={getStatusColor(status)} variant="flat" size="sm">
                          {status}
                        </Badge>
                      </Flex>

                      {/* Note */}
                      {workSite.note && (
                        <Text css={{ fontSize: '$sm', color: '$accents8', lineHeight: '1.5' }}>
                          {workSite.note.length > 100
                            ? `${workSite.note.substring(0, 100)}...`
                            : workSite.note}
                        </Text>
                      )}

                      {/* Dates */}
                      <Box css={{ mt: 'auto' }}>
                        <Flex css={{ gap: '$8', mb: '$4' }}>
                          <Box>
                            <Text css={{ fontSize: '$xs', color: '$accents6', mb: '$1' }}>
                              Start Date
                            </Text>
                            <Text css={{ fontSize: '$sm', fontWeight: '500' }}>
                              {workSite.startDate
                                ? new Date(workSite.startDate).toLocaleDateString()
                                : 'Not set'}
                            </Text>
                          </Box>
                          <Box>
                            <Text css={{ fontSize: '$xs', color: '$accents6', mb: '$1' }}>
                              End Date
                            </Text>
                            <Text css={{ fontSize: '$sm', fontWeight: '500' }}>
                              {workSite.endDate
                                ? new Date(workSite.endDate).toLocaleDateString()
                                : 'Not set'}
                            </Text>
                          </Box>
                        </Flex>

                        {/* Actions */}
                        {!readOnly && (
                          <Flex css={{ gap: '$2' }}>
                            <Button
                              size="sm"
                              flat
                              color="primary"
                              css={{ flex: 1 }}
                              onClick={() => openEditModal(workSite)}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              flat
                              color="error"
                              css={{ flex: 1 }}
                              onClick={() => workSite._id && handleDelete(workSite._id)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </Flex>
                        )}
                      </Box>
                    </Flex>
                  </Card>
                </Grid>
              );
            })}
          </Grid.Container>
        )
      ) : (
        /* Empty State */
        <Box css={{ textAlign: 'center', py: '$20' }}>
          <Box
            css={{
              width: '80px',
              height: '80px',
              borderRadius: '$rounded',
              background: '$green100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto $8',
            }}
          >
            <Text css={{ fontSize: '40px' }}>🏗️</Text>
          </Box>
          <Text h3 css={{ fontSize: '$xl', fontWeight: '600', mb: '$2' }}>
            {searchValue ? 'No work sites found' : 'No work sites yet'}
          </Text>
          <Text css={{ color: '$accents7', mb: '$6', maxWidth: '400px', margin: '0 auto $6' }}>
            {searchValue
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first work site'}
          </Text>
          {!searchValue && (
            <Button auto color="success" onClick={openAddModal}>
              + Add Work Site
            </Button>
          )}
        </Box>
      )}

      {/* Modal */}
      {modalVisible && (
        <WorksiteModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          initialData={editingWorksite || undefined}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </Box>
  );
};
