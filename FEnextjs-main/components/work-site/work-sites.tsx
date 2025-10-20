import React, { useState } from 'react';
import { Button, Input, Table, Text, Badge, Grid, Card } from '@nextui-org/react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import { WorkSiteData } from '../../pages/work-sites';
import { WorksiteModal } from './worksiteModal';

interface WorkSitesProps {
  workSites?: WorkSiteData[]; // optional to prevent runtime crashes
  onAdd?: (data: WorkSiteData) => Promise<{ success: boolean; message: string }>;
  onEdit?: (data: WorkSiteData) => Promise<{ success: boolean; message: string }>;
  onDelete?: (id: string) => Promise<{ success: boolean; message: string }>;
  onRefresh?: () => void;
}

export const WorkSites = ({
  workSites = [], // ✅ default empty array
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
}: WorkSitesProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorksite, setEditingWorksite] = useState<WorkSiteData | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Safe filtering (handles undefined or wrong type)
  const filteredWorkSites = Array.isArray(workSites)
    ? workSites.filter(
        (w) =>
          w.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          w.location?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

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

  const getStatus = (workSite: WorkSiteData) => {
    if (!workSite.startDate) return 'Pending';
    if (workSite.endDate && new Date(workSite.endDate) < new Date()) return 'Completed';
    if (new Date(workSite.startDate) > new Date()) return 'Scheduled';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'default';
      case 'Scheduled':
        return 'warning';
      case 'Pending':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const renderCell = (workSite: WorkSiteData, columnKey: React.Key) => {
    switch (columnKey) {
      case '_id':
        return <Text css={{ fontSize: '$xs' }}>{workSite._id?.slice(-6)}</Text>;
      case 'name':
        return <Text b>{workSite.name}</Text>;
      case 'location':
        return <Text>{workSite.location}</Text>;
      case 'startDate':
        return (
          <Text css={{ fontSize: '$sm' }}>
            {workSite.startDate ? new Date(workSite.startDate).toLocaleDateString() : '-'}
          </Text>
        );
      case 'endDate':
        return (
          <Text css={{ fontSize: '$sm' }}>
            {workSite.endDate ? new Date(workSite.endDate).toLocaleDateString() : '-'}
          </Text>
        );
      case 'status':
        const status = getStatus(workSite);
        return (
          <Badge color={getStatusColor(status)} variant="flat">
            {status}
          </Badge>
        );
      case 'actions':
        return (
          <Flex css={{ gap: '$2' }}>
            <Button size="xs" auto flat color="primary" onClick={() => openEditModal(workSite)} disabled={loading}>
              Edit
            </Button>
            <Button
              size="xs"
              auto
              flat
              color="error"
              onClick={() => workSite._id && handleDelete(workSite._id)}
              disabled={loading}
            >
              Delete
            </Button>
          </Flex>
        );
      default:
        return <Text>{(workSite as any)[columnKey]}</Text>;
    }
  };

  const columns = [
    { name: 'ID', uid: '_id' },
    { name: 'Name', uid: 'name' },
    { name: 'Location', uid: 'location' },
    { name: 'Start Date', uid: 'startDate' },
    { name: 'End Date', uid: 'endDate' },
    { name: 'Status', uid: 'status' },
    { name: 'Actions', uid: 'actions' },
  ];

  return (
    <Box css={{ px: '$6', mt: '$8', '@xsMax': { px: '$4' } }}>
      {/* ✅ Notification Toast */}
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

      {/* Header */}
      <Flex justify="between" align="center" wrap="wrap" css={{ gap: '$4', mb: '$6' }}>
        <Text h3 css={{ '@xsMax': { fontSize: '$xl' } }}>
          Work Sites Management
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

      {/* Search & View Toggle */}
      <Flex css={{ gap: '$4', mb: '$6' }} wrap="wrap" align="center">
        <Input
          clearable
          placeholder="Search work sites..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          css={{ flex: 1, minWidth: '200px' }}
        />
        <Button.Group size="sm">
          <Button flat={viewMode !== 'table'} onClick={() => setViewMode('table')}>
            📋 Table
          </Button>
          <Button flat={viewMode !== 'grid'} onClick={() => setViewMode('grid')}>
            🎴 Grid
          </Button>
        </Button.Group>
      </Flex>

      {/* Table View */}
      {viewMode === 'table' && (
        <Box css={{ overflowX: 'auto' }}>
          <Table
            aria-label="Work sites table"
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
            <Table.Body items={filteredWorkSites}>
              {(item) => (
                <Table.Row key={item._id}>
                  {(columnKey) => <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>}
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Box>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid.Container gap={2}>
          {filteredWorkSites.map((workSite) => {
            const status = getStatus(workSite);
            return (
              <Grid xs={12} sm={6} md={4} key={workSite._id}>
                <Card css={{ p: '$10', w: '100%' }}>
                  <Flex direction="column" css={{ gap: '$4' }}>
                    <Flex justify="between" align="center">
                      <Text b size="$lg">
                        {workSite.name}
                      </Text>
                      <Badge color={getStatusColor(status)} variant="flat">
                        {status}
                      </Badge>
                    </Flex>
                    <Text css={{ fontSize: '$sm', color: '$accents7' }}>📍 {workSite.location}</Text>
                    {workSite.note && (
                      <Text css={{ fontSize: '$sm', color: '$accents8' }}>
                        {workSite.note.length > 100 ? workSite.note.substring(0, 100) + '...' : workSite.note}
                      </Text>
                    )}
                    <Flex css={{ gap: '$4', fontSize: '$xs', color: '$accents8' }}>
                      <Box>
                        <Text css={{ fontSize: '$xs', color: '$accents7' }}>Start:</Text>
                        <Text css={{ fontSize: '$xs' }}>
                          {workSite.startDate ? new Date(workSite.startDate).toLocaleDateString() : '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Text css={{ fontSize: '$xs', color: '$accents7' }}>End:</Text>
                        <Text css={{ fontSize: '$xs' }}>
                          {workSite.endDate ? new Date(workSite.endDate).toLocaleDateString() : '-'}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex css={{ gap: '$4', mt: '$4' }}>
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
                  </Flex>
                </Card>
              </Grid>
            );
          })}
        </Grid.Container>
      )}

      {/* Empty State */}
      {filteredWorkSites.length === 0 && (
        <Box css={{ textAlign: 'center', py: '$20' }}>
          <Text h4 color="$accents7">
            {searchValue ? 'No work sites found' : 'No work sites yet'}
          </Text>
          {!searchValue && (
            <Button auto color="primary" css={{ mt: '$4' }} onClick={openAddModal}>
              Add Your First Work Site
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
