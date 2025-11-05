import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { offlineGet, apiPatch, apiDelete } from '../utils/apiClient';
import { getUserRole } from '../utils/auth';
import {
  Card,
  Grid,
  Text,
  Button,
  Table,
  Badge,
  Loading,
} from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { Flex } from '../components/styles/flex';

interface Order {
  _id: string;
  manager: { name: string; email: string };
  supplier: { name: string; email: string; company?: string };
  stockItem: { name: string; unit: string; price: number };
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
}

const Orders: NextPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'manager' | 'fournisseur'>('manager');

  useEffect(() => {
    fetchOrders();
    const role = getUserRole();
    setUserRole(role as 'manager' | 'fournisseur' || 'manager');
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await offlineGet<Order>('/order', 'order');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiPatch(`/order/${orderId}`, { status }, 'order');
      await fetchOrders();
      
      // Show success message based on action
      const messages: Record<string, string> = {
        'confirmed': '✅ Order accepted!',
        'cancelled': '❌ Order declined',
        'delivered': '🚚 Order marked as delivered!',
      };
      
      alert(messages[status] || 'Order updated successfully');
    } catch (error: any) {
      if (error.message.includes('queued')) {
        alert('✅ Status update queued for sync');
      } else {
        console.error('Error updating order:', error);
        alert(error.response?.data?.message || 'Error updating order status');
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Delete this order?')) return;
    
    try {
      await apiDelete(`/order/${orderId}`, 'order');
      await fetchOrders();
    } catch (error: any) {
      if (error.message.includes('queued')) {
        alert('✅ Delete queued for sync');
      } else {
        alert('Error deleting order');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box css={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loading size="xl" />
      </Box>
    );
  }

  return (
    <Box css={{ 
      px: '$8', 
      py: '$6',
      '@xs': { px: '$4', py: '$4' },
      '@sm': { px: '$6' },
    }}>
      {/* Header */}
      <Flex
        justify="between"
        align="center"
        css={{
          mb: '$8',
          flexWrap: 'wrap',
          gap: '$4',
          '@xs': { flexDirection: 'column', alignItems: 'flex-start', mb: '$6' },
        }}
      >
        <Text
          h1
          css={{
            fontSize: '$2xl',
            '@xs': { fontSize: '$lg' },
            '@sm': { fontSize: '$xl' },
          }}
        >
          📦 {userRole === 'manager' ? 'My Orders' : 'Incoming Orders'}
        </Text>
        <Flex css={{ gap: '$2', '@xs': { width: '100%', flexDirection: 'column' } }}>
          <Badge color="primary" variant="flat">
            Total: {orders.length}
          </Badge>
          <Badge color="warning" variant="flat">
            Pending: {orders.filter(o => o.status === 'pending').length}
          </Badge>
        </Flex>
      </Flex>

      {/* Mobile: Cards View */}
      <Box css={{ '@md': { display: 'none' } }}>
        <Grid.Container gap={2}>
          {orders.map((order) => (
            <Grid xs={12} key={order._id}>
              <Card variant="bordered" css={{ w: '100%', p: '$4' }}>
                <Card.Header css={{ pb: '$2' }}>
                  <Flex justify="between" align="center" css={{ w: '100%' }}>
                    <Text b size="$sm">{order.stockItem.name}</Text>
                    <Badge color={getStatusColor(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </Flex>
                </Card.Header>
                <Card.Body css={{ py: '$4' }}>
                  <Flex direction="column" css={{ gap: '$2' }}>
                    <Text size="$xs" color="$accents7">
                      {userRole === 'manager' ? '🏢 Supplier' : '👤 Manager'}: {' '}
                      <Text b span size="$xs">
                        {userRole === 'manager' ? order.supplier.company || order.supplier.name : order.manager.name}
                      </Text>
                    </Text>
                    <Text size="$xs" color="$accents7">
                      📊 Quantity: <Text b span>{order.quantity} {order.stockItem.unit}</Text>
                    </Text>
                    <Text size="$xs" color="$accents7">
                      💰 Total: <Text b span color="$green600">{order.totalPrice.toFixed(2)} TND</Text>
                    </Text>
                    <Text size="$xs" color="$accents7">
                      📅 {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Card.Body>
                <Card.Footer css={{ pt: '$2' }}>
                  <Flex css={{ gap: '$2', w: '100%', flexDirection: 'column' }}>
                    {userRole === 'fournisseur' && order.status === 'pending' && (
                      <Flex css={{ gap: '$2' }}>
                        <Button
                          size="sm"
                          color="success"
                          css={{ flex: 1, minHeight: '44px' }}
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        >
                          ✅ Accept
                        </Button>
                        <Button
                          size="sm"
                          color="error"
                          flat
                          css={{ flex: 1, minHeight: '44px' }}
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        >
                          ❌ Decline
                        </Button>
                      </Flex>
                    )}
                    {userRole === 'fournisseur' && order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        color="primary"
                        css={{ w: '100%', minHeight: '44px' }}
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                      >
                        🚚 Mark as Delivered
                      </Button>
                    )}
                    {userRole === 'manager' && order.status === 'pending' && (
                      <Button
                        size="sm"
                        color="error"
                        flat
                        css={{ w: '100%', minHeight: '44px' }}
                        onClick={() => deleteOrder(order._id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </Flex>
                </Card.Footer>
              </Card>
            </Grid>
          ))}
        </Grid.Container>
      </Box>

      {/* Desktop: Table View */}
      <Box css={{ '@xs': { display: 'none' }, '@md': { display: 'block' } }}>
        <Card css={{ p: '$6' }}>
          <Table
            aria-label="Orders table"
            css={{
              height: 'auto',
              minWidth: '100%',
            }}
          >
            <Table.Header>
              <Table.Column>ITEM</Table.Column>
              <Table.Column>{userRole === 'manager' ? 'SUPPLIER' : 'MANAGER'}</Table.Column>
              <Table.Column>QUANTITY</Table.Column>
              <Table.Column>TOTAL</Table.Column>
              <Table.Column>STATUS</Table.Column>
              <Table.Column>DATE</Table.Column>
              <Table.Column>ACTIONS</Table.Column>
            </Table.Header>
            <Table.Body>
              {orders.map((order) => (
                <Table.Row key={order._id}>
                  <Table.Cell>{order.stockItem.name}</Table.Cell>
                  <Table.Cell>
                    {userRole === 'manager' 
                      ? order.supplier.company || order.supplier.name
                      : order.manager.name
                    }
                  </Table.Cell>
                  <Table.Cell>{order.quantity} {order.stockItem.unit}</Table.Cell>
                  <Table.Cell>
                    <Text b color="success">{order.totalPrice.toFixed(2)} TND</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
                  </Table.Cell>
                  <Table.Cell>{new Date(order.createdAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Flex css={{ gap: '$2' }}>
                      {userRole === 'fournisseur' && order.status === 'pending' && (
                        <>
                          <Button
                            size="xs"
                            color="success"
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          >
                            ✅ Accept
                          </Button>
                          <Button
                            size="xs"
                            color="error"
                            flat
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          >
                            ❌ Decline
                          </Button>
                        </>
                      )}
                      {userRole === 'fournisseur' && order.status === 'confirmed' && (
                        <Button
                          size="xs"
                          color="primary"
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                        >
                          🚚 Delivered
                        </Button>
                      )}
                      {userRole === 'manager' && order.status === 'pending' && (
                        <Button
                          size="xs"
                          color="error"
                          flat
                          onClick={() => deleteOrder(order._id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <Text size="$xs" color="$accents6">—</Text>
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </Box>
    </Box>
  );
};

export default Orders;
